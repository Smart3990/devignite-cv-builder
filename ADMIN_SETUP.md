# 🔐 Admin Credential Setup Guide

This guide explains how to set up admin access for your Devignite CV Platform when deploying to **any hosting provider** (Render, Railway, Vercel, AWS, etc.).

## 📋 Quick Setup (3 Steps)

### Step 1: Configure Admin Credentials

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` and change the admin credentials:**
   ```env
   ADMIN_EMAIL=your-admin-email@example.com
   ADMIN_PASSWORD=YourSecurePassword123!
   ```

   ⚠️ **IMPORTANT**: Use a strong password for production!

### Step 2: Sign Up via Clerk

1. Deploy your application to your hosting provider
2. Visit your deployed app URL
3. Click "Sign Up" and register using the **exact email** you set in `ADMIN_EMAIL`
4. Use any authentication method (Google, GitHub, Apple, or email/password)

### Step 3: Restart Server

After signing up, restart your server:
- On most hosting providers, trigger a redeploy or restart
- The server will automatically promote your account to admin role
- Look for this log message: `✅ Updated existing user to admin: your-email@example.com`

## 🎯 Accessing Admin Dashboard

Once promoted to admin, access these routes:

- **Sales Overview**: `/admin/sales`
- **User Management**: `/admin/users`
- **Analytics**: `/admin/analytics`
- **Email Logs**: `/admin/emails`
- **API Keys**: `/admin/api-keys`

## 🚀 Deployment Instructions

### Render

1. In your Render dashboard, go to your service
2. Navigate to **Environment** → **Environment Variables**
3. Add:
   ```
   ADMIN_EMAIL=your-admin-email@example.com
   ADMIN_PASSWORD=YourSecurePassword123!
   ```
4. Save and redeploy

### Railway

1. In your Railway project, go to **Variables**
2. Add:
   ```
   ADMIN_EMAIL=your-admin-email@example.com
   ADMIN_PASSWORD=YourSecurePassword123!
   ```
3. Railway will auto-redeploy

### Vercel

1. Go to your project **Settings** → **Environment Variables**
2. Add both variables for **Production**, **Preview**, and **Development**
3. Redeploy from the **Deployments** tab

### AWS / DigitalOcean / Other

Set environment variables in your deployment configuration:
```bash
export ADMIN_EMAIL=your-admin-email@example.com
export ADMIN_PASSWORD=YourSecurePassword123!
```

## 🔒 Security Best Practices

### ✅ DO:
- Use a strong, unique password
- Change default credentials before deploying
- Keep credentials in `.env` (never commit to git)
- Use your hosting provider's secret management
- Enable 2FA on your Clerk account

### ❌ DON'T:
- Use the default credentials in production
- Commit `.env` file to git (it's in `.gitignore`)
- Share admin credentials via email/chat
- Use simple passwords like "admin123"

## 🔄 Changing Admin Credentials

### Method 1: Environment Variables (Recommended)

1. Update your hosting provider's environment variables
2. Restart the server
3. Sign up with the new email (or update existing user's role manually)

### Method 2: Database Query

Connect to your database and run:
```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'new-admin@example.com';
```

### Method 3: Remove `/dev-tools` Route (Production)

For production deployments, you can remove the dev-tools route from `client/src/App.tsx`:

```typescript
// Remove or comment out this route:
// <Route path="/dev-tools">
//   <ProtectedRoute component={DevToolsPage} />
// </Route>
```

## 🐛 Troubleshooting

### "Admin user not found" message

**Solution**: Sign up via Clerk first with the email you set in `ADMIN_EMAIL`, then restart the server.

### "No admin credentials in .env"

**Solution**: Make sure `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set in your environment variables.

### Can't access admin routes

**Solution**: 
1. Check server logs for admin initialization message
2. Verify your user role in database:
   ```sql
   SELECT email, role FROM users WHERE email = 'your-email@example.com';
   ```
3. If role is 'user', update it:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
   ```

## 📝 Environment Variables Reference

All variables needed for deployment:

```env
# Admin Credentials
ADMIN_EMAIL=admin@devignite.com
ADMIN_PASSWORD=ChangeThisPassword123!

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Paystack
PAYSTACK_SECRET_KEY=sk_live_...
PAYSTACK_PUBLIC_KEY=pk_live_...
VITE_PAYSTACK_PUBLIC_KEY=pk_live_...

# AI Features
GROQ_API_KEY=gsk_...

# Email
RESEND_API_KEY=re_...

# Session
SESSION_SECRET=random_string_here
NODE_ENV=production
PORT=5000
```

## 🎓 How It Works

1. **Server Startup**: `server/admin-init.ts` runs automatically
2. **Check Credentials**: Looks for `ADMIN_EMAIL` in environment
3. **Find User**: Searches database for user with that email
4. **Update Role**: If found, sets role to 'admin'
5. **Log Result**: Confirms admin promotion in server logs

This system is **portable** - it works on any hosting platform that supports environment variables!

## 📞 Support

If you encounter issues:
1. Check server logs for error messages
2. Verify environment variables are set correctly
3. Ensure database connection is working
4. Confirm you signed up with the correct email via Clerk
