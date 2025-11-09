import { IStorage } from "./storage";

/**
 * Initialize admin user from environment variables
 * This runs on server startup and creates an admin user if:
 * 1. ADMIN_EMAIL and ADMIN_PASSWORD are set in .env
 * 2. No admin user exists yet with that email
 * 
 * This makes the app portable - works on any hosting platform!
 */
export async function initializeAdminUser(storage: IStorage): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  // Skip if credentials not configured
  if (!adminEmail || !adminPassword) {
    console.log("ℹ️  No admin credentials in .env - skipping admin initialization");
    return;
  }

  try {
    // Check if admin user already exists
    const existingUser = await storage.getUserByEmail(adminEmail);

    if (existingUser) {
      // User exists - update role to admin if not already
      if (existingUser.role !== 'admin') {
        await storage.updateUserRole(existingUser.id, 'admin');
        console.log(`✅ Updated existing user to admin: ${adminEmail}`);
      } else {
        console.log(`✅ Admin user already exists: ${adminEmail}`);
      }
    } else {
      // Create new admin user
      // Note: In production, you'll need to actually sign up via Clerk first
      // This is just to ensure the role is set to admin when they do
      console.log(`⚠️  Admin user not found: ${adminEmail}`);
      console.log(`📝 To create admin: Sign up with ${adminEmail} via Clerk, then restart server`);
    }
  } catch (error) {
    console.error("❌ Error initializing admin user:", error);
  }
}
