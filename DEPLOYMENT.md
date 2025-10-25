# Deployment Guide for Devignite CV Platform

## Prerequisites

Before deploying, ensure you have:

1. A GitHub account
2. A Netlify account (or Vercel/Railway for alternatives)
3. All required API keys and environment variables
4. A PostgreSQL database (Neon, Supabase, or similar)

## Step 1: Prepare Environment Variables

You'll need the following environment variables in production:

### Database
```
DATABASE_URL=postgresql://user:password@host:port/database
PGHOST=your-neon-host.neon.tech
PGPORT=5432
PGUSER=your-username
PGPASSWORD=your-password
PGDATABASE=your-database
```

### Authentication (Clerk)
```
CLERK_SECRET_KEY=sk_live_...
CLERK_PUBLISHABLE_KEY=pk_live_...
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
```

### Payments (Paystack)
```
PAYSTACK_SECRET_KEY=sk_live_...
PAYSTACK_PUBLIC_KEY=pk_live_...
```

### AI (Groq)
```
GROQ_API_KEY=gsk_...
```

### Email (Resend)
```
RESEND_API_KEY=re_...
```

### Session
```
SESSION_SECRET=generate-a-random-string-here
```

## Step 2: Push to GitHub

```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Devignite CV Platform"

# Create main branch
git branch -M main

# Add remote (replace with your repository URL)
git remote add origin https://github.com/yourusername/devignite-cv.git

# Push to GitHub
git push -u origin main
```

## Step 3: Deploy to Netlify

### Option A: Netlify CLI (Recommended)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize site
netlify init

# Follow the prompts:
# - Create & configure a new site
# - Choose your team
# - Site name: devignite-cv (or your choice)
# - Build command: npm run build
# - Publish directory: dist

# Add environment variables
netlify env:set DATABASE_URL "your-database-url"
netlify env:set CLERK_SECRET_KEY "your-clerk-secret"
# ... add all other environment variables

# Deploy
netlify deploy --prod
```

### Option B: Netlify Dashboard

1. Go to [https://app.netlify.com](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Choose "GitHub" and authorize Netlify
4. Select your repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Base directory**: (leave empty)
6. Click "Show advanced" → "New variable" to add environment variables
7. Add all environment variables listed above
8. Click "Deploy site"

## Step 4: Configure External Services

### Clerk Configuration

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to "Domains" and add your Netlify domain
4. Update allowed origins and redirect URLs
5. Copy production keys (pk_live_... and sk_live_...)

### Paystack Configuration

1. Go to [Paystack Dashboard](https://dashboard.paystack.com)
2. Navigate to Settings → API Keys & Webhooks
3. Copy your Live API keys
4. Add webhook URL: `https://your-netlify-domain.netlify.app/api/webhooks/paystack`
5. Enable the following events:
   - charge.success
   - transfer.success
   - transfer.failed

### Database Setup

If using Neon:
1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project or use existing
3. Copy connection string
4. Run migrations:
```bash
# Set DATABASE_URL temporarily
export DATABASE_URL="your-neon-connection-string"

# Push schema
npm run db:push
```

## Step 5: Post-Deployment Checks

After deployment, verify:

1. ✅ Website loads at your Netlify URL
2. ✅ Clerk authentication works (sign up/sign in)
3. ✅ CV creation and preview work
4. ✅ Payment initialization works
5. ✅ PDF generation works
6. ✅ Email sending works
7. ✅ AI features work (if Groq API key is set)

## Troubleshooting

### Build Fails

**Issue**: Build fails with module not found errors
**Solution**: Ensure all dependencies are in `dependencies` (not `devDependencies`) in package.json

**Issue**: Environment variables not available during build
**Solution**: Prefix frontend env vars with `VITE_` and ensure they're set in Netlify

### Runtime Errors

**Issue**: 404 on page refresh
**Solution**: Ensure `netlify.toml` redirect rule is in place

**Issue**: Authentication not working
**Solution**: 
- Check Clerk domain configuration
- Verify all three Clerk keys are set correctly
- Ensure production keys (pk_live_..., sk_live_...) are used

**Issue**: Database connection fails
**Solution**:
- Verify DATABASE_URL is correct
- Check database allows connections from Netlify IPs
- For Neon, ensure "Enable pooling" is on

**Issue**: PDF generation fails
**Solution**:
- Netlify doesn't support Puppeteer well
- Consider using Vercel or Railway instead
- Or use a dedicated PDF service API

### Payment Issues

**Issue**: Paystack payments not working
**Solution**:
- Use Live API keys in production
- Update callback URL to your Netlify domain
- Configure webhook URL in Paystack dashboard

## Alternative Deployment Platforms

### Vercel (Better for Puppeteer)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Add environment variables
vercel env add DATABASE_URL
# ... add all other variables

# Deploy to production
vercel --prod
```

### Railway (Full Node.js support)

1. Go to [Railway](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Add environment variables
5. Railway will automatically deploy

## Custom Domain

### On Netlify

1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Enter your domain (e.g., devignite.com)
4. Configure DNS records as instructed
5. Enable HTTPS (automatic with Let's Encrypt)

## Monitoring

- **Netlify Analytics**: Monitor traffic and performance
- **Clerk Dashboard**: Track authentication metrics
- **Paystack Dashboard**: Monitor payments and transactions
- **Database Metrics**: Check Neon/database provider dashboard

## Security Checklist

- ✅ All API keys are environment variables (not in code)
- ✅ HTTPS is enabled
- ✅ Clerk authentication is properly configured
- ✅ Paystack webhook signature verification is enabled
- ✅ Database connections use SSL
- ✅ Session secrets are strong and unique
- ✅ CORS is properly configured

## Maintenance

### Updating the Application

```bash
# Make changes locally
git add .
git commit -m "Description of changes"
git push

# Netlify will automatically rebuild and deploy
```

### Database Migrations

```bash
# After updating schema.ts
npm run db:push
```

### Monitoring Logs

- Netlify: Site → Deploys → (latest deploy) → Deploy log
- Database: Check your database provider's dashboard
- Errors: Use Netlify Functions logs or Sentry for error tracking

## Support

For deployment issues:
- Netlify: https://answers.netlify.com/
- Clerk: https://clerk.com/support
- Paystack: support@paystack.com

For application issues:
- Check GitHub repository issues
- Review logs in Netlify dashboard
