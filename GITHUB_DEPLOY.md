# Quick GitHub & Netlify Deployment Guide

## Step 1: Push to GitHub

### Using Replit Git Panel (Easiest)
1. Click the **Version Control** icon in the left sidebar (looks like a branch)
2. Click **Create a Git repo**
3. Connect your GitHub account
4. Create a new repository or select an existing one
5. Commit your changes with a message like "Initial deployment"
6. Push to GitHub

### Using Command Line
```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial deployment - Devignite CV Platform"

# Create main branch
git branch -M main

# Go to GitHub.com and create a new repository, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git push -u origin main
```

## Step 2: Deploy to Netlify

### Important: This is a Fullstack App!

⚠️ **Note**: This app has both frontend AND backend. Netlify is primarily for static sites. Here are your best options:

### Option A: Deploy EVERYTHING to Render (Recommended)

**Why Render?**
- Supports fullstack apps
- Free PostgreSQL database included
- One platform for everything
- Supports Puppeteer for PDF generation

**Steps:**
1. Go to https://render.com and sign up
2. Click **"New" → "Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `devignite-cv`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Add environment variables (see .env.example)
6. Click **"Create Web Service"**

Your app will be live at: `https://devignite-cv.onrender.com`

### Option B: Split Deployment (Backend on Railway, Frontend on Netlify)

**Backend on Railway:**
1. Go to https://railway.app
2. Click **"New Project" → "Deploy from GitHub"**
3. Select your repository
4. Railway auto-detects Node.js
5. Add PostgreSQL database (click **"New" → "Database" → "PostgreSQL"**)
6. Add environment variables
7. Copy your Railway backend URL (e.g., `https://your-app.railway.app`)

**Frontend on Netlify:**
1. Go to https://netlify.com
2. Click **"Add new site" → "Import from Git"**
3. Connect GitHub
4. Configure:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist/public`
5. Add environment variables:
   - `VITE_CLERK_PUBLISHABLE_KEY`
   - `VITE_API_URL` (your Railway backend URL)
6. Deploy!

## Step 3: Set Up Database

### If using Render:
Database is automatically created! Just run migrations:
```bash
# In Render Shell (Dashboard → Shell tab)
npm run db:push
```

### If using Railway:
1. Click **"New" → "Database" → "Add PostgreSQL"**
2. Copy the `DATABASE_URL` from database settings
3. Add to environment variables
4. In Railway Shell:
```bash
npm run db:push
```

### If using Neon (External):
1. Go to https://neon.tech
2. Create new project
3. Copy connection string
4. Add as `DATABASE_URL` environment variable
5. Run migrations locally:
```bash
export DATABASE_URL="your-neon-url"
npm run db:push
```

## Step 4: Configure External Services

### Clerk (Authentication)
1. Go to https://dashboard.clerk.com
2. Click your application
3. Go to **"Domains"**
4. Add your deployment URL (e.g., `https://your-app.onrender.com`)
5. Copy production keys and add to environment variables

### Paystack (Payments)
1. Go to https://dashboard.paystack.com
2. Navigate to **Settings → API Keys & Webhooks**
3. Copy **Live keys** (not test keys!)
4. Add callback URL: `https://your-deployment-url/api/payments/callback`
5. Add to environment variables

### Update Environment Variables

Make sure these are set on your deployment platform:

```env
# Database
DATABASE_URL=postgresql://...

# Clerk
CLERK_SECRET_KEY=sk_live_...
CLERK_PUBLISHABLE_KEY=pk_live_...
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...

# Paystack (LIVE keys for production!)
PAYSTACK_SECRET_KEY=sk_live_...
PAYSTACK_PUBLIC_KEY=pk_live_...

# Groq AI
GROQ_API_KEY=gsk_...

# Resend Email
RESEND_API_KEY=re_...

# Node
NODE_ENV=production
```

## Step 5: Test Your Deployment

Visit your deployed URL and test:

1. ✅ Sign up / Sign in works
2. ✅ Create a CV
3. ✅ Preview CV
4. ✅ Visit pricing page
5. ✅ Test payment flow (use Paystack test cards if in test mode)
6. ✅ Download PDF
7. ✅ Check email delivery

## Troubleshooting

### "Site not loading"
- Check deployment logs on your platform
- Verify all environment variables are set
- Make sure database is connected

### "Authentication not working"
- Verify you're using **production** Clerk keys (pk_live_...)
- Check Clerk dashboard → Domains includes your deployment URL
- Clear browser cookies and try again

### "Payment not working"
- Use **live** Paystack keys for production
- Verify callback URL in Paystack dashboard matches your deployment
- Check Paystack dashboard for error logs

### "PDF not generating"
- Netlify doesn't support Puppeteer well
- Use Render or Railway instead (they support Puppeteer)

## Custom Domain (Optional)

### On Render:
1. Go to your service settings
2. Click **"Custom Domains"**
3. Add your domain
4. Update DNS records as instructed

### On Netlify:
1. Go to **Site settings → Domain management**
2. Click **"Add custom domain"**
3. Follow DNS configuration instructions

## Monitoring

- **Render**: Dashboard → Logs
- **Railway**: Project → Deployments → View Logs
- **Netlify**: Site → Deploys → Function logs
- **Database**: Check your database provider's dashboard

## Need Help?

- 📖 Full deployment guide: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- 🐛 Render support: https://render.com/docs
- 🚂 Railway support: https://docs.railway.app
- 🔵 Netlify support: https://answers.netlify.com

---

**Recommended Setup**: 
- **Render** for fullstack (easiest!)
- **Railway** if you need more flexibility
- **Netlify** only for frontend (requires separate backend deployment)
