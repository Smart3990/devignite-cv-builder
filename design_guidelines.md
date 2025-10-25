# Devignite CV Platform - Design Guidelines

## Design Approach

**Selected System:** Professional SaaS Platform Design (inspired by Linear, Notion, and Stripe)

**Core Principles:**
1. Professional Authority - Design conveys expertise and trustworthiness
2. Guided Clarity - Every step clear with validation and tooltips
3. Progress Transparency - Users always know their position
4. Refined Simplicity - Clean, focused interfaces

## Color Palette

### Light Mode
- Primary Brand: 15 85% 50% (vibrant orange-red)
- Primary Hover: 15 85% 45%
- Background Base: 0 0% 100%
- Background Elevated: 0 0% 98%
- Border Default: 220 13% 91%
- Text Primary: 220 15% 15%
- Text Secondary: 220 10% 45%
- Success: 142 71% 45%
- Error: 0 72% 51%

### Dark Mode
- Primary Brand: 15 90% 55%
- Primary Hover: 15 90% 60%
- Background Base: 220 15% 9%
- Background Elevated: 220 13% 13%
- Border Default: 220 13% 23%
- Text Primary: 220 15% 95%
- Text Secondary: 220 10% 65%

## Typography

**Fonts:** Inter (UI/body), Cal Sans (headings/hero)

**Scale:**
- Hero: text-5xl md:text-6xl font-bold
- Page Heading: text-3xl md:text-4xl font-bold
- Section Heading: text-2xl font-semibold
- Card Title: text-lg font-semibold
- Body: text-base

## Layout

**Spacing:** Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24
- Component padding: p-4 to p-6
- Section spacing: py-12 md:py-20
- Card gaps: gap-6 to gap-8

**Containers:**
- Max-width: max-w-7xl mx-auto px-4 md:px-6
- Forms: max-w-3xl mx-auto

## Component Library

### Navigation
Fixed header with flame logo + Devignite wordmark, links (How it Works, Pricing, Login/Signup), primary CTA "Get Started" button

### Multi-Step Form
- Progress indicator: 4 steps (Personal Info → Experience → Education & Skills → Template Selection)
- Cards with subtle shadows
- Full-width inputs with labels above, helper text below
- Real-time validation icons
- Question mark tooltip icons with popovers
- Required field asterisks
- Back/Continue buttons (Continue uses primary brand color)

**Input Styling:**
- Height: h-12
- Border: border-2 with focus:border-primary
- Dark mode aware backgrounds

### Template Gallery
Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6

**Template Cards:**
- Iframe preview in aspect ratio container
- Hover: subtle lift with shadow-lg
- Selected: border-4 border-primary
- Template name and description below
- "Select" button overlay on hover

### Pricing Section
Three cards side-by-side (stack mobile):
- Basic CV
- CV + Cover Letter (with "Most Popular" badge)
- Comprehensive Package

Each card: Large price, feature list with checkmarks, CTA button

### Payment Flow (Paystack)
- Paystack inline checkout modal
- Order summary showing package and price breakdown
- Security badges (256-bit SSL, Secure Payment)
- Webhook integration for payment verification

### Dashboard
**Order Status Cards:**
- Large status badge (Processing/Completed)
- Progress bar with percentage
- Estimated completion time
- Download button (appears when ready)

### CV Preview
Split view:
- Left: CV preview iframe (60%)
- Right: Edit controls (40%) - name, contact, template switcher
- Top: Sticky "Finalize & Pay" button

## Images

**Hero Section:** Full-width background with gradient mesh (orange to purple) overlaid with professional illustration showing diverse professionals working on laptops with CV documents floating around them. Optimistic and polished aesthetic.

**Template Previews:** Actual CV screenshots in iframes

**Trust Elements:** Company/university logos for social proof

**Illustrations:** Minimalist line-art for empty states and confirmations

## Visual Elements

**Cards:** rounded-lg, subtle shadows, hover elevation

**Buttons:**
- Primary: Solid brand color fill, rounded-lg, px-6 py-3
- Secondary: border-2, transparent fill
- Over images: backdrop-blur-md with semi-transparent background

**Badges:** rounded-full pills for status indicators

**Icons:** Lucide React (20-24px, consistent stroke)

## Interactions

Minimal, purposeful animations:
- Form validation: Gentle shake on error
- Card hover: translateY(-4px) with transition-transform duration-200
- Button active: scale-95
- Page transitions: Fade in (opacity-0 to opacity-100)

## Key Screens

**Landing Page:**
1. Hero: "Create Your Professional CV in Minutes" + CTA
2. How It Works (4 steps with icons)
3. Template Showcase
4. Pricing Section
5. FAQ Accordion
6. Footer with Devignite branding

**Form Wizard:** Centered with progress bar

**Template Selection:** Gallery with search/filter

**Dashboard:** Sidebar + order cards

**Payment:** Centered Paystack modal with summary