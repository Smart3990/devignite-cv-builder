import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { clerk, isAuthenticated, getUserId, clerkClient } from "./clerkAuth";
import { insertCvSchema, insertOrderSchema, PRICING_TIERS, type PricingTier } from "@shared/schema";
import { z } from "zod";
// @ts-ignore - paystack doesn't have type definitions
import paystack from "paystack";
import { optimizeCVContent, generateCoverLetter, optimizeLinkedInProfile, analyzeCVForATS } from "./lib/ai-cv-optimizer";
import { requireAdmin, requirePlan, hasFeatureAccess, hasReachedLimit } from "./middleware/rbac";
import multer from "multer";
import path from "path";
import fs from "fs";
import pricingConfig from "../config/pricing.json";

// Safely initialize Paystack client - gracefully handle missing key in development
const paystackClient = process.env.PAYSTACK_SECRET_KEY 
  ? paystack(process.env.PAYSTACK_SECRET_KEY)
  : null;

// Configure multer for file uploads
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage_multer = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage_multer,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WebP) are allowed!'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Clerk authentication middleware
  app.use(clerk);

  // Webhook handler to sync Clerk users to database (before routes)
  app.post('/api/webhooks/clerk', async (req, res) => {
    try {
      const { type, data } = req.body;
      
      if (type === 'user.created') {
        // New user - assign Basic plan
        const { id, email_addresses, first_name, last_name, image_url } = data;
        await storage.upsertUser({
          id,
          email: email_addresses?.[0]?.email_address || '',
          firstName: first_name || '',
          lastName: last_name || '',
          profileImageUrl: image_url || null,
          // Explicitly set Basic plan ONLY for new users
          currentPlan: 'basic',
          planStartDate: new Date(),
        });
        console.log(`✅ New user created: ${id}, assigned to Basic plan`);
      } else if (type === 'user.updated') {
        // Existing user - update profile info but PRESERVE their current plan
        const { id, email_addresses, first_name, last_name, image_url } = data;
        await storage.upsertUser({
          id,
          email: email_addresses?.[0]?.email_address || '',
          firstName: first_name || '',
          lastName: last_name || '',
          profileImageUrl: image_url || null,
          // DON'T set currentPlan or planStartDate - let storage preserve existing values
        });
        console.log(`✅ User profile updated: ${id} (plan preserved)`);
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Clerk webhook error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  });

  // Auth endpoints
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      
      // Sync user from Clerk to database if not exists
      const user = await storage.getUser(userId);
      if (!user) {
        const clerkUser = await clerkClient.users.getUser(userId);
        await storage.upsertUser({
          id: clerkUser.id,
          email: clerkUser.emailAddresses?.[0]?.emailAddress || '',
          firstName: clerkUser.firstName || '',
          lastName: clerkUser.lastName || '',
          profileImageUrl: clerkUser.imageUrl || null,
        });
        const newUser = await storage.getUser(userId);
        return res.json(newUser);
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Plan Status endpoint - Returns user's plan info, limits, usage, and capabilities
  app.get('/api/user/plan-status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const planStatus = await storage.getUserPlanStatus(userId);
      res.json(planStatus);
    } catch (error) {
      console.error("Error fetching plan status:", error);
      res.status(500).json({ message: "Failed to fetch plan status" });
    }
  });

  // Upgrade Plan endpoint - Upgrades user to a higher plan
  app.post('/api/user/upgrade-plan', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const { plan } = req.body;
      
      if (!plan || !['basic', 'pro', 'premium'].includes(plan)) {
        return res.status(400).json({ error: "Invalid plan specified" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const currentPlan = user.currentPlan;
      const planOrder = ['basic', 'pro', 'premium'];
      const currentIndex = planOrder.indexOf(currentPlan);
      const targetIndex = planOrder.indexOf(plan);
      
      if (targetIndex <= currentIndex) {
        return res.status(400).json({ 
          error: "Invalid upgrade path",
          message: targetIndex === currentIndex 
            ? "You are already on this plan" 
            : "You can only upgrade to a higher plan"
        });
      }
      
      // Update user plan
      await storage.updateUserPlan(userId, plan);
      
      // Reset usage counters for the new plan
      await storage.resetUsageForUser(userId);
      
      console.log(`✅ User ${userId} upgraded from ${currentPlan} to ${plan}`);
      
      res.json({ 
        success: true, 
        plan,
        previousPlan: currentPlan,
        message: `Successfully upgraded to ${plan} plan`
      });
    } catch (error) {
      console.error("Error upgrading plan:", error);
      res.status(500).json({ error: "Failed to upgrade plan" });
    }
  });

  // File upload endpoint for profile photos (requires authentication)
  app.post('/api/upload/profile-photo', isAuthenticated, upload.single('photo'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      // Return the URL path to access the uploaded image
      const photoUrl = `/uploads/${req.file.filename}`;
      res.json({ photoUrl });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  });

  // Template endpoints
  app.get("/api/templates", async (_req, res) => {
    try {
      const templates = await storage.getAllTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  app.get("/api/templates/:id", async (req, res) => {
    try {
      const template = await storage.getTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error fetching template:", error);
      res.status(500).json({ error: "Failed to fetch template" });
    }
  });

  // CV endpoints - Require authentication
  app.get("/api/cvs", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const cvs = await storage.getCvsByUserId(userId);
      res.json(cvs);
    } catch (error) {
      console.error("Error fetching CVs:", error);
      res.status(500).json({ error: "Failed to fetch CVs" });
    }
  });

  app.post("/api/cvs", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const validatedData = insertCvSchema.parse(req.body);
      
      console.log('[POST /api/cvs] Received templateId:', validatedData.templateId);
      
      // Check CV generation limit FIRST
      const limitCheck = await hasReachedLimit(userId, 'cvGenerations');
      if (limitCheck.reached) {
        return res.status(403).json({
          error: 'limit',
          limitType: 'count',
          feature: limitCheck.feature,
          featureName: limitCheck.featureName,
          currentPlan: limitCheck.currentPlan,
          requiredPlan: limitCheck.requiredPlan,
          usage: {
            current: limitCheck.current,
            limit: limitCheck.limit
          },
          message: `You've used ${limitCheck.current} of ${limitCheck.limit} CV generations this month. Upgrade your plan for more.`
        });
      }
      
      // Convert empty string templateId to null for database compatibility
      const templateId = validatedData.templateId && validatedData.templateId.trim() !== '' 
        ? validatedData.templateId 
        : null;
      
      // Check template access control
      if (templateId) {
        const template = await storage.getTemplate(templateId);
        if (!template) {
          return res.status(404).json({ error: "Template not found" });
        }
        
        // If template is premium, verify user has premium plan
        if (template.isPremium) {
          const user = await storage.getUser(userId);
          if (!user || user.currentPlan !== 'premium') {
            return res.status(403).json({ 
              error: 'limit',
              limitType: 'access',
              feature: 'premiumTemplate',
              featureName: `Premium Template (${template.name})`,
              currentPlan: user?.currentPlan || 'basic',
              requiredPlan: 'premium',
              message: `The ${template.name} template requires Premium plan`
            });
          }
        }
      }
      
      const cvData = {
        ...validatedData,
        userId, // Link CV to authenticated user
        templateId
      };
      
      console.log('[POST /api/cvs] Saving CV with templateId:', cvData.templateId);
      
      const cv = await storage.createCv(cvData);
      
      // Increment CV generation usage AFTER successful creation
      await storage.incrementUsage(userId, 'cvGenerations');
      
      console.log('[POST /api/cvs] Returning CV with templateId:', cv.templateId);
      
      res.json(cv);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid CV data", details: error.errors });
      }
      console.error("Error creating CV:", error);
      res.status(500).json({ error: "Failed to create CV" });
    }
  });

  app.get("/api/cvs/:id", isAuthenticated, async (req, res) => {
    try {
      const cv = await storage.getCv(req.params.id);
      if (!cv) {
        return res.status(404).json({ error: "CV not found" });
      }
      res.json(cv);
    } catch (error) {
      console.error("Error fetching CV:", error);
      res.status(500).json({ error: "Failed to fetch CV" });
    }
  });

  app.patch("/api/cvs/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const updateData = { ...req.body };
      
      // Convert empty string templateId to null for database compatibility
      if (updateData.templateId !== undefined) {
        updateData.templateId = updateData.templateId && updateData.templateId.trim() !== '' 
          ? updateData.templateId 
          : null;
      }
      
      // Check template access control if template is being changed
      if (updateData.templateId) {
        const template = await storage.getTemplate(updateData.templateId);
        if (!template) {
          return res.status(404).json({ error: "Template not found" });
        }
        
        // If template is premium, verify user has premium plan
        if (template.isPremium) {
          const user = await storage.getUser(userId);
          if (!user || user.currentPlan !== 'premium') {
            return res.status(403).json({ 
              error: 'limit',
              limitType: 'access',
              feature: 'premiumTemplate',
              featureName: `Premium Template (${template.name})`,
              currentPlan: user?.currentPlan || 'basic',
              requiredPlan: 'premium',
              message: `The ${template.name} template requires Premium plan`
            });
          }
        }
      }
      
      const cv = await storage.updateCv(req.params.id, updateData);
      if (!cv) {
        return res.status(404).json({ error: "CV not found" });
      }
      res.json(cv);
    } catch (error) {
      console.error("Error updating CV:", error);
      res.status(500).json({ error: "Failed to update CV" });
    }
  });

  app.delete("/api/cvs/:id", isAuthenticated, async (req, res) => {
    try {
      const success = await storage.deleteCv(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "CV not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting CV:", error);
      res.status(500).json({ error: "Failed to delete CV" });
    }
  });

  // AI-powered CV optimization endpoints - Require Basic plan (1 AI run included)
  app.post("/api/ai/optimize-cv", isAuthenticated, requirePlan('basic', 'AI Optimization'), async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const cvData = req.body;
      
      // Check AI runs limit FIRST
      const limitCheck = await hasReachedLimit(userId, 'aiRuns');
      if (limitCheck.reached) {
        return res.status(403).json({
          error: 'limit',
          limitType: 'count',
          feature: limitCheck.feature,
          featureName: limitCheck.featureName,
          currentPlan: limitCheck.currentPlan,
          requiredPlan: limitCheck.requiredPlan,
          usage: {
            current: limitCheck.current,
            limit: limitCheck.limit
          },
          message: `You've used ${limitCheck.current} of ${limitCheck.limit} AI runs this month. Upgrade to Pro or Premium for more.`
        });
      }
      
      const optimizedCV = await optimizeCVContent(cvData);
      
      // Increment AI usage AFTER successful operation
      await storage.incrementUsage(userId, 'aiRuns');
      
      res.json(optimizedCV);
    } catch (error) {
      console.error("Error optimizing CV:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to optimize CV with AI";
      res.status(500).json({ error: errorMessage });
    }
  });

  app.post("/api/ai/generate-cover-letter", isAuthenticated, requirePlan('basic', 'Cover Letter Generation'), async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const { cv, jobTitle, companyName, jobDescription } = req.body;
      
      if (!cv || !jobTitle || !companyName) {
        return res.status(400).json({ error: "Missing required fields: cv, jobTitle, companyName" });
      }

      // Check cover letter limit FIRST
      const coverLetterLimit = await hasReachedLimit(userId, 'coverLetterGenerations');
      if (coverLetterLimit.reached) {
        return res.status(403).json({
          error: 'limit',
          limitType: 'count',
          feature: coverLetterLimit.feature,
          featureName: coverLetterLimit.featureName,
          currentPlan: coverLetterLimit.currentPlan,
          requiredPlan: coverLetterLimit.requiredPlan,
          usage: {
            current: coverLetterLimit.current,
            limit: coverLetterLimit.limit
          },
          message: `You've used ${coverLetterLimit.current} of ${coverLetterLimit.limit} cover letter generations this month. Upgrade your plan for more.`
        });
      }
      
      // Check AI runs limit
      const aiRunsLimit = await hasReachedLimit(userId, 'aiRuns');
      if (aiRunsLimit.reached) {
        return res.status(403).json({
          error: 'limit',
          limitType: 'count',
          feature: aiRunsLimit.feature,
          featureName: aiRunsLimit.featureName,
          currentPlan: aiRunsLimit.currentPlan,
          requiredPlan: aiRunsLimit.requiredPlan,
          usage: {
            current: aiRunsLimit.current,
            limit: aiRunsLimit.limit
          },
          message: `You've used ${aiRunsLimit.current} of ${aiRunsLimit.limit} AI runs this month. Upgrade to Pro or Premium for more.`
        });
      }

      const coverLetterData = await generateCoverLetter(cv, jobTitle, companyName, jobDescription);
      
      // Increment usage AFTER successful generation
      await storage.incrementUsage(userId, 'coverLetterGenerations');
      await storage.incrementUsage(userId, 'aiRuns');
      
      res.json(coverLetterData);
    } catch (error) {
      console.error("Error generating cover letter:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate cover letter";
      res.status(500).json({ error: errorMessage });
    }
  });

  // Generate cover letter PDF - Require Basic plan
  app.post("/api/ai/cover-letter-pdf", isAuthenticated, requirePlan('basic', 'Cover Letter PDF Download'), async (req, res) => {
    try {
      const coverLetterData = req.body;
      
      const { generateCoverLetterPDF } = await import("./lib/cover-letter-pdf-generator");
      const pdfBuffer = await generateCoverLetterPDF(coverLetterData);
      
      const filename = `${coverLetterData.fullName.replace(/[^a-z0-9]/gi, '_')}_Cover_Letter.pdf`;
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error generating cover letter PDF:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate PDF";
      res.status(500).json({ error: errorMessage });
    }
  });

  app.post("/api/ai/optimize-linkedin", isAuthenticated, requirePlan('premium', 'LinkedIn Export'), async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const cvData = req.body;
      
      // Premium has unlimited AI, but check anyway for consistency
      const limitCheck = await hasReachedLimit(userId, 'aiRuns');
      if (limitCheck.reached) {
        return res.status(403).json({
          error: 'limit',
          limitType: 'count',
          feature: limitCheck.feature,
          featureName: limitCheck.featureName,
          currentPlan: limitCheck.currentPlan,
          requiredPlan: limitCheck.requiredPlan,
          usage: {
            current: limitCheck.current,
            limit: limitCheck.limit
          },
          message: `You've used ${limitCheck.current} of ${limitCheck.limit} AI runs this month.`
        });
      }
      
      const linkedInProfile = await optimizeLinkedInProfile(cvData);
      
      // Increment AI usage AFTER successful operation
      await storage.incrementUsage(userId, 'aiRuns');
      
      res.json(linkedInProfile);
    } catch (error) {
      console.error("Error optimizing LinkedIn profile:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to optimize LinkedIn profile";
      res.status(500).json({ error: errorMessage });
    }
  });

  // Generate LinkedIn profile PDF - Premium only
  app.post("/api/ai/linkedin-pdf", isAuthenticated, requirePlan('premium', 'LinkedIn PDF Download'), async (req, res) => {
    try {
      const linkedInData = req.body;
      
      const { generateLinkedInPDF } = await import("./lib/linkedin-pdf-generator");
      const pdfBuffer = await generateLinkedInPDF(linkedInData);
      
      const filename = `${linkedInData.fullName.replace(/[^a-z0-9]/gi, '_')}_LinkedIn_Profile.pdf`;
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error generating LinkedIn PDF:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate PDF";
      res.status(500).json({ error: errorMessage });
    }
  });

  app.post("/api/ai/analyze-ats", isAuthenticated, requirePlan('pro', 'ATS Analysis'), async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const cvData = req.body;
      
      // Check AI runs limit FIRST
      const limitCheck = await hasReachedLimit(userId, 'aiRuns');
      if (limitCheck.reached) {
        return res.status(403).json({
          error: 'limit',
          limitType: 'count',
          feature: limitCheck.feature,
          featureName: limitCheck.featureName,
          currentPlan: limitCheck.currentPlan,
          requiredPlan: limitCheck.requiredPlan,
          usage: {
            current: limitCheck.current,
            limit: limitCheck.limit
          },
          message: `You've used ${limitCheck.current} of ${limitCheck.limit} AI runs this month. Upgrade to Premium for unlimited AI.`
        });
      }
      
      const analysis = await analyzeCVForATS(cvData);
      
      // Increment AI usage AFTER successful operation
      await storage.incrementUsage(userId, 'aiRuns');
      
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing CV for ATS:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to analyze CV";
      res.status(500).json({ error: errorMessage });
    }
  });

  // Order endpoints - Require authentication
  app.get("/api/orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const orders = await storage.getOrdersByUserId(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  // Initialize Paystack payment - Require authentication
  app.post("/api/payments/initialize", isAuthenticated, async (req: any, res) => {
    try {
      const { cvId, packageType, email } = req.body;
      const userId = getUserId(req);

      if (!cvId || !packageType || !email) {
        return res.status(400).json({ error: "Missing required fields: cvId, packageType, email" });
      }

      // Validate package type
      if (!(packageType in PRICING_TIERS)) {
        return res.status(400).json({ error: "Invalid package type" });
      }

      const tier = PRICING_TIERS[packageType as PricingTier];

      // Verify the CV belongs to the user
      const cv = await storage.getCv(cvId);
      if (!cv || cv.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized access to CV" });
      }

      // Create order in database
      const order = await storage.createOrder({
        cvId,
        packageType,
        amount: tier.price,
        currency: "GHS",
        status: "pending",
        progress: 0,
        userId, // Link order to authenticated user
      });

      // Always use Paystack for real payments
      if (!paystackClient) {
        return res.status(503).json({ error: "Payment service not configured. Please set PAYSTACK_SECRET_KEY." });
      }

      // Initialize Paystack transaction
      // Use APP_URL for external deployments, fallback to REPLIT_DEV_DOMAIN for Replit, or localhost for local dev
      const baseUrl = process.env.APP_URL 
        || (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : null)
        || 'http://localhost:5000';
      const callbackUrl = `${baseUrl}/payment/callback`;
      
      const paystackResponse = await paystackClient.transaction.initialize({
        email,
        amount: tier.price, // Amount in pesewas (100 pesewas = 1 GHS)
        currency: "GHS",
        reference: `ORDER_${order.id}`,
        callback_url: callbackUrl,
        metadata: {
          order_id: order.id,
          cv_id: cvId,
          package_type: packageType,
        },
      });

      console.log("Paystack response:", JSON.stringify(paystackResponse, null, 2));

      if (!paystackResponse.status) {
        console.error("Paystack initialization failed:", paystackResponse);
        throw new Error(paystackResponse.message || "Failed to initialize Paystack transaction");
      }

      // Update order with Paystack reference and access code
      await storage.updateOrder(order.id, {
        paystackReference: paystackResponse.data.reference,
        paystackAccessCode: paystackResponse.data.access_code,
      });

      res.json({
        orderId: order.id,
        authorizationUrl: paystackResponse.data.authorization_url,
        accessCode: paystackResponse.data.access_code,
        reference: paystackResponse.data.reference,
      });
    } catch (error) {
      console.error("Error initializing payment:", error);
      res.status(500).json({ error: "Failed to initialize payment" });
    }
  });

  // Verify Paystack payment
  app.get("/api/payments/verify/:reference", async (req, res) => {
    try {
      if (!paystackClient) {
        return res.status(503).json({ error: "Payment service not configured" });
      }

      const { reference } = req.params;

      // Verify transaction with Paystack
      const paystackResponse = await paystackClient.transaction.verify(reference);

      if (!paystackResponse.status) {
        return res.status(400).json({ error: "Payment verification failed" });
      }

      const { status, amount, metadata } = paystackResponse.data;

      // Find order by reference
      const order = await storage.getOrderByPaystackReference(reference);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      // Update order status based on payment status
      if (status === "success") {
        // Get package tier details
        const packageType = order.packageType as "basic" | "standard" | "premium";
        const tierConfig = PRICING_TIERS[packageType];
        
        // Get CV data for PDF generation
        const cv = await storage.getCv(order.cvId!);
        if (!cv) {
          return res.status(404).json({ error: "CV not found" });
        }
        
        // Sanitize filename
        const sanitizedName = cv.fullName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const pdfFileName = `${sanitizedName}_cv.pdf`;
        
        // Complete order immediately - no need for artificial delays
        await storage.updateOrder(order.id, {
          status: "completed",
          progress: 100,
          completedAt: new Date(),
          downloadUrl: `/api/orders/${order.id}/download`,
          editsRemaining: tierConfig.editsAllowed,
          hasCoverLetter: tierConfig.hasCoverLetter ? 1 : 0,
          hasLinkedInOptimization: tierConfig.hasLinkedInOptimization ? 1 : 0,
          templateCount: tierConfig.templateCount,
          pdfFileName,
        });
      } else {
        await storage.updateOrder(order.id, {
          status: "failed",
        });
      }

      res.json({
        status: status,
        orderId: order.id,
        message: status === "success" ? "Payment successful" : "Payment failed",
      });
    } catch (error) {
      console.error("Error verifying payment:", error);
      res.status(500).json({ error: "Failed to verify payment" });
    }
  });

  // Paystack webhook endpoint
  app.post("/api/webhooks/paystack", async (req, res) => {
    try {
      // Verify webhook signature
      const hash = req.headers["x-paystack-signature"];
      const body = JSON.stringify(req.body);
      
      if (!hash || !process.env.PAYSTACK_SECRET_KEY) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const crypto = await import("crypto");
      const expectedHash = crypto
        .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
        .update(body)
        .digest("hex");

      if (hash !== expectedHash) {
        return res.status(401).json({ error: "Invalid signature" });
      }

      const event = req.body;

      // Handle different webhook events
      if (event.event === "charge.success") {
        const { reference, amount, metadata } = event.data;
        
        const order = await storage.getOrderByPaystackReference(reference);
        if (order && order.status === "pending") {
          await storage.updateOrder(order.id, {
            status: "processing",
            progress: 10,
          });
        }
      }

      res.status(200).json({ received: true });
    } catch (error) {
      console.error("Error processing webhook:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });

  // Download CV endpoint (legacy - redirects to new endpoint)
  app.get("/api/orders/:id/download", async (req, res) => {
    res.redirect(`/api/orders/${req.params.id}/download/cv`);
  });

  // Download order files endpoint (CV, Cover Letter, LinkedIn)
  app.get("/api/orders/:id/download/:type", async (req, res) => {
    try {
      const { id, type } = req.params;
      
      const order = await storage.getOrder(id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      if (order.status !== "completed") {
        return res.status(400).json({ error: "Order not yet completed" });
      }

      // Get CV data
      const cv = await storage.getCv(order.cvId!);
      if (!cv) {
        return res.status(404).json({ error: "CV not found" });
      }

      let pdfBuffer: Buffer;
      let filename: string;

      switch (type) {
        case 'cv':
          // Generate CV PDF
          const { generateCVPDF } = await import("./lib/pdf-generator");
          pdfBuffer = await generateCVPDF({
            cvData: cv,
            templateId: cv.templateId || "azurill",
            fileName: order.pdfFileName || `CV_${order.id}.pdf`,
          });
          filename = order.pdfFileName || 'CV.pdf';
          break;

        case 'cover-letter':
          // Check if order includes cover letter
          if (order.hasCoverLetter !== 1) {
            return res.status(403).json({ error: "Cover letter not included in this package" });
          }
          
          // Generate cover letter PDF from stored data
          const { generateCoverLetterPDF } = await import("./lib/cover-letter-pdf-generator");
          
          // We'll need to regenerate the cover letter or get it from stored data
          // For now, generate a basic one from CV data
          const sanitizedName = cv.fullName.replace(/[^a-z0-9]/gi, '_');
          pdfBuffer = await generateCoverLetterPDF({
            fullName: cv.fullName,
            email: cv.email,
            phone: cv.phone || '',
            location: cv.location || '',
            date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            companyName: 'Hiring Company',
            jobTitle: 'Position',
            content: 'This is your professional cover letter content that was generated based on your CV.',
          });
          filename = `${sanitizedName}_Cover_Letter.pdf`;
          break;

        case 'linkedin':
          // Check if order includes LinkedIn optimization
          if (order.hasLinkedInOptimization !== 1) {
            return res.status(403).json({ error: "LinkedIn optimization not included in this package" });
          }
          
          // Generate LinkedIn PDF from stored data
          const { generateLinkedInPDF } = await import("./lib/linkedin-pdf-generator");
          
          const sanitizedName2 = cv.fullName.replace(/[^a-z0-9]/gi, '_');
          pdfBuffer = await generateLinkedInPDF({
            fullName: cv.fullName,
            headline: 'Professional headline based on your CV',
            about: 'Optimized about section for your LinkedIn profile.',
            experience: 'Summarized experience highlights.',
            skills: 'Key skills and competencies.',
            accomplishments: 'Notable achievements and accomplishments.',
            suggestions: [
              'Add a professional profile photo',
              'Complete all profile sections',
              'Request recommendations from colleagues',
              'Join relevant industry groups',
              'Share valuable content regularly'
            ],
          });
          filename = `${sanitizedName2}_LinkedIn_Profile.pdf`;
          break;

        default:
          return res.status(400).json({ error: "Invalid download type" });
      }

      // Set headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error downloading file:", error);
      res.status(500).json({ error: "Failed to download file" });
    }
  });

  // Send CV via email endpoint
  app.post("/api/orders/:id/send-email", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      if (order.status !== "completed") {
        return res.status(400).json({ error: "Order not yet completed" });
      }

      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email address required" });
      }

      // Get CV data
      const cv = await storage.getCv(order.cvId!);
      if (!cv) {
        return res.status(404).json({ error: "CV not found" });
      }

      // Generate PDF
      const { generateCVPDF } = await import("./lib/pdf-generator");
      const pdfBuffer = await generateCVPDF({
        cvData: cv,
        templateId: cv.templateId || "azurill",
        fileName: order.pdfFileName || `CV_${order.id}.pdf`,
      });

      // Send email with PDF attachment
      const { getUncachableResendClient } = await import("./lib/resend-client");
      const { client, fromEmail } = await getUncachableResendClient();

      await client.emails.send({
        from: fromEmail,
        to: email,
        subject: `Your Professional CV from Devignite`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ef4b23;">Your CV is Ready!</h2>
            <p>Hi ${cv.fullName},</p>
            <p>Thank you for choosing Devignite to create your professional CV. Your CV is attached to this email as a PDF file.</p>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Package Details:</h3>
              <ul style="list-style: none; padding: 0;">
                <li>✓ Templates Available: ${order.templateCount}</li>
                <li>✓ Edits Remaining: ${order.editsRemaining === 999 ? 'Unlimited' : order.editsRemaining}</li>
                ${order.hasCoverLetter === 1 ? '<li>✓ Matching Cover Letter Included</li>' : ''}
                ${order.hasLinkedInOptimization === 1 ? '<li>✓ LinkedIn Optimization Included</li>' : ''}
              </ul>
            </div>
            
            <p>You can always access your CV and make edits through your <a href="${process.env.APP_URL || (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : 'https://devignite.com')}/dashboard" style="color: #ef4b23;">dashboard</a>.</p>
            
            <p>Need help? Contact us at <a href="mailto:devignite.cv@gmail.com" style="color: #ef4b23;">devignite.cv@gmail.com</a></p>
            
            <p style="margin-top: 30px;">Best regards,<br/>The Devignite Team</p>
          </div>
        `,
        attachments: [
          {
            filename: order.pdfFileName || 'CV.pdf',
            content: pdfBuffer,
          },
        ],
      });

      res.json({ 
        success: true, 
        message: "Email sent successfully" 
      });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  // Admin API endpoints - Require admin role
  app.get("/api/admin/sales", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      const users = await storage.getAllUsers();
      
      const totalRevenue = orders
        .filter(o => o.status === 'successful')
        .reduce((sum, o) => sum + (o.amount || 0), 0);
      
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthlyRevenue = orders
        .filter(o => o.status === 'successful' && new Date(o.createdAt) >= monthStart)
        .reduce((sum, o) => sum + (o.amount || 0), 0);
      
      const planDistribution = {
        basic: users.filter(u => u.currentPlan === 'basic').length,
        pro: users.filter(u => u.currentPlan === 'pro').length,
        premium: users.filter(u => u.currentPlan === 'premium').length,
      };
      
      res.json({
        totalRevenue,
        monthlyRevenue,
        totalOrders: orders.filter(o => o.status === 'successful').length,
        planDistribution,
      });
    } catch (error) {
      console.error("Error fetching sales data:", error);
      res.status(500).json({ error: "Failed to fetch sales data" });
    }
  });

  app.get("/api/admin/users", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.patch("/api/admin/users/:userId/plan", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const { plan } = req.body;
      
      if (!['basic', 'pro', 'premium'].includes(plan)) {
        return res.status(400).json({ error: "Invalid plan" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      await storage.updateUserPlan(userId, plan);
      
      res.json({ success: true, message: "Plan updated successfully" });
    } catch (error) {
      console.error("Error updating user plan:", error);
      res.status(500).json({ error: "Failed to update plan" });
    }
  });

  app.post("/api/admin/users/:userId/reset-usage", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      await storage.resetUsageForUser(userId);
      
      res.json({ success: true, message: "Usage reset successfully" });
    } catch (error) {
      console.error("Error resetting usage:", error);
      res.status(500).json({ error: "Failed to reset usage" });
    }
  });

  app.get("/api/admin/analytics", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const cvs = await storage.getAllCVs();
      
      // For now, mock cover letter and AI data since we don't have separate tracking yet
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const cvGeneratedThisMonth = cvs.filter(cv => 
        new Date(cv.createdAt) >= monthStart
      ).length;
      
      res.json({
        totalCVs: cvs.length,
        totalCoverLetters: 0, // TODO: Add tracking
        totalAIRuns: 0, // TODO: Add tracking
        activeUsersToday: 0, // TODO: Add tracking
        cvGeneratedThisMonth,
        coverLettersThisMonth: 0, // TODO: Add tracking
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  app.get("/api/admin/emails", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      // TODO: Implement email logs tracking
      // For now, return empty array
      res.json([]);
    } catch (error) {
      console.error("Error fetching email logs:", error);
      res.status(500).json({ error: "Failed to fetch email logs" });
    }
  });

  app.get("/api/admin/api-keys", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const apiKeys = await storage.getAllApiKeys();
      res.json(apiKeys);
    } catch (error) {
      console.error("Error fetching API keys:", error);
      res.status(500).json({ error: "Failed to fetch API keys" });
    }
  });

  app.post("/api/admin/api-keys", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { service, keyValue, displayName } = req.body;
      
      if (!service || !keyValue) {
        return res.status(400).json({ error: "Service and key value are required" });
      }
      
      const apiKey = await storage.upsertApiKey({ 
        service, 
        keyValue,
        displayName: displayName || service 
      });
      res.json(apiKey);
    } catch (error) {
      console.error("Error adding API key:", error);
      res.status(500).json({ error: "Failed to add API key" });
    }
  });

  app.delete("/api/admin/api-keys/:service", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { service } = req.params;
      const deleted = await storage.deleteApiKey(service);
      
      if (!deleted) {
        return res.status(404).json({ error: "API key not found" });
      }
      
      res.json({ success: true, message: "API key deleted" });
    } catch (error) {
      console.error("Error deleting API key:", error);
      res.status(500).json({ error: "Failed to delete API key" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
