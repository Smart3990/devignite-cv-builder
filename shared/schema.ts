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

// Pricing tiers
export const PRICING_TIERS = {
  basic: {
    name: "Basic CV",
    price: 5000, // GHS 50 in pesewas (100 pesewas = 1 GHS)
    displayPrice: "GHS 50",
    features: [
      "1 Professional CV Template",
      "PDF Download",
      "Basic Formatting",
      "Lifetime Access",
    ],
    editsAllowed: 1,
    hasCoverLetter: false,
    hasLinkedInOptimization: false,
    templateCount: 1,
  },
  standard: {
    name: "CV + Cover Letter",
    price: 12000, // GHS 120 in pesewas
    displayPrice: "GHS 120",
    features: [
      "1 Professional CV Template",
      "Matching Cover Letter",
      "PDF Download",
      "Advanced Formatting",
      "Lifetime Access",
    ],
    popular: true,
    editsAllowed: 3,
    hasCoverLetter: true,
    hasLinkedInOptimization: false,
    templateCount: 1,
  },
  premium: {
    name: "Comprehensive Package",
    price: 15000, // GHS 150 in pesewas
    displayPrice: "GHS 150",
    features: [
      "3 Professional CV Templates",
      "Matching Cover Letter",
      "LinkedIn Profile Optimization",
      "PDF Download",
      "Premium Support",
      "Lifetime Access",
    ],
    editsAllowed: 999, // Unlimited edits
    hasCoverLetter: true,
    hasLinkedInOptimization: true,
    templateCount: 3,
  },
} as const;

export type PricingTier = keyof typeof PRICING_TIERS;
