import { clerkMiddleware, createClerkClient, requireAuth } from "@clerk/express";
import type { RequestHandler } from "express";

if (!process.env.CLERK_SECRET_KEY) {
  throw new Error("CLERK_SECRET_KEY environment variable is required");
}

if (!process.env.CLERK_PUBLISHABLE_KEY) {
  throw new Error("CLERK_PUBLISHABLE_KEY environment variable is required");
}

export const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
});

// Export the middleware to be used in routes.ts
export const clerk = clerkMiddleware({
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY,
});

// Middleware to require authentication
export const isAuthenticated: RequestHandler = (req, res, next) => {
  requireAuth()(req, res, (err) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  });
};

// Helper to get user ID from Clerk auth
export function getUserId(req: any): string {
  return req.auth?.userId;
}
