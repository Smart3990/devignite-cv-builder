import { db } from "./db";
import { users, cvs, orders, templates, type User, type UpsertUser, type Cv, type InsertCv, type Order, type InsertOrder, type Template, type InsertTemplate } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations (Replit Auth required)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // CV operations
  getCv(id: string): Promise<Cv | undefined>;
  getCvsByUserId(userId: string): Promise<Cv[]>;
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
  getOrderByPaystackReference(reference: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, order: Partial<InsertOrder>): Promise<Order | undefined>;
  decrementOrderEdits(orderId: string): Promise<void>;
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
      // Insert new user
      const [user] = await db
        .insert(users)
        .values(userData)
        .returning();
      return user;
    }
  }

  // CV operations
  async getCv(id: string): Promise<Cv | undefined> {
    const result = await db.select().from(cvs).where(eq(cvs.id, id));
    return result[0];
  }

  async getCvsByUserId(userId: string): Promise<Cv[]> {
    return db.select().from(cvs).where(eq(cvs.userId, userId)).orderBy(desc(cvs.createdAt));
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
}

// In-memory storage for development/testing
export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private cvs: Map<string, Cv>;
  private templates: Map<string, Template>;
  private orders: Map<string, Order>;

  constructor() {
    this.users = new Map();
    this.cvs = new Map();
    this.templates = new Map();
    this.orders = new Map();
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


  // CV operations
  async getCv(id: string): Promise<Cv | undefined> {
    return this.cvs.get(id);
  }

  async getCvsByUserId(userId: string): Promise<Cv[]> {
    return Array.from(this.cvs.values())
      .filter((cv) => cv.userId === userId)
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
}

// Use database storage if DATABASE_URL is available, otherwise use in-memory storage
export const storage: IStorage = process.env.DATABASE_URL
  ? new DbStorage()
  : new MemStorage();
