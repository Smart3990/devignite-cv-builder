import { db } from "./db";
import { 
  users, cvs, orders, templates, coverLetters, emailLogs, apiKeys, usageCounters,
  type User, type UpsertUser, type Cv, type InsertCv, type Order, type InsertOrder, 
  type Template, type InsertTemplate, type CoverLetter, type InsertCoverLetter,
  type EmailLog, type InsertEmailLog, type ApiKey, type InsertApiKey, type UsageCounter
} from "@shared/schema";
import { eq, desc, and, gte, lte, sql as drizzleSql } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations (Replit Auth required)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserPlan(userId: string, plan: string): Promise<void>;
  
  // CV operations
  getCv(id: string): Promise<Cv | undefined>;
  getCvsByUserId(userId: string): Promise<Cv[]>;
  getAllCVs(): Promise<Cv[]>;
  createCv(cv: InsertCv): Promise<Cv>;
  updateCv(id: string, cv: Partial<InsertCv>): Promise<Cv | undefined>;
  deleteCv(id: string): Promise<boolean>;
  
  // Template operations
  getTemplate(id: string): Promise<Template | undefined>;
  getAllTemplates(): Promise<Template[]>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  
  // Order operations
  getOrder(id: string): Promise<Order | undefined>;
  getOrdersByUserId(userId: string): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  getOrderByPaystackReference(reference: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, order: Partial<InsertOrder>): Promise<Order | undefined>;
  decrementOrderEdits(orderId: string): Promise<void>;
  
  // Cover Letter operations
  getCoverLetter(id: string): Promise<CoverLetter | undefined>;
  getCoverLettersByUserId(userId: string): Promise<CoverLetter[]>;
  createCoverLetter(coverLetter: InsertCoverLetter): Promise<CoverLetter>;
  updateCoverLetter(id: string, coverLetter: Partial<InsertCoverLetter>): Promise<CoverLetter | undefined>;
  deleteCoverLetter(id: string): Promise<boolean>;
  
  // Email Log operations
  getEmailLog(id: string): Promise<EmailLog | undefined>;
  getEmailLogsByUserId(userId: string): Promise<EmailLog[]>;
  getAllEmailLogs(limit?: number): Promise<EmailLog[]>;
  createEmailLog(emailLog: InsertEmailLog): Promise<EmailLog>;
  updateEmailLog(id: string, emailLog: Partial<InsertEmailLog>): Promise<EmailLog | undefined>;
  
  // API Key operations (admin only)
  getApiKey(service: string): Promise<ApiKey | undefined>;
  getAllApiKeys(): Promise<ApiKey[]>;
  upsertApiKey(apiKey: InsertApiKey): Promise<ApiKey>;
  deleteApiKey(service: string): Promise<boolean>;
  
  // Usage Tracking operations
  incrementUsage(userId: string, feature: string): Promise<void>;
  getUsageCount(userId: string, feature: string): Promise<number>;
  resetUsageForUser(userId: string): Promise<void>;
  
  // Plan Status (for upgrade prompts)
  getUserPlanStatus(userId: string): Promise<{
    planId: string;
    planName: string;
    limits: Record<string, number>;
    usage: Record<string, number>;
    capabilities: string[];
  }>;
}

export class DbStorage implements IStorage {
  constructor() {
    // Initialize templates on startup
    this.initializeTemplates();
  }

  private async initializeTemplates() {
    try {
      // Check if templates already exist
      const existingTemplates = await db.select().from(templates).limit(1);
      if (existingTemplates.length > 0) {
        console.log('[DbStorage] Templates already seeded');
        return;
      }

      // Seed templates
      const templateData = [
        { id: "azurill", name: "Azurill", description: "Clean single-column ATS-friendly layout with subtle accent colors", category: "professional", isPremium: 0, previewImage: null },
        { id: "bronzor", name: "Bronzor", description: "Bold two-column design with prominent header section", category: "professional", isPremium: 0, previewImage: null },
        { id: "chikorita", name: "Chikorita", description: "Fresh modern layout with green accent highlights", category: "creative", isPremium: 0, previewImage: null },
        { id: "ditto", name: "Ditto", description: "Flexible minimalist design with excellent spacing", category: "minimal", isPremium: 0, previewImage: null },
        { id: "gengar", name: "Gengar", description: "Dark elegant template with sophisticated typography", category: "creative", isPremium: 1, previewImage: null },
        { id: "glalie", name: "Glalie", description: "Cool professional layout with blue accent theme", category: "professional", isPremium: 0, previewImage: null },
        { id: "kakuna", name: "Kakuna", description: "Compact efficient design maximizing content density", category: "professional", isPremium: 0, previewImage: null },
        { id: "leafish", name: "Leafish", description: "Nature-inspired design with organic flowing sections", category: "creative", isPremium: 1, previewImage: null },
        { id: "nosepass", name: "Nosepass", description: "Strong structured layout with clear visual hierarchy", category: "professional", isPremium: 0, previewImage: null },
        { id: "onyx", name: "Onyx", description: "Sleek monochrome design with striking contrast", category: "minimal", isPremium: 1, previewImage: null },
        { id: "pikachu", name: "Pikachu", description: "Energetic bright template with yellow accent color", category: "creative", isPremium: 0, previewImage: null },
        { id: "rhyhorn", name: "Rhyhorn", description: "Robust traditional layout with excellent readability", category: "professional", isPremium: 0, previewImage: null },
      ];

      await db.insert(templates).values(templateData);
      console.log('[DbStorage] Successfully seeded 12 templates');
    } catch (error) {
      console.error('[DbStorage] Error seeding templates:', error);
    }
  }

  // User operations (Replit Auth required)
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // Try to find existing user by id first, then by email
    let existing = await db
      .select()
      .from(users)
      .where(eq(users.id, userData.id))
      .limit(1);
    
    // If not found by id, check by email
    if (existing.length === 0 && userData.email) {
      existing = await db
        .select()
        .from(users)
        .where(eq(users.email, userData.email))
        .limit(1);
    }
    
    if (existing.length > 0) {
      // Update existing user (use existing id if found by email)
      const existingUser = existing[0];
      const [updated] = await db
        .update(users)
        .set({
          ...userData,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existingUser.id))
        .returning();
      return updated;
    } else {
      // Insert new user with default Basic plan
      const [user] = await db
        .insert(users)
        .values({
          ...userData,
          role: userData.role || 'user',
          currentPlan: userData.currentPlan || 'basic',
          planStartDate: userData.planStartDate || new Date(),
        })
        .returning();
      return user;
    }
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUserPlan(userId: string, plan: string): Promise<void> {
    await db
      .update(users)
      .set({ currentPlan: plan, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  // CV operations
  async getCv(id: string): Promise<Cv | undefined> {
    const result = await db.select().from(cvs).where(eq(cvs.id, id));
    return result[0];
  }

  async getCvsByUserId(userId: string): Promise<Cv[]> {
    return db.select().from(cvs).where(eq(cvs.userId, userId)).orderBy(desc(cvs.createdAt));
  }

  async getAllCVs(): Promise<Cv[]> {
    return db.select().from(cvs).orderBy(desc(cvs.createdAt));
  }

  async createCv(cv: InsertCv): Promise<Cv> {
    const result = await db.insert(cvs).values(cv).returning();
    return result[0];
  }

  async updateCv(id: string, cv: Partial<InsertCv>): Promise<Cv | undefined> {
    const result = await db
      .update(cvs)
      .set({ ...cv, updatedAt: new Date() })
      .where(eq(cvs.id, id))
      .returning();
    return result[0];
  }

  async deleteCv(id: string): Promise<boolean> {
    const result = await db.delete(cvs).where(eq(cvs.id, id));
    return result.rowCount > 0;
  }

  // Template operations
  async getTemplate(id: string): Promise<Template | undefined> {
    const result = await db.select().from(templates).where(eq(templates.id, id));
    return result[0];
  }

  async getAllTemplates(): Promise<Template[]> {
    return db.select().from(templates);
  }

  async createTemplate(template: InsertTemplate): Promise<Template> {
    const result = await db.insert(templates).values(template).returning();
    return result[0];
  }

  // Order operations
  async getOrder(id: string): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(eq(orders.id, id));
    return result[0];
  }

  async getOrdersByUserId(userId: string): Promise<Order[]> {
    return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  }

  async getAllOrders(): Promise<Order[]> {
    return db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrderByPaystackReference(reference: string): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(eq(orders.paystackReference, reference));
    return result[0];
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const result = await db.insert(orders).values(order).returning();
    return result[0];
  }

  async updateOrder(id: string, order: Partial<InsertOrder>): Promise<Order | undefined> {
    const result = await db
      .update(orders)
      .set({ ...order, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return result[0];
  }

  async decrementOrderEdits(orderId: string): Promise<void> {
    const order = await this.getOrder(orderId);
    if (order && order.editsRemaining > 0) {
      await db
        .update(orders)
        .set({ editsRemaining: order.editsRemaining - 1, updatedAt: new Date() })
        .where(eq(orders.id, orderId));
    }
  }

  // Cover Letter operations
  async getCoverLetter(id: string): Promise<CoverLetter | undefined> {
    const result = await db.select().from(coverLetters).where(eq(coverLetters.id, id));
    return result[0];
  }

  async getCoverLettersByUserId(userId: string): Promise<CoverLetter[]> {
    return db.select().from(coverLetters).where(eq(coverLetters.userId, userId)).orderBy(desc(coverLetters.createdAt));
  }

  async createCoverLetter(coverLetter: InsertCoverLetter): Promise<CoverLetter> {
    const result = await db.insert(coverLetters).values(coverLetter).returning();
    return result[0];
  }

  async updateCoverLetter(id: string, coverLetter: Partial<InsertCoverLetter>): Promise<CoverLetter | undefined> {
    const result = await db
      .update(coverLetters)
      .set({ ...coverLetter, updatedAt: new Date() })
      .where(eq(coverLetters.id, id))
      .returning();
    return result[0];
  }

  async deleteCoverLetter(id: string): Promise<boolean> {
    const result = await db.delete(coverLetters).where(eq(coverLetters.id, id)).returning();
    return result.length > 0;
  }

  // Email Log operations
  async getEmailLog(id: string): Promise<EmailLog | undefined> {
    const result = await db.select().from(emailLogs).where(eq(emailLogs.id, id));
    return result[0];
  }

  async getEmailLogsByUserId(userId: string): Promise<EmailLog[]> {
    return db.select().from(emailLogs).where(eq(emailLogs.userId, userId)).orderBy(desc(emailLogs.createdAt));
  }

  async getAllEmailLogs(limit: number = 100): Promise<EmailLog[]> {
    return db.select().from(emailLogs).orderBy(desc(emailLogs.createdAt)).limit(limit);
  }

  async createEmailLog(emailLog: InsertEmailLog): Promise<EmailLog> {
    const result = await db.insert(emailLogs).values(emailLog).returning();
    return result[0];
  }

  async updateEmailLog(id: string, emailLog: Partial<InsertEmailLog>): Promise<EmailLog | undefined> {
    const result = await db
      .update(emailLogs)
      .set(emailLog)
      .where(eq(emailLogs.id, id))
      .returning();
    return result[0];
  }

  // API Key operations (admin only)
  async getApiKey(service: string): Promise<ApiKey | undefined> {
    const result = await db.select().from(apiKeys).where(eq(apiKeys.service, service));
    return result[0];
  }

  async getAllApiKeys(): Promise<ApiKey[]> {
    return db.select().from(apiKeys).orderBy(desc(apiKeys.updatedAt));
  }

  async upsertApiKey(apiKey: InsertApiKey): Promise<ApiKey> {
    const existing = await this.getApiKey(apiKey.service);
    if (existing) {
      const result = await db
        .update(apiKeys)
        .set({ ...apiKey, updatedAt: new Date() })
        .where(eq(apiKeys.service, apiKey.service))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(apiKeys).values(apiKey).returning();
      return result[0];
    }
  }

  async deleteApiKey(service: string): Promise<boolean> {
    const result = await db.delete(apiKeys).where(eq(apiKeys.service, service)).returning();
    return result.length > 0;
  }
  
  // Usage Tracking operations
  async incrementUsage(userId: string, feature: string): Promise<void> {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    // Try to find existing usage counter for this user/feature/period
    const existing = await db
      .select()
      .from(usageCounters)
      .where(
        and(
          eq(usageCounters.userId, userId),
          eq(usageCounters.feature, feature),
          gte(usageCounters.periodStart, periodStart),
          lte(usageCounters.periodEnd, periodEnd)
        )
      )
      .limit(1);
    
    if (existing.length > 0) {
      // Increment existing counter
      await db
        .update(usageCounters)
        .set({ 
          count: drizzleSql`${usageCounters.count} + 1`,
          updatedAt: now
        })
        .where(eq(usageCounters.id, existing[0].id));
    } else {
      // Create new counter
      await db.insert(usageCounters).values({
        userId,
        feature,
        periodStart,
        periodEnd,
        count: 1
      });
    }
  }
  
  async getUsageCount(userId: string, feature: string): Promise<number> {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    const result = await db
      .select()
      .from(usageCounters)
      .where(
        and(
          eq(usageCounters.userId, userId),
          eq(usageCounters.feature, feature),
          gte(usageCounters.periodStart, periodStart),
          lte(usageCounters.periodEnd, periodEnd)
        )
      )
      .limit(1);
    
    return result.length > 0 ? result[0].count : 0;
  }
  
  async resetUsageForUser(userId: string): Promise<void> {
    await db.delete(usageCounters).where(eq(usageCounters.userId, userId));
  }
  
  async getUserPlanStatus(userId: string): Promise<{
    planId: string;
    planName: string;
    limits: Record<string, number>;
    usage: Record<string, number>;
    capabilities: string[];
  }> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    const planId = user.currentPlan;
    
    // Use imported configs instead of re-reading files
    const pricingConfig = (await import('../config/pricing.json')).default;
    const featuresConfig = (await import('../config/features.json')).default;
    
    const planConfig = pricingConfig.plans.find((p: any) => p.id === planId);
    if (!planConfig) {
      throw new Error("Plan not found");
    }
    
    // Get current month's usage for all features
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    const userUsage = await db
      .select()
      .from(usageCounters)
      .where(
        and(
          eq(usageCounters.userId, userId),
          gte(usageCounters.periodStart, periodStart),
          lte(usageCounters.periodEnd, periodEnd)
        )
      );
    
    // Convert usage to Record<string, number>
    const usage: Record<string, number> = {};
    userUsage.forEach(u => {
      usage[u.feature] = u.count;
    });
    
    // Get capabilities for this plan
    const capabilities: string[] = [];
    Object.entries(featuresData.features).forEach(([feature, config]: [string, any]) => {
      if (config.availableOn.includes(planId) || config.availableOn.includes("all")) {
        capabilities.push(feature);
      }
    });
    
    return {
      planId,
      planName: planConfig.name,
      limits: planConfig.limits,
      usage,
      capabilities,
    };
  }
}

// In-memory storage for development/testing
export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private cvs: Map<string, Cv>;
  private templates: Map<string, Template>;
  private orders: Map<string, Order>;
  private usageCounters: Map<string, UsageCounter>;

  constructor() {
    this.users = new Map();
    this.cvs = new Map();
    this.templates = new Map();
    this.orders = new Map();
    this.usageCounters = new Map();
    this.seedTemplates();
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existing = this.users.get(userData.id);
    const user: User = {
      id: userData.id,
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      role: userData.role || existing?.role || 'user',
      currentPlan: userData.currentPlan || existing?.currentPlan || 'basic',
      planStartDate: userData.planStartDate || existing?.planStartDate || new Date(),
      createdAt: existing?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.users.set(userData.id, user);
    return user;
  }

  private seedTemplates() {
    const mockTemplates: Template[] = [
      { id: "azurill", name: "Azurill", description: "Clean single-column ATS-friendly layout with subtle accent colors", category: "professional", isPremium: 0, previewImage: null },
      { id: "bronzor", name: "Bronzor", description: "Bold two-column design with prominent header section", category: "professional", isPremium: 0, previewImage: null },
      { id: "chikorita", name: "Chikorita", description: "Fresh modern layout with green accent highlights", category: "creative", isPremium: 0, previewImage: null },
      { id: "ditto", name: "Ditto", description: "Flexible minimalist design with excellent spacing", category: "minimal", isPremium: 0, previewImage: null },
      { id: "gengar", name: "Gengar", description: "Dark elegant template with sophisticated typography", category: "creative", isPremium: 1, previewImage: null },
      { id: "glalie", name: "Glalie", description: "Cool professional layout with blue accent theme", category: "professional", isPremium: 0, previewImage: null },
      { id: "kakuna", name: "Kakuna", description: "Compact efficient design maximizing content density", category: "professional", isPremium: 0, previewImage: null },
      { id: "leafish", name: "Leafish", description: "Nature-inspired design with organic flowing sections", category: "creative", isPremium: 1, previewImage: null },
      { id: "nosepass", name: "Nosepass", description: "Strong structured layout with clear visual hierarchy", category: "professional", isPremium: 0, previewImage: null },
      { id: "onyx", name: "Onyx", description: "Sleek monochrome design with striking contrast", category: "minimal", isPremium: 1, previewImage: null },
      { id: "pikachu", name: "Pikachu", description: "Energetic bright template with yellow accent color", category: "creative", isPremium: 0, previewImage: null },
      { id: "rhyhorn", name: "Rhyhorn", description: "Robust traditional layout with excellent readability", category: "professional", isPremium: 0, previewImage: null },
    ];
    mockTemplates.forEach(t => this.templates.set(t.id, t));
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateUserPlan(userId: string, plan: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.currentPlan = plan;
      user.updatedAt = new Date();
      this.users.set(userId, user);
    }
  }

  // CV operations
  async getCv(id: string): Promise<Cv | undefined> {
    return this.cvs.get(id);
  }

  async getCvsByUserId(userId: string): Promise<Cv[]> {
    return Array.from(this.cvs.values())
      .filter((cv) => cv.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getAllCVs(): Promise<Cv[]> {
    return Array.from(this.cvs.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createCv(cv: InsertCv): Promise<Cv> {
    const id = randomUUID();
    const newCv: Cv = {
      ...cv,
      id,
      userId: cv.userId || null,
      templateId: cv.templateId || null,
      phone: cv.phone || null,
      location: cv.location || null,
      website: cv.website || null,
      linkedin: cv.linkedin || null,
      summary: cv.summary || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.cvs.set(id, newCv);
    return newCv;
  }

  async updateCv(id: string, cv: Partial<InsertCv>): Promise<Cv | undefined> {
    const existing = this.cvs.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...cv, updatedAt: new Date() };
    this.cvs.set(id, updated);
    return updated;
  }

  async deleteCv(id: string): Promise<boolean> {
    return this.cvs.delete(id);
  }

  // Template operations
  async getTemplate(id: string): Promise<Template | undefined> {
    return this.templates.get(id);
  }

  async getAllTemplates(): Promise<Template[]> {
    return Array.from(this.templates.values());
  }

  async createTemplate(template: InsertTemplate): Promise<Template> {
    const id = randomUUID();
    const newTemplate: Template = { 
      ...template, 
      id, 
      previewImage: template.previewImage || null,
      isPremium: template.isPremium || 0
    };
    this.templates.set(id, newTemplate);
    return newTemplate;
  }

  // Order operations
  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrdersByUserId(userId: string): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter((order) => order.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getOrderByPaystackReference(reference: string): Promise<Order | undefined> {
    return Array.from(this.orders.values()).find((order) => order.paystackReference === reference);
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const newOrder: Order = {
      ...order,
      id,
      status: order.status || 'pending',
      userId: order.userId || null,
      paystackReference: order.paystackReference || null,
      paystackAccessCode: order.paystackAccessCode || null,
      downloadUrl: order.downloadUrl || null,
      completedAt: order.completedAt || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async updateOrder(id: string, order: Partial<InsertOrder>): Promise<Order | undefined> {
    const existing = this.orders.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...order, updatedAt: new Date() };
    this.orders.set(id, updated);
    return updated;
  }

  async decrementOrderEdits(orderId: string): Promise<void> {
    const order = this.orders.get(orderId);
    if (order && order.editsRemaining > 0) {
      order.editsRemaining -= 1;
      order.updatedAt = new Date();
      this.orders.set(orderId, order);
    }
  }

  // Cover Letter operations
  private coverLetters: Map<string, CoverLetter> = new Map();

  async getCoverLetter(id: string): Promise<CoverLetter | undefined> {
    return this.coverLetters.get(id);
  }

  async getCoverLettersByUserId(userId: string): Promise<CoverLetter[]> {
    return Array.from(this.coverLetters.values())
      .filter((cl) => cl.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createCoverLetter(coverLetter: InsertCoverLetter): Promise<CoverLetter> {
    const id = randomUUID();
    const newCoverLetter: CoverLetter = {
      ...coverLetter,
      id,
      userId: coverLetter.userId,
      cvId: coverLetter.cvId || null,
      companyDescription: coverLetter.companyDescription || null,
      pdfUrl: coverLetter.pdfUrl || null,
      pdfFileName: coverLetter.pdfFileName || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.coverLetters.set(id, newCoverLetter);
    return newCoverLetter;
  }

  async updateCoverLetter(id: string, coverLetter: Partial<InsertCoverLetter>): Promise<CoverLetter | undefined> {
    const existing = this.coverLetters.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...coverLetter, updatedAt: new Date() };
    this.coverLetters.set(id, updated);
    return updated;
  }

  async deleteCoverLetter(id: string): Promise<boolean> {
    return this.coverLetters.delete(id);
  }

  // Email Log operations
  private emailLogs: Map<string, EmailLog> = new Map();

  async getEmailLog(id: string): Promise<EmailLog | undefined> {
    return this.emailLogs.get(id);
  }

  async getEmailLogsByUserId(userId: string): Promise<EmailLog[]> {
    return Array.from(this.emailLogs.values())
      .filter((log) => log.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getAllEmailLogs(limit: number = 100): Promise<EmailLog[]> {
    return Array.from(this.emailLogs.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async createEmailLog(emailLog: InsertEmailLog): Promise<EmailLog> {
    const id = randomUUID();
    const newEmailLog: EmailLog = {
      ...emailLog,
      id,
      userId: emailLog.userId || null,
      providerId: emailLog.providerId || null,
      errorMessage: emailLog.errorMessage || null,
      metadata: emailLog.metadata || null,
      sentAt: emailLog.sentAt || null,
      createdAt: new Date(),
    };
    this.emailLogs.set(id, newEmailLog);
    return newEmailLog;
  }

  async updateEmailLog(id: string, emailLog: Partial<InsertEmailLog>): Promise<EmailLog | undefined> {
    const existing = this.emailLogs.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...emailLog };
    this.emailLogs.set(id, updated);
    return updated;
  }

  // API Key operations (admin only)
  private apiKeys: Map<string, ApiKey> = new Map();

  async getApiKey(service: string): Promise<ApiKey | undefined> {
    return this.apiKeys.get(service);
  }

  async getAllApiKeys(): Promise<ApiKey[]> {
    return Array.from(this.apiKeys.values())
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async upsertApiKey(apiKey: InsertApiKey): Promise<ApiKey> {
    const existing = this.apiKeys.get(apiKey.service);
    if (existing) {
      const updated: ApiKey = {
        ...existing,
        ...apiKey,
        updatedAt: new Date(),
      };
      this.apiKeys.set(apiKey.service, updated);
      return updated;
    } else {
      const newApiKey: ApiKey = {
        ...apiKey,
        id: randomUUID(),
        isActive: apiKey.isActive ?? 1,
        lastTestedAt: apiKey.lastTestedAt || null,
        testStatus: apiKey.testStatus || null,
        testMessage: apiKey.testMessage || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.apiKeys.set(apiKey.service, newApiKey);
      return newApiKey;
    }
  }

  async deleteApiKey(service: string): Promise<boolean> {
    return this.apiKeys.delete(service);
  }
  
  // Usage Tracking operations
  async incrementUsage(userId: string, feature: string): Promise<void> {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    // Find existing counter key
    const counterKey = `${userId}:${feature}:${now.getFullYear()}-${now.getMonth()}`;
    const existing = this.usageCounters.get(counterKey);
    
    if (existing) {
      existing.count += 1;
      existing.updatedAt = now;
    } else {
      this.usageCounters.set(counterKey, {
        id: randomUUID(),
        userId,
        feature,
        periodStart,
        periodEnd,
        count: 1,
        createdAt: now,
        updatedAt: now
      });
    }
  }
  
  async getUsageCount(userId: string, feature: string): Promise<number> {
    const now = new Date();
    const counterKey = `${userId}:${feature}:${now.getFullYear()}-${now.getMonth()}`;
    const counter = this.usageCounters.get(counterKey);
    return counter ? counter.count : 0;
  }
  
  async resetUsageForUser(userId: string): Promise<void> {
    // Remove all counters for this user
    const keysToDelete = Array.from(this.usageCounters.keys())
      .filter(key => key.startsWith(`${userId}:`));
    keysToDelete.forEach(key => this.usageCounters.delete(key));
  }
  
  async getUserPlanStatus(userId: string): Promise<{
    planId: string;
    planName: string;
    limits: Record<string, number>;
    usage: Record<string, number>;
    capabilities: string[];
  }> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    const planId = user.currentPlan;
    
    // Use imported configs instead of re-reading files
    const pricingConfig = (await import('../config/pricing.json')).default;
    const featuresConfig = (await import('../config/features.json')).default;
    
    const planConfig = pricingConfig.plans.find((p: any) => p.id === planId);
    if (!planConfig) {
      throw new Error("Plan not found");
    }
    
    // Get current month's usage for all features
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${now.getMonth()}`;
    
    const usage: Record<string, number> = {};
    Array.from(this.usageCounters.entries()).forEach(([key, counter]) => {
      if (key.startsWith(`${userId}:`) && key.endsWith(currentMonth)) {
        const feature = key.split(':')[1];
        usage[feature] = counter.count;
      }
    });
    
    // Get capabilities for this plan
    const capabilities: string[] = [];
    Object.entries(featuresConfig.features).forEach(([feature, config]: [string, any]) => {
      if (config.availableOn.includes(planId) || config.availableOn.includes("all")) {
        capabilities.push(feature);
      }
    });
    
    return {
      planId,
      planName: planConfig.name,
      limits: planConfig.limits,
      usage,
      capabilities,
    };
  }
}

// Use database storage if DATABASE_URL is available, otherwise use in-memory storage
export const storage: IStorage = process.env.DATABASE_URL
  ? new DbStorage()
  : new MemStorage();
