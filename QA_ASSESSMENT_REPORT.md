# SmartCV Platform - Comprehensive QA Assessment Report
**Date:** November 8, 2025  
**Platform:** SmartCV (formerly DevIgnite)  
**Environment:** Development (Replit)  
**Assessment Lead:** Senior Software Engineer & QA Lead  
**Status:** Mid-Development (Foundational Infrastructure Complete, Features 5-15 Pending)

---

## ASSUMPTIONS & REQUIRED INFO

### Platform Scope
- **Application Type:** Full-stack CV/Cover Letter generator with AI features
- **Tech Stack:** React + Vite (Frontend), Express + PostgreSQL (Backend), Clerk Auth, Groq AI
- **Pricing Tiers:** Basic (Free), Pro (GHS 50), Premium (GHS 99)
- **User Roles:** User, Admin

### Current Implementation Status
✅ **COMPLETE:**
- Core CV generation with PDF export
- Template system (Azurill, Onix, Corsola)
- User authentication (Clerk)
- Payment gateway integration (Paystack)
- Database schema with new tables (users, cvs, orders, coverLetters, emailLogs, apiKeys)
- Config-driven system (pricing.json, features.json, email-templates.json)
- RBAC middleware (not yet wired)
- Auto Basic plan assignment

⏳ **PENDING (Tasks 5-15):**
- Cover Letter Generator UI
- Admin Dashboard (/admin routes)
- Email notification system
- Usage tracking & limit enforcement
- Feature gating by plan
- Payment upgrade flow integration

### Required Credentials
- ✅ CLERK_PUBLISHABLE_KEY (configured)
- ✅ CLERK_SECRET_KEY (configured)
- ✅ GROQ_API_KEY (configured)
- ⚠️ PAYSTACK_SECRET_KEY (needs verification)
- ⚠️ Email service credentials (pending implementation)

### Test Accounts Needed
- Standard user account (Basic plan)
- Pro plan user
- Premium plan user
- Admin account
- Test payment cards (Paystack test mode)

---

## TEST APPROACH SUMMARY

This assessment uses **risk-based exploratory testing** combined with **checklist-driven regression** to identify critical issues before feature completion. Testing prioritizes:

1. **Data Integrity** - Ensure schema migration didn't corrupt existing CVs/orders
2. **Authentication Flow** - Verify Clerk integration and auto plan assignment
3. **Payment Critical Path** - Paystack integration, webhook handling, order fulfillment
4. **AI Feature Functionality** - CV optimization, cover letter generation, ATS analysis
5. **Security Posture** - RBAC readiness, API exposure, sensitive data handling
6. **UX & Accessibility** - Navigation, responsive design, keyboard access

**Test Philosophy:** Manual, human-driven diagnosis using browser DevTools, network inspection, database queries, and code review. No automated testing tools. Focus on reproducible steps and actionable remediation.

---

## MANUAL TEST PLAN (Table of Contents)

### Section A: Critical Path Testing
A1. Authentication & Authorization  
A2. CV Creation & Management  
A3. Template Selection & Preview  
A4. PDF Generation & Download  
A5. Payment Flow (Paystack)  
A6. AI Features (Groq Integration)  

### Section B: Feature Coverage
B1. Dashboard - My CVs  
B2. Pricing Page  
B3. Order Management  
B4. Profile Management  

### Section C: Data & Schema Validation
C1. Database Schema Integrity  
C2. Auto Basic Plan Assignment  
C3. RBAC Middleware Readiness  
C4. Config System Validation  

### Section D: Security & Privacy
D1. Authentication Security  
D2. API Authorization  
D3. Sensitive Data Exposure  
D4. CSRF/XSS Manual Probes  

### Section E: Accessibility & UX
E1. Keyboard Navigation  
E2. Screen Reader Compatibility  
E3. Color Contrast  
E4. Mobile Responsiveness  

### Section F: Performance Smoke Tests
F1. Page Load Times  
F2. PDF Generation Performance  
F3. AI API Response Times  

---

## SECTION A: CRITICAL PATH TESTING

### A1. Authentication & Authorization

#### TEST CASE A1.1: New User Signup
**Objective:** Verify Clerk signup + auto Basic plan assignment

**Steps:**
1. Navigate to `/` (landing page)
2. Click "Sign Up" button
3. Complete Clerk signup flow with new email
4. Observe redirect to dashboard
5. Check database: `SELECT * FROM users WHERE email = 'test@example.com'`

**Expected Results:**
- User created in `users` table
- `role` = 'user'
- `currentPlan` = 'basic'
- `planStartDate` = current timestamp
- Dashboard shows "Basic Plan" badge

**Screenshots to Capture:**
- Signup form
- Dashboard after signup
- Database query result (pgAdmin or SQL tool)

**Priority:** CRITICAL  
**Current Status:** ⚠️ NEEDS VERIFICATION

---

#### TEST CASE A1.2: User Login
**Steps:**
1. Navigate to `/`
2. Click "Login"
3. Enter valid credentials
4. Observe redirect

**Expected:** Redirect to `/dashboard` with user data loaded

**Priority:** CRITICAL

---

### A2. CV Creation & Management

#### TEST CASE A2.1: Create New CV
**Steps:**
1. Login as Basic user
2. Navigate to `/create`
3. Fill all required fields:
   - Personal Info (Name, Email, Phone, Location)
   - Work Experience (Title, Company, Dates, Description)
   - Education (Degree, School, Dates)
   - Skills (at least 3)
4. Click "Save Draft"
5. Check API response in Network tab
6. Verify database: `SELECT * FROM cvs WHERE user_id = 'current_user_id'`

**Expected Results:**
- CV saved to database
- `userId` matches logged-in user
- All fields stored correctly
- Success toast notification
- Redirect to preview or dashboard

**Actual Behavior:** ✅ LIKELY WORKING (based on existing code review)

**Screenshots:**
- Form filled out
- Network tab POST /api/cvs response
- Database record

**Priority:** CRITICAL

---

#### TEST CASE A2.2: Edit Existing CV
**Steps:**
1. From dashboard, click "Edit" on existing CV
2. Modify work experience title
3. Save changes
4. Verify PATCH /api/cvs/:id response
5. Check database for updated value

**Expected:** CV updated, `updatedAt` timestamp refreshed

**Priority:** HIGH

---

### A3. Template Selection & Preview

#### TEST CASE A3.1: View Templates
**Steps:**
1. Navigate to `/create`
2. Click "Choose Template" or template selector
3. Observe template options (Azurill, Onix, Corsola)
4. Verify API: GET /api/templates returns all templates
5. Check `isPremium` flag on templates

**Expected:**
- All 3 templates visible
- Premium templates show "Premium" badge (if applicable)
- Basic users can access free templates only

**Current Issue:** ⚠️ **Template access control NOT ENFORCED** - All templates accessible regardless of plan

**Priority:** HIGH

---

### A4. PDF Generation & Download

#### TEST CASE A4.1: Generate CV PDF
**Steps:**
1. Create/edit CV with all fields populated
2. Select template (Azurill)
3. Click "Download PDF" or "Generate PDF"
4. Observe PDF generation process
5. Check browser downloads folder
6. Open PDF and verify:
   - All fields rendered
   - Template styling applied
   - No text overflow
   - Professional formatting

**Expected:**
- PDF downloads successfully
- All data present and formatted correctly
- File size < 2MB
- Filename: `CV_[Name]_[Date].pdf`

**Current Status:** ✅ LIKELY WORKING (PDF generator implemented)

**Screenshots:**
- Download dialog
- Opened PDF (all pages)

**Priority:** CRITICAL

---

### A5. Payment Flow (Paystack)

#### TEST CASE A5.1: Initiate Payment for Pro Plan
**Steps:**
1. Login as Basic user
2. Navigate to `/pricing`
3. Click "Upgrade to Pro" (GHS 50)
4. Observe redirect to Paystack payment page
5. Check Network tab: POST /api/payments/initialize
6. Verify response contains:
   - `authorization_url`
   - `reference`
   - `access_code`

**Expected:**
- Redirect to Paystack hosted page
- User sees payment form
- Order created in `orders` table with status 'pending'

**Current Issue:** ⚠️ **Payment initialization needs Paystack API key verification**

**Priority:** CRITICAL

---

#### TEST CASE A5.2: Complete Payment (Test Card)
**Steps:**
1. On Paystack page, use test card: 4084084084084081
2. Enter test CVV: 408, Expiry: 12/30
3. Complete payment
4. Observe redirect to `/payment/callback`
5. Verify:
   - Order status updated to 'completed'
   - User `currentPlan` updated to 'pro'
   - `planStartDate` updated

**Expected:**
- Success message displayed
- User now has Pro plan access
- Database reflects upgrade

**Current Issue:** ⚠️ **NEEDS MANUAL TESTING** - Webhook handling implemented but not verified

**Priority:** CRITICAL

---

### A6. AI Features (Groq Integration)

#### TEST CASE A6.1: Optimize CV with AI
**Steps:**
1. Create CV with basic content
2. Click "Optimize with AI" button
3. Observe loading state
4. Check Network: POST /api/ai/optimize-cv
5. Verify response contains optimized content
6. Apply changes to CV

**Expected:**
- AI returns enhanced job descriptions
- Response time < 10 seconds
- Improved wording applied to CV

**Current Issue:** ⚠️ **GROQ_API_KEY configured but AI features need limit enforcement**

**Priority:** HIGH

---

#### TEST CASE A6.2: Generate Cover Letter
**Steps:**
1. From CV, click "Generate Cover Letter"
2. Enter job details (title, company)
3. Submit
4. Verify POST /api/ai/generate-cover-letter
5. Check response format

**Expected:**
- Cover letter generated in < 15 seconds
- Professional tone
- Incorporates CV data

**Current Issue:** ⚠️ **API route exists but NO UI PAGE** - Blocking feature

**Priority:** HIGH

---

## SECTION C: DATA & SCHEMA VALIDATION

### C1. Database Schema Integrity

#### TEST CASE C1.1: Verify Schema Migration
**Steps:**
1. Connect to database
2. Run: `\dt` (list tables)
3. Verify tables exist:
   - users (with role, currentPlan, planStartDate columns)
   - cvs
   - templates
   - orders
   - coverLetters (NEW)
   - emailLogs (NEW)
   - apiKeys (NEW)
4. Run: `\d users` to inspect columns
5. Verify foreign keys: `\d coverLetters` should reference users

**Expected:**
- All tables present
- New columns added without data loss
- Foreign keys intact

**Priority:** CRITICAL

---

### C2. Auto Basic Plan Assignment

#### TEST CASE C2.1: New User Gets Basic Plan
**Steps:**
1. Create new user via Clerk signup
2. Query database: 
   ```sql
   SELECT id, email, role, currentPlan, planStartDate 
   FROM users 
   WHERE email = 'newuser@test.com'
   ```

**Expected:**
```
| id | email | role | currentPlan | planStartDate |
|----|-------|------|-------------|---------------|
| ... | newuser@... | user | basic | 2025-11-08... |
```

**Current Status:** ✅ IMPLEMENTED (needs manual verification)

**Priority:** CRITICAL

---

### C3. RBAC Middleware Readiness

#### TEST CASE C3.1: Verify RBAC Functions
**Steps:**
1. Review code: `server/middleware/rbac.ts`
2. Verify functions exist:
   - `requireAdmin()`
   - `requirePlan(minPlan)`
   - `hasFeatureAccess(userId, feature)`
   - `hasReachedLimit(userId, feature)`
3. Check: **Are these wired into routes.ts?**

**Expected:**
- All functions implemented ✅
- **NOT YET WIRED** to any routes ⚠️

**Current Issue:** 🔴 **CRITICAL: RBAC middleware exists but NOT USED** - All routes currently unprotected by plan limits

**Priority:** CRITICAL - SECURITY RISK

---

## SECTION D: SECURITY & PRIVACY

### D1. Authentication Security

#### TEST CASE D1.1: Unauthorized API Access
**Steps:**
1. Logout (clear Clerk session)
2. Use cURL or Postman to access:
   ```
   GET https://[domain]/api/cvs
   ```
3. Observe response

**Expected:** 401 Unauthorized  
**Current:** ✅ PROTECTED by `isAuthenticated` middleware

**Priority:** CRITICAL

---

#### TEST CASE D1.2: Access Other User's CV
**Steps:**
1. Login as User A
2. Create CV (note ID: cv_123)
3. Login as User B
4. Try to access: GET /api/cvs/cv_123

**Expected:** 403 Forbidden or 404 Not Found (user can only see their own CVs)

**Current Issue:** ⚠️ **NEEDS CODE REVIEW** - Check if ownership verification exists in routes

**Priority:** CRITICAL - IDOR VULNERABILITY RISK

---

### D2. API Authorization

#### TEST CASE D2.1: Admin Route Protection (Pending)
**Steps:**
1. Login as regular user
2. Attempt to access: GET /api/admin/users (when implemented)

**Expected:** 403 Forbidden

**Current Status:** ⚠️ **NO ADMIN ROUTES EXIST YET** - Will be critical when implemented

**Priority:** CRITICAL (for future)

---

### D3. Sensitive Data Exposure

#### TEST CASE D3.1: Check API Key Storage
**Steps:**
1. Query: `SELECT * FROM api_keys`
2. Verify keys are encrypted/hashed
3. Check: Are keys returned in API responses?

**Expected:**
- Keys stored encrypted
- API responses mask keys (show only last 4 chars)

**Current Status:** ⚠️ **TABLE EXISTS BUT NO ENCRYPTION IMPLEMENTED**

**Priority:** HIGH - SECURITY RISK

---

## SECTION E: ACCESSIBILITY & UX

### E1. Keyboard Navigation

#### TEST CASE E1.1: Tab Through Forms
**Steps:**
1. Navigate to `/create`
2. Press Tab repeatedly
3. Verify focus order: Name → Email → Phone → ... → Save button

**Expected:**
- All form fields reachable via Tab
- Visual focus indicator present
- No focus traps

**Priority:** MEDIUM

---

### E2. Screen Reader Compatibility

#### TEST CASE E2.1: Form Labels
**Steps:**
1. Inspect form fields
2. Verify each input has associated `<label>` with `htmlFor`
3. Check ARIA labels on custom components

**Expected:**
- All inputs labeled
- Button purposes clear
- Error messages announced

**Current Issue:** ⚠️ **NEEDS MANUAL AUDIT** - Code review suggests proper labels but needs verification

**Priority:** MEDIUM

---

### E3. Mobile Responsiveness

#### TEST CASE E3.1: Mobile View (375px)
**Steps:**
1. Open DevTools
2. Set viewport to iPhone SE (375x667)
3. Navigate through all pages
4. Verify:
   - No horizontal scroll
   - Buttons touchable (min 44x44px)
   - Text readable without zoom

**Expected:**
- Fully responsive
- Touch-friendly UI

**Current Status:** ✅ LIKELY WORKING (Tailwind responsive classes used)

**Priority:** HIGH

---

## SECTION F: PERFORMANCE SMOKE TESTS

### F1. Page Load Times

#### TEST CASE F1.1: Landing Page Load
**Steps:**
1. Open DevTools Network tab
2. Hard refresh `/` (Ctrl+Shift+R)
3. Check "Load" time in Network summary

**Expected:** < 2 seconds on 3G

**Priority:** MEDIUM

---

### F2. PDF Generation Performance

#### TEST CASE F2.1: Generate 3-Page CV PDF
**Steps:**
1. Create CV with 10 work experiences
2. Click "Generate PDF"
3. Measure time from click to download

**Expected:** < 5 seconds

**Current Status:** ✅ LIKELY ACCEPTABLE (pdf-lib is performant)

**Priority:** MEDIUM

---

## CRITICAL FINDINGS - BUG REPORT

### 🔴 CRITICAL ISSUES

---

#### BUG-001: RBAC Middleware Not Enforced on Routes
**Severity:** CRITICAL  
**Priority:** P0 - BLOCKER  
**Category:** Security / Authorization

**Environment:** Development  
**Affected Routes:** ALL protected routes

**Steps to Reproduce:**
1. Review `server/routes.ts`
2. Check route middlewares - e.g., `app.post("/api/cvs", isAuthenticated, ...)`
3. Observe: Only `isAuthenticated` is used
4. RBAC functions (`requireAdmin`, `requirePlan`) are NOT applied

**Actual Result:**
- All users can access all features regardless of plan
- No plan limit enforcement
- Admin routes (when added) will be unprotected

**Expected Result:**
- Pro features should use `requirePlan('pro')`
- Premium templates should check plan tier
- Admin routes should use `requireAdmin()`

**Root Cause:**
RBAC middleware created in `server/middleware/rbac.ts` but never imported/applied in `server/routes.ts`

**Suggested Fix:**
```typescript
// In server/routes.ts
import { requireAdmin, requirePlan } from './middleware/rbac';

// Apply to routes:
app.post("/api/ai/optimize-cv", isAuthenticated, requirePlan('pro'), async (req, res) => {
  // ...
});
```

**Business Impact:**
- Users can abuse free tier
- Revenue loss (no upgrade enforcement)
- Security risk for admin features

**Rollback Plan:** N/A (feature not yet in production)

**Effort:** Small (2-4 hours)

---

#### BUG-002: Usage Limit Tracking Not Implemented
**Severity:** CRITICAL  
**Priority:** P0 - BLOCKER  
**Category:** Business Logic / Billing

**Steps to Reproduce:**
1. Review `server/middleware/rbac.ts` line ~100
2. Find `hasReachedLimit()` function
3. Observe placeholder: `const current = 0; // TODO: Implement actual usage tracking`

**Actual Result:**
- Function always returns `reached: false`
- Users can generate unlimited CVs/cover letters
- Plan limits not enforced

**Expected Result:**
- Track actual CV/Cover Letter generations per user per month
- Enforce limits: Basic (1 CV, 1 CL), Pro (3 CVs, 3 CLs), Premium (unlimited)

**Suggested Fix:**
Create `usageTracking` table:
```sql
CREATE TABLE usage_tracking (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  feature VARCHAR NOT NULL,
  count INTEGER DEFAULT 1,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

Implement counter in storage layer.

**Effort:** Medium (1-2 days)

---

#### BUG-003: Admin Dashboard Routes Missing
**Severity:** HIGH  
**Priority:** P1  
**Category:** Feature Incomplete

**Actual Result:**
- No `/admin` routes in App.tsx
- No admin UI pages exist
- Admin functionality not accessible

**Expected Result:**
Per project requirements, admin should have:
- Sales overview
- User management
- Analytics dashboard
- Email logs viewer
- API key management console

**Effort:** Large (3-5 days for all admin pages)

---

### ⚠️ HIGH PRIORITY ISSUES

---

#### BUG-004: Cover Letter Generator UI Missing
**Severity:** HIGH  
**Priority:** P1  
**Category:** Feature Incomplete

**Actual Result:**
- API route exists: POST /api/ai/generate-cover-letter
- No frontend page at `/cover-letter` or `/create-cover-letter`
- Users cannot access this paid feature

**Expected Result:**
Cover Letter page with:
- Job details form (title, company, description)
- Tone selector (Formal, Friendly, Creative, Confident)
- Preview pane
- Edit capability
- PDF download

**Effort:** Medium (2-3 days)

---

#### BUG-005: API Key Encryption Not Implemented
**Severity:** HIGH  
**Priority:** P1  
**Category:** Security

**Steps to Reproduce:**
1. Query: `SELECT * FROM api_keys`
2. Observe: `key_value` column stores plaintext (if any keys added)

**Expected:**
- Keys encrypted at rest using AES-256
- Only admins can view keys
- Keys masked in API responses

**Suggested Fix:**
Use Node.js `crypto` module for encryption/decryption before storage

**Effort:** Small (4-6 hours)

---

#### BUG-006: Template Access Control Not Enforced
**Severity:** HIGH  
**Priority:** P2  
**Category:** Business Logic

**Steps to Reproduce:**
1. Login as Basic user
2. Create CV
3. Select ANY template (including premium ones)
4. Generate PDF

**Actual Result:**
All templates accessible to all users

**Expected Result:**
- Basic: Only Azurill (free template)
- Pro: Azurill + Onix
- Premium: All templates

**Suggested Fix:**
Add check in `/api/cvs` POST/PATCH:
```typescript
const template = await storage.getTemplate(cvData.templateId);
if (template.isPremium && user.currentPlan === 'basic') {
  return res.status(403).json({ error: 'Premium template requires upgrade' });
}
```

**Effort:** Tiny (1-2 hours)

---

### ⚠️ MEDIUM PRIORITY ISSUES

---

#### BUG-007: Email System Not Implemented
**Severity:** MEDIUM  
**Priority:** P2  
**Category:** Feature Incomplete

**Actual Result:**
- Email templates exist in `config/email-templates.json`
- No email sending service integrated
- Resend integration listed as "NEEDS SETUP"
- Users don't receive:
  - Welcome emails
  - Payment confirmations
  - Order receipts

**Expected:**
Automated emails via Resend/SendGrid with BullMQ queue

**Effort:** Medium (2-3 days)

---

#### BUG-008: Payment Callback Error Handling Weak
**Severity:** MEDIUM  
**Priority:** P2  
**Category:** Error Handling

**Code Location:** `server/routes.ts` line ~450

**Issue:**
Paystack webhook handler has minimal error recovery. If webhook fails:
- Order status stuck in 'pending'
- User payment succeeded but plan not upgraded
- No retry mechanism

**Suggested Fix:**
- Add webhook event logging to `emailLogs` table
- Implement manual order reconciliation endpoint for admins
- Add retry logic with exponential backoff

**Effort:** Medium (1-2 days)

---

#### BUG-009: No User Feedback for Plan Limits
**Severity:** MEDIUM  
**Priority:** P3  
**Category:** UX

**Steps to Reproduce:**
1. Login as Basic user
2. Generate 1 CV (reaching limit)
3. Try to create another CV

**Expected:**
- Modal/toast: "You've reached your Basic plan limit (1 CV). Upgrade to Pro for 3 CVs/month."
- Link to `/pricing` with pre-selected Pro plan

**Actual:**
No limit checking occurs (due to BUG-002)

**Effort:** Small (4-6 hours, after BUG-002 fixed)

---

## SEVERITY MATRIX

| Severity | Definition | Example | Response Time |
|----------|------------|---------|---------------|
| **CRITICAL** | System broken, revenue loss, security breach, data corruption | BUG-001 (no plan enforcement), BUG-002 (no usage limits) | Immediate (same day) |
| **HIGH** | Major feature broken, poor UX, potential security issue | BUG-003 (admin dashboard missing), BUG-004 (cover letter UI missing) | 1-3 days |
| **MEDIUM** | Feature degraded, minor UX issue, non-critical bug | BUG-007 (email system), BUG-008 (weak error handling) | 1 week |
| **LOW** | Cosmetic issue, nice-to-have enhancement | Color inconsistency, tooltip missing | Next sprint |

---

## PRIORITIZED REMEDIATION PLAN

### 🔥 **Phase 1: Security & Business Critical (Week 1)**

#### 1. Fix BUG-001: Wire RBAC Middleware ⏱️ Small (4h)
- [ ] Import RBAC functions in `server/routes.ts`
- [ ] Apply `requirePlan('pro')` to AI optimize routes
- [ ] Apply `requirePlan('premium')` to premium template access
- [ ] Apply `requireAdmin()` to future admin routes
- **Acceptance:** Basic users blocked from Pro features

#### 2. Fix BUG-002: Implement Usage Tracking ⏱️ Medium (2d)
- [ ] Create `usageTracking` schema in `shared/schema.ts`
- [ ] Add storage methods: `incrementUsage()`, `getUsageCount()`
- [ ] Update `hasReachedLimit()` to query real data
- [ ] Add monthly reset logic (cron or check on-demand)
- **Acceptance:** Basic user blocked after 1 CV generation

#### 3. Fix BUG-006: Template Access Control ⏱️ Tiny (2h)
- [ ] Add plan check in CV creation route
- [ ] Return 403 for premium templates on free plans
- [ ] Update frontend to disable premium templates visually
- **Acceptance:** Basic user sees "Upgrade to Premium" on Onix/Corsola

---

### 📊 **Phase 2: Core Features (Week 2-3)**

#### 4. Fix BUG-004: Build Cover Letter Generator UI ⏱️ Medium (3d)
- [ ] Create `/client/src/pages/cover-letter.tsx`
- [ ] Add route in `App.tsx`
- [ ] Build form: job title, company, description
- [ ] Add tone selector (Formal, Friendly, Creative, Confident)
- [ ] Connect to POST /api/ai/generate-cover-letter
- [ ] Add preview pane
- [ ] Implement edit & download PDF
- **Acceptance:** User generates cover letter and downloads PDF

#### 5. Fix BUG-003: Build Admin Dashboard ⏱️ Large (5d)
- [ ] Create `/client/src/pages/admin/layout.tsx` with sidebar
- [ ] Build pages:
  - [ ] Sales Overview (revenue, plan distribution)
  - [ ] User Management (view, upgrade/downgrade manually)
  - [ ] Analytics (CV/CL count, active users, AI costs)
  - [ ] Email Logs viewer
  - [ ] API Key Management console
- [ ] Wire `requireAdmin()` middleware to all admin routes
- **Acceptance:** Admin can view all data, manage users, see logs

#### 6. Fix BUG-009: Add Upgrade Prompts ⏱️ Small (6h)
- [ ] Create `<UpgradeModal>` component
- [ ] Trigger when user hits limit
- [ ] Show current plan vs required plan
- [ ] Link to `/pricing` with plan pre-selected
- **Acceptance:** User sees upgrade modal when limit reached

---

### 📧 **Phase 3: Enhancements (Week 4)**

#### 7. Fix BUG-007: Implement Email System ⏱️ Medium (3d)
- [ ] Set up Resend API integration
- [ ] Create email service in `server/lib/email-service.ts`
- [ ] Use templates from `config/email-templates.json`
- [ ] Add BullMQ job queue for async sending
- [ ] Log emails to `emailLogs` table
- [ ] Send emails on:
  - [ ] User signup (welcome)
  - [ ] Payment success (receipt)
  - [ ] Plan upgrade (confirmation)
- **Acceptance:** User receives professional HTML email after payment

#### 8. Fix BUG-005: Encrypt API Keys ⏱️ Small (6h)
- [ ] Add encryption utilities using Node crypto
- [ ] Encrypt keys before DB insert
- [ ] Decrypt only when needed for API calls
- [ ] Mask keys in admin UI (show last 4 chars)
- **Acceptance:** Keys encrypted in DB, masked in UI

#### 9. Fix BUG-008: Improve Payment Error Handling ⏱️ Medium (2d)
- [ ] Add comprehensive error logging
- [ ] Implement webhook retry with backoff
- [ ] Create admin reconciliation endpoint
- [ ] Add payment status monitoring
- **Acceptance:** Failed webhooks retry automatically

---

## REGRESSION TEST CHECKLIST (Post-Fix)

After each fix, run these smoke tests:

### ✅ Smoke Test Suite
1. **User Signup** - New user gets Basic plan ✅
2. **CV Creation** - Basic user can create 1 CV ✅
3. **Plan Limit** - 2nd CV creation blocked with upgrade prompt ✅
4. **Payment Flow** - Pro upgrade succeeds, plan updated ✅
5. **Template Access** - Premium templates blocked for Basic users ✅
6. **PDF Download** - CV generates PDF successfully ✅
7. **AI Features** - Pro users can optimize CV (Basic blocked) ✅
8. **Admin Access** - Regular users blocked from /admin ✅
9. **Admin Dashboard** - Admin sees all users and stats ✅
10. **Email Delivery** - User receives welcome + payment emails ✅

---

## EXECUTIVE SUMMARY & NEXT STEPS

### 🎯 **Top 7 Highest-Risk Items**

| Risk | Impact | Effort | Priority |
|------|--------|--------|----------|
| **1. No Plan Limit Enforcement** (BUG-001, BUG-002) | Revenue loss, abuse | Medium | P0 🔴 |
| **2. RBAC Not Wired** (BUG-001) | Security breach, unauthorized access | Small | P0 🔴 |
| **3. Usage Tracking Missing** (BUG-002) | Billing fraud, unlimited usage | Medium | P0 🔴 |
| **4. Admin Dashboard Absent** (BUG-003) | Cannot manage users/revenue | Large | P1 ⚠️ |
| **5. Cover Letter UI Missing** (BUG-004) | Paid feature unavailable | Medium | P1 ⚠️ |
| **6. API Keys Unencrypted** (BUG-005) | Security risk, key theft | Small | P1 ⚠️ |
| **7. Template Access Uncontrolled** (BUG-006) | Revenue leak | Tiny | P2 ⚠️ |

---

### 🚀 **Recommended Immediate Actions**

#### **This Week (Critical Path to MVP)**
1. **Wire RBAC middleware** to all routes (4 hours) → BUG-001
2. **Implement usage tracking** table and logic (2 days) → BUG-002
3. **Add template access control** (2 hours) → BUG-006
4. **Test payment flow end-to-end** with Paystack test cards

**Outcome:** Platform becomes revenue-safe with enforced limits

#### **Next Week (Feature Completion)**
5. **Build Cover Letter Generator UI** (3 days) → BUG-004
6. **Start Admin Dashboard** (5 days) → BUG-003
7. **Add upgrade prompts** for limit-reached scenarios (6 hours) → BUG-009

**Outcome:** Core paid features accessible to users

#### **Week 3-4 (Polish & Security)**
8. **Encrypt API keys** (6 hours) → BUG-005
9. **Integrate email system** (3 days) → BUG-007
10. **Harden payment error handling** (2 days) → BUG-008

**Outcome:** Production-ready security and UX

---

### 📋 **QA Signoff Criteria**

Platform approved for production when:

✅ **Security:**
- [ ] All RBAC middleware applied and tested
- [ ] API keys encrypted at rest
- [ ] IDOR vulnerabilities eliminated (user can't access others' CVs)
- [ ] Admin routes protected

✅ **Business Logic:**
- [ ] Plan limits enforced (Basic: 1 CV, Pro: 3, Premium: unlimited)
- [ ] Usage tracking accurate
- [ ] Payment flow completes successfully (95%+ success rate)
- [ ] Template access controlled by plan tier

✅ **Features:**
- [ ] Cover Letter Generator functional
- [ ] Admin Dashboard complete (all 5 pages)
- [ ] Email notifications working (welcome, payment, receipts)
- [ ] PDF generation works for all templates

✅ **UX:**
- [ ] Upgrade prompts appear when limits reached
- [ ] Mobile responsive (tested on iOS/Android)
- [ ] Keyboard accessible
- [ ] Loading states on all async actions

---

### 📅 **Proposed Test/Regression Schedule**

| Phase | Timeline | Focus | Exit Criteria |
|-------|----------|-------|---------------|
| **Alpha Testing** | Week 1-2 | Security + Core Fixes | All P0 bugs resolved |
| **Beta Testing** | Week 3 | Feature Completion | Cover Letter + Admin Dashboard live |
| **UAT** | Week 4 | End-to-End Flows | 10 test users complete full journey |
| **Production** | Week 5 | Launch 🚀 | QA signoff, monitoring in place |

---

### 🎬 **Final Recommendation**

**DO NOT DEPLOY to production** until:
1. ✅ BUG-001 & BUG-002 fixed (plan limits enforced)
2. ✅ Payment flow tested with real Paystack account
3. ✅ Admin dashboard accessible to review user activity
4. ✅ Email system operational for order confirmations

**Current Platform Grade:** 🟡 **B-** (Foundation solid, features incomplete)

**Post-Remediation Grade (Projected):** 🟢 **A** (Production-ready MVP)

---

**Report End**  
*For questions or clarification, contact QA Lead*
