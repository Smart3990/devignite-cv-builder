# Devignite CV Platform

A professional SaaS platform for creating, customizing, and purchasing CVs with AI-powered optimization.

## Features

- 🎨 **12 Professional CV Templates** - ATS-friendly designs inspired by RxResume
- 🤖 **AI-Powered Optimization** - CV content enhancement, cover letter generation, LinkedIn optimization, and ATS analysis using Groq AI
- 💳 **Paystack Payment Integration** - Secure payment processing in USD (US Dollars)
- 📧 **Email Delivery** - Automated CV delivery via Resend
- 📄 **PDF Generation** - High-quality PDF export using Puppeteer
- 🔐 **Clerk Authentication** - Modal-based sign-in with Google, GitHub, Apple, and Email
- 📦 **Package-Based Features** - Basic, Standard, and Premium tiers with different capabilities

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS + Shadcn UI
- TanStack Query for data fetching
- Wouter for routing
- Clerk React for authentication

### Backend
- Express.js with TypeScript
- Clerk Express for JWT verification
- Drizzle ORM with PostgreSQL (Neon)
- Puppeteer for PDF generation
- Groq AI (Llama 3.3 70B) for content optimization
- Paystack for payments
- Resend for emails

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- PostgreSQL database (or Neon account)
- Clerk account for authentication
- Paystack account (for payments)
- Groq API key (free tier available)
- Resend API key (for emails)

### Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database
PGHOST=your-host
PGPORT=5432
PGUSER=your-user
PGPASSWORD=your-password
PGDATABASE=your-database

# Clerk Authentication
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# Payments
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLIC_KEY=pk_test_...

# AI Features
GROQ_API_KEY=gsk_...

# Email
RESEND_API_KEY=re_...

# Session
SESSION_SECRET=your-random-secret-string
```

### Installation

```bash
# Install dependencies
npm install

# Push database schema
npm run db:push

# Start development server
npm run dev
```

The application will be available at `http://localhost:5000`

## Deployment

### Netlify Deployment

1. **Push to GitHub**:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/devignite.git
git push -u origin main
```

2. **Connect to Netlify**:
   - Go to [Netlify](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
     - Functions directory: (leave empty - we're using Express)

3. **Environment Variables**:
   - Add all environment variables from your `.env` file in Netlify dashboard
   - Go to Site settings → Environment variables
   - Add each variable

4. **Deploy**:
   - Click "Deploy site"
   - Netlify will build and deploy your application

### Important Notes for Production

- Update `REPLIT_DEV_DOMAIN` environment variable to your Netlify domain
- Configure Paystack callback URLs in Paystack dashboard
- Set up Clerk production instance with your production domain
- Update CORS settings if needed

## Package Tiers

### Basic - $4.99
- 1 CV template
- 1 edit
- PDF download

### Standard - $6.99
- 1 CV template
- 3 edits
- PDF download
- AI-powered cover letter generation

### Premium - $9.99
- 3 CV templates
- Unlimited edits
- PDF download
- AI-powered cover letter generation
- LinkedIn profile optimization
- ATS compatibility analysis

## AI Features

- **CV Optimization**: Enhance professional language and ATS compatibility
- **Cover Letter Generation**: Create personalized cover letters based on job details
- **LinkedIn Optimization**: Generate optimized headline and about section
- **ATS Analysis**: Score your CV's ATS compatibility with detailed recommendations

## API Endpoints

### Authentication
- `GET /api/auth/user` - Get current user

### CVs
- `GET /api/cvs` - List user's CVs
- `POST /api/cvs` - Create new CV
- `GET /api/cvs/:id` - Get CV by ID
- `PATCH /api/cvs/:id` - Update CV
- `DELETE /api/cvs/:id` - Delete CV

### Orders
- `GET /api/orders` - List user's orders
- `GET /api/orders/:id` - Get order details
- `GET /api/orders/:id/download` - Download CV PDF
- `POST /api/orders/:id/send-email` - Send CV via email

### Payments
- `POST /api/payments/initialize` - Initialize Paystack payment
- `GET /api/payments/verify/:reference` - Verify payment

### AI Features
- `POST /api/ai/optimize-cv` - Optimize CV content
- `POST /api/ai/generate-cover-letter` - Generate cover letter
- `POST /api/ai/optimize-linkedin` - Optimize LinkedIn profile
- `POST /api/ai/analyze-ats` - Analyze ATS compatibility

## License

MIT License - feel free to use this project for your own purposes.

## Support

For issues or questions, please open an issue on GitHub.
