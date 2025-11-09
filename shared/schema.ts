import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, integer, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - Required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table - Updated for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: text("role").default("user").notNull(), // user, admin
  currentPlan: text("current_plan").default("basic").notNull(), // basic, pro, premium
  planStartDate: timestamp("plan_start_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// CV Templates table
export const templates = pgTable("templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // professional, creative, minimal, etc.
  previewImage: text("preview_image"), // URL or path to preview
  isPremium: integer("is_premium").default(0).notNull(), // 0 = free, 1 = premium
});

export const insertTemplateSchema = createInsertSchema(templates).omit({ id: true });
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Template = typeof templates.$inferSelect;

// CVs table - stores user CV data
export const cvs = pgTable("cvs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  templateId: varchar("template_id").references(() => templates.id),
  
  // Personal Information
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  location: text("location"),
  website: text("website"),
  linkedin: text("linkedin"),
  github: text("github"),
  summary: text("summary"),
  
  // Experience (stored as JSON array)
  experience: jsonb("experience").$type<Array<{
    title: string;
    company: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description: string;
  }>>().default([]),
  
  // Education (stored as JSON array)
  education: jsonb("education").$type<Array<{
    degree: string;
    institution: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description?: string;
  }>>().default([]),
  
  // Skills (stored as JSON array)
  skills: jsonb("skills").$type<Array<string>>().default([]),
  
  // Certifications (stored as JSON array)
  certifications: jsonb("certifications").$type<Array<{
    name: string;
    issuer: string;
    date: string;
    credentialId?: string;
    url?: string;
  }>>().default([]),
  
  // Achievements (stored as JSON array)
  achievements: jsonb("achievements").$type<Array<{
    title: string;
    description: string;
    date?: string;
  }>>().default([]),
  
  // Photo/Profile Picture
  photoUrl: text("photo_url"),
  
  // Custom Sections (stored as JSON array)
  customSections: jsonb("custom_sections").$type<Array<{
    title: string;
    content: string;
  }>>().default([]),
  
  // References (stored as JSON array, optional)
  references: jsonb("references").$type<Array<{
    name: string;
    position: string;
    company: string;
    phone?: string;
    email?: string;
  }>>().default([]),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCvSchema = createInsertSchema(cvs).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
}).extend({
  userId: z.string().optional(),
  templateId: z.string().optional().nullable(),
  experience: z.array(z.object({
    title: z.string().min(1, "Job title is required"),
    company: z.string().min(1, "Company is required"),
    location: z.string().optional(),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional(),
    current: z.boolean().default(false),
    description: z.string().min(1, "Description is required"),
  })).default([]),
  education: z.array(z.object({
    degree: z.string().min(1, "Degree is required"),
    institution: z.string().min(1, "Institution is required"),
    location: z.string().optional(),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional(),
    current: z.boolean().default(false),
    description: z.string().optional(),
  })).default([]),
  skills: z.array(z.string()).default([]),
  certifications: z.array(z.object({
    name: z.string().min(1, "Certification name is required"),
    issuer: z.string().min(1, "Issuer is required"),
    date: z.string().min(1, "Date is required"),
    credentialId: z.string().optional(),
    url: z.string().optional(),
  })).default([]),
  achievements: z.array(z.object({
    title: z.string().min(1, "Achievement title is required"),
    description: z.string().min(1, "Description is required"),
    date: z.string().optional(),
  })).default([]),
  photoUrl: z.string().optional(),
  customSections: z.array(z.object({
    title: z.string().min(1, "Section title is required"),
    content: z.string().min(1, "Section content is required"),
  })).default([]),
  references: z.array(z.object({
    name: z.string().min(1, "Reference name is required"),
    position: z.string().min(1, "Position is required"),
    company: z.string().min(1, "Company is required"),
    phone: z.string().optional(),
    email: z.string().email("Invalid email").optional(),
  })).default([]),
});

export type InsertCv = z.infer<typeof insertCvSchema>;
export type Cv = typeof cvs.$inferSelect;

// Orders table - tracks CV purchases
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  cvId: varchar("cv_id").references(() => cvs.id),
  
  packageType: text("package_type").notNull(), // basic, standard, premium
  amount: integer("amount").notNull(), // in cents (USD subunit - 100 cents = 1 USD)
  currency: text("currency").default("USD").notNull(),
  
  status: text("status").default("pending").notNull(), // pending, processing, completed, failed
  progress: integer("progress").default(0).notNull(), // 0-100
  
  paystackReference: text("paystack_reference"),
  paystackAccessCode: text("paystack_access_code"),
  
  downloadUrl: text("download_url"), // URL to generated PDF
  pdfFileName: text("pdf_file_name"), // Stored PDF file name
  coverLetterUrl: text("cover_letter_url"), // URL to generated cover letter PDF (standard/premium)
  linkedinOptimizationUrl: text("linkedin_optimization_url"), // URL to LinkedIn optimization PDF (premium)
  
  // Package features tracking
  editsRemaining: integer("edits_remaining").default(0).notNull(), // Number of edits allowed based on package
  hasCoverLetter: integer("has_cover_letter").default(0).notNull(), // 0 = no, 1 = yes
  hasLinkedInOptimization: integer("has_linkedin_optimization").default(0).notNull(), // 0 = no, 1 = yes
  templateCount: integer("template_count").default(1).notNull(), // Number of template variations allowed
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const insertOrderSchema = createInsertSchema(orders).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
}).extend({
  completedAt: z.date().optional().nullable(),
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// Pricing tiers - Aligned with config/pricing.json
export const PRICING_TIERS = {
  basic: {
    name: "Basic Plan",
    price: 0, // Free
    displayPrice: "Free",
    features: [
      "Create 1 Professional CV",
      "Generate 1 Cover Letter",
      "Access to 6 Free Templates",
      "1 AI CV Optimization",
      "PDF Download (CV Only)",
      "Basic ATS Compatibility Check",
      "Standard Formatting Options",
      "Email Support (48hr response)",
    ],
    editsAllowed: 1,
    hasCoverLetter: true,
    hasLinkedInOptimization: false,
    templateCount: 6,
  },
  pro: {
    name: "Pro Plan",
    price: 5000, // GHS 50 in pesewas (100 pesewas = 1 GHS)
    displayPrice: "GHS 50",
    features: [
      "Create Unlimited CVs",
      "Generate Unlimited Cover Letters",
      "Access to 9 Templates (Free + Standard)",
      "3 AI CV Optimizations per month",
      "Cover Letter Tone Editor",
      "10 Edits per CV",
      "Advanced ATS Compatibility Analysis",
      "PDF Downloads (CV + Cover Letter)",
      "Email Analytics Dashboard",
      "Cloud Storage (Last 10 CVs)",
      "CV Version History",
      "Professional Formatting Options",
      "Email Support (24hr response)",
    ],
    popular: true,
    editsAllowed: 10,
    hasCoverLetter: true,
    hasLinkedInOptimization: false,
    templateCount: 9,
  },
  premium: {
    name: "Premium Plan",
    price: 9900, // GHS 99 in pesewas
    displayPrice: "GHS 99",
    features: [
      "Create Unlimited CVs",
      "Generate Unlimited Cover Letters",
      "Access to ALL 12 Templates (Including Premium)",
      "Unlimited AI CV Optimizations",
      "LinkedIn Profile Optimization with PDF",
      "AI-Powered Job Fit Analysis",
      "Cover Letter Tone & Style Editor",
      "Unlimited Edits on All Documents",
      "Advanced ATS Compatibility Score",
      "PDF Downloads (CV + Cover Letter + LinkedIn)",
      "Complete Analytics Dashboard",
      "Unlimited Cloud Storage & History",
      "Direct Recruiter-Share Links",
      "Custom Branding Options",
      "Priority Support (4hr response)",
      "Early Access to New Features",
    ],
    editsAllowed: 999, // Unlimited edits
    hasCoverLetter: true,
    hasLinkedInOptimization: true,
    templateCount: 12,
  },
} as const;

export type PricingTier = keyof typeof PRICING_TIERS;

// PDF Jobs table - tracks PDF generation jobs
export const pdfJobs = pgTable("pdf_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  cvId: varchar("cv_id").references(() => cvs.id, { onDelete: 'cascade' }),
  orderId: varchar("order_id").references(() => orders.id, { onDelete: 'cascade' }),
  
  status: text("status").notNull().default("queued"), // queued, processing, done, error
  pages: integer("pages"),
  sizeBytes: integer("size_bytes"),
  url: text("url"),
  template: text("template"),
  error: text("error"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPdfJobSchema = createInsertSchema(pdfJobs).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export type InsertPdfJob = z.infer<typeof insertPdfJobSchema>;
export type PdfJob = typeof pdfJobs.$inferSelect;

// Usage Counters table - tracks feature usage for plan enforcement
export const usageCounters = pgTable("usage_counters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  feature: text("feature").notNull(), // ai_run, pdf_generation, etc.
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  count: integer("count").default(0).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUsageCounterSchema = createInsertSchema(usageCounters).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export type InsertUsageCounter = z.infer<typeof insertUsageCounterSchema>;
export type UsageCounter = typeof usageCounters.$inferSelect;

// Cover Letters table - stores generated cover letters
export const coverLetters = pgTable("cover_letters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  cvId: varchar("cv_id").references(() => cvs.id, { onDelete: 'cascade' }),
  
  // Company and position details
  targetCompany: text("target_company").notNull(),
  targetPosition: text("target_position").notNull(),
  companyDescription: text("company_description"),
  
  // Generated content
  content: text("content").notNull(),
  tone: text("tone").notNull(), // formal, friendly, creative, confident
  
  // PDF details
  pdfUrl: text("pdf_url"),
  pdfFileName: text("pdf_file_name"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCoverLetterSchema = createInsertSchema(coverLetters).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export type InsertCoverLetter = z.infer<typeof insertCoverLetterSchema>;
export type CoverLetter = typeof coverLetters.$inferSelect;

// Email Logs table - tracks all sent emails
export const emailLogs = pgTable("email_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  
  // Email details
  recipient: text("recipient").notNull(),
  subject: text("subject").notNull(),
  template: text("template").notNull(),
  
  // Status tracking
  status: text("status").notNull(), // queued, sending, sent, failed
  provider: text("provider").notNull(), // resend, sendgrid, etc.
  providerId: text("provider_id"), // External ID from email provider
  errorMessage: text("error_message"),
  
  // Metadata
  metadata: jsonb("metadata").$type<Record<string, any>>(),
  
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEmailLogSchema = createInsertSchema(emailLogs).omit({ 
  id: true, 
  createdAt: true 
});

export type InsertEmailLog = z.infer<typeof insertEmailLogSchema>;
export type EmailLog = typeof emailLogs.$inferSelect;

// API Keys table - stores encrypted integration keys (admin only)
export const apiKeys = pgTable("api_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Key details
  service: text("service").notNull().unique(), // groq, paystack, resend, etc.
  displayName: text("display_name").notNull(),
  keyValue: text("key_value").notNull(), // Encrypted value
  
  // Status and metadata
  isActive: integer("is_active").default(1).notNull(), // 0 = inactive, 1 = active
  lastTestedAt: timestamp("last_tested_at"),
  testStatus: text("test_status"), // success, failed
  testMessage: text("test_message"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertApiKeySchema = createInsertSchema(apiKeys).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type ApiKey = typeof apiKeys.$inferSelect;
