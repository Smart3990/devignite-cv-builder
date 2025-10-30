# Devignite CV Platform

## Overview
Devignite is a professional SaaS platform for creating, customizing, and purchasing CVs. It aims to simplify CV creation through a guided multi-step wizard, offering 12 RxResume-inspired templates, and integrates Paystack for secure payment processing in USD. The platform includes full authentication via Clerk (supporting Google, GitHub, Apple, and email/password), and features intelligent content enhancement and AI-powered tools for ATS optimization, cover letter generation, and LinkedIn profile optimization. The business vision is to provide a streamlined, professional, and accessible CV building solution with global market potential.

## User Preferences
No specific user preferences were provided in the original `replit.md` file.

## System Architecture

### UI/UX Decisions
The platform features a professional SaaS design inspired by Linear/Notion, utilizing a primary brand color of HSL(15 85% 50%) (Orange-red) and the Inter font family. It incorporates Shadcn UI components with Tailwind CSS for styling, focusing on professional card layouts, subtle borders, consistent spacing, hover elevation effects, and full dark mode support. Dynamic CV template previews automatically scale to fit containers while maintaining an A4 aspect ratio.

### Technical Implementations
- **Frontend**: React 18 with TypeScript, Wouter for routing, and TanStack Query for data fetching.
- **Backend**: Express.js with TypeScript.
- **Authentication**: Clerk authentication with modal-based sign-in/sign-up (Google, GitHub, Apple, email/password). JWT tokens are used for backend verification.
- **Database**: PostgreSQL (Neon) with Drizzle ORM.
- **Payment**: Paystack integration for initializing, verifying, and handling webhooks for USD payments. Pricing tiers include Basic ($4.99), Standard ($6.99), and Premium ($9.99).
- **CV Templates**: 12 professionally designed templates inspired by RxResume, categorized into single-column (ATS-friendly), two-column (visual appeal), and creative layouts. Each template features unique skill badge/pill designs and supports profile photo display with consistent circular styling, theme-appropriate borders, and professional presentation.
- **Content Enhancement**: A rule-based `cv-enhancer.ts` utility provides ATS optimization and professional formatting.
- **AI-Powered Features**: Integration with Groq's free API (Llama 3.3 70B model) for:
  - CV content optimization
  - Personalized cover letter generation (with PDF generation)
  - LinkedIn profile optimization (with PDF generation)
  - ATS compatibility analysis with scoring and recommendations
  These features are accessible via a tabbed interface on the CV preview page.
- **PDF Generation**: Server-side PDF generation for CVs, cover letters, and LinkedIn optimization reports using Puppeteer with system Chromium.
- **File Upload System**: Secure profile photo upload functionality using Multer, with image validation (JPEG, PNG, WebP), 5MB file size limit, and authenticated-only access. Uploaded images are stored in `public/uploads/` and served statically.

### Feature Specifications
- **Multi-step CV Creation Wizard**: 5-step wizard guiding users through personal info, experience, education & skills, optional details (profile photo, custom sections, references), and template selection.
- **CV Preview**: Split-view preview with tabbed interface for customization and AI tools.
- **AI Features Panel**: Dedicated tab for AI tools including one-click CV optimization, cover letter generator, LinkedIn profile optimizer, and ATS compatibility checker. Users can preview PDFs (cover letter & LinkedIn) but must purchase a package to download them.
- **Dashboard**: For authenticated users, displaying order tracking with real-time status updates and package-based download features:
  - **Basic Package**: Download CV PDF only
  - **Standard Package**: Download CV + Cover Letter PDFs
  - **Premium Package**: Download CV + Cover Letter + LinkedIn Profile PDFs
  Downloads are only available for completed orders and are conditionally shown based on package features.
- **Order Processing**: Simulated processing after payment, with status updates and email delivery of CVs via Resend.
- **Download System**: 
  - Preview-only access to AI-generated PDFs before payment
  - Package-based download permissions enforced on both frontend and backend
  - Separate download endpoints for CV, cover letter, and LinkedIn PDFs (`/api/orders/:id/download/:type`)
  - Backend validates package permissions before serving files (returns 403 for unauthorized downloads)

### System Design Choices
- **Database Schema**: Includes `users`, `cvs`, `templates`, and `orders` tables.
- **API Endpoints**: Comprehensive set of RESTful endpoints for authentication, CV CRUD operations, order management, payment processing, and AI features. Webhooks are implemented for Paystack.
- **Project Structure**: Organized into `client/` (React frontend), `server/` (Express backend), and `shared/` (TypeScript types/schemas) directories.

## External Dependencies
- **Clerk**: Authentication service.
- **Paystack**: Payment gateway.
- **Groq AI**: AI service (Llama 3.3 70B model) for content generation and analysis.
- **Resend**: Email delivery service.
- **Puppeteer + Chromium**: For server-side PDF generation.
- **PostgreSQL (Neon)**: Database service.
- **Drizzle ORM**: Object-relational mapper.
- **Tailwind CSS**: Utility-first CSS framework.
- **Shadcn UI**: UI component library.
- **TanStack Query**: For data fetching.
- **Vite**: Frontend build tool.

## Recent Updates

### October 30, 2025 - Replit Environment Setup
**Changes Made**:
1. **Environment Setup**: Configured for Replit deployment with proper host settings (0.0.0.0) and proxy support
2. **Database**: PostgreSQL database provisioned and schema migrated successfully
3. **Integrations**: Resend email service connected via Replit integration
4. **Currency Update**: Changed from USD to Ghana Cedis (GHS) for Paystack compatibility
   - Basic CV: GHS 50
   - CV + Cover Letter: GHS 120
   - Comprehensive Package: GHS 150
5. **API Keys**: All required secrets configured (Clerk, Paystack, Groq)
6. **Deployment**: Configured for Autoscale deployment with build and run commands

### October 24, 2025 - Payment System & Premium Features
**Changes Made**:
1. **Currency**: Originally set to USD ($4.99, $6.99, $9.99), now updated to GHS (50, 120, 150)
2. **Real Paystack Integration**: All payments go through Paystack - no development mode bypass
3. **Payment Flow**: Pricing page → Paystack payment page → callback verification → order success → dashboard
4. **Premium Feature Indicators**: 
   - Cover Letter and LinkedIn Optimizer cards have golden gradient backgrounds
   - Crown icon and "PREMIUM" badge displayed prominently
   - Sparkles icon changed to amber/golden color for premium feel
5. **Smart Package Filtering**:
   - Tracks when users generate cover letters or LinkedIn profiles in localStorage
   - Basic package automatically blurred/hidden on pricing page if premium features used
   - Shows "Not available - Premium features required" overlay
   - Only Standard and Premium packages shown to users who used premium features

### Cover Letter Improvements
**Changes Made**:
1. Added professional subject line: "RE: Application for [Job Title]" to cover letter PDFs
2. Improved formatting with proper spacing between sections
3. Copy to Clipboard functionality already implemented for cover letter text

### Download Flow Restructuring
**Changes Made**:
1. Removed download buttons from AI Features Panel - users can now only preview cover letter and LinkedIn PDFs before payment
2. Implemented package-based downloads in the dashboard with conditional buttons based on purchased tier
3. Created separate backend download routes with permission validation for CV, cover letter, and LinkedIn PDFs
4. Fixed dashboard bug where download buttons weren't showing by removing unnecessary URL checks

**Current Limitation**: Cover letter and LinkedIn PDFs currently use placeholder content. Future enhancement needed to persist AI-generated content from the preview phase for use in downloaded PDFs.

## Replit Environment Setup (October 30, 2025)

### Configuration Completed
1. **Database**: PostgreSQL database provisioned and schema pushed successfully using Drizzle
2. **Vite Configuration**: Updated to allow all hosts (`allowedHosts: true`) for Replit proxy compatibility
3. **Resend Integration**: Connected via Replit Connectors for email delivery
4. **Environment Variables**: All required API keys configured:
   - Clerk (authentication)
   - Paystack (payments)
   - Groq (AI features)
   - Database credentials (auto-provisioned)
   - Session secret
5. **Workflow**: Configured to run on port 5000 with webview output
6. **Deployment**: Set up for autoscale deployment target with build and start scripts
7. **Dependencies**: All npm packages installed successfully
8. **Templates**: 12 CV templates seeded to database on startup

### Development Server
- **Dev Command**: `npm run dev` (runs Express server with Vite middleware)
- **Port**: 5000 (frontend and backend unified)
- **Host**: 0.0.0.0 (allows Replit proxy access)
- **Build Command**: `npm run build`
- **Production Command**: `npm start`

## Known Issues & Solutions

### Currency Configuration
The platform is currently configured to use Ghana Cedis (GHS) for Paystack payments. Pricing tiers:
- Basic CV: GHS 50
- CV + Cover Letter: GHS 120
- Comprehensive Package: GHS 150

To change currency:
1. Update `shared/schema.ts` PRICING_TIERS (price in pesewas, displayPrice)
2. Update `server/routes.ts` payment initialization currency field
3. Ensure your Paystack account supports the selected currency

### Replit Environment
The application is configured to run in the Replit environment with:
- **Port**: 5000 (both frontend and backend served from Express)
- **Host**: 0.0.0.0 for proper proxy support
- **Workflow**: npm run dev (development), npm start (production)
- **Database**: PostgreSQL (automatically provisioned)
- **Email**: Resend integration (no manual API key needed)