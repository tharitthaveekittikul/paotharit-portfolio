# POMPKINS Projects Portfolio Entries — Design Spec

## Scope

Two new project MDX entries for the EN portfolio:
1. `content/en/projects/pompkins-web.mdx` — POMPKINS marketing website
2. `content/en/projects/pompkins-food-web.mdx` — POMPKINS Food consumer ordering platform

## Constraints

- No GitHub link (business policy)
- No documentation link (business policy)
- No system architecture diagram (business/confidentiality)
- No "What I'd Do Differently" section (professional client work)
- Company closing soon; sites still live at pompkins.com and pompkinsfood.com

## Structure: Option C — Role & Scope → Technical Highlights → Screenshots

Sections per entry:
1. **My Role** — scope and scale of contribution
2. **What I Built** — bullet list of pages/features
3. **Technical Highlights** — interesting engineering decisions with bold labels
4. **Screenshots** — all available images via ScreenshotGrid + ZoomableImage

## POMPKINS Web

- Role: Sole Frontend Developer
- Tech: Next.js 15, React 18, TypeScript, Tailwind CSS v3, Firebase, Framer Motion, AOS, Zustand, SWR, next-intl, Radix UI, Google Maps, Embla Carousel
- Metrics: Pages 20+, Locales 2, Product Showcases 5, Layouts 3
- Screenshots: landing-page, pricing-page, crm-system-page, in-store-order-page, contact-us-page, rubtung-page
- Highlights: multi-layout route groups, Framer Motion + AOS animation system, Embla Carousel with wheel gestures, next-intl bilingual routing

## POMPKINS Food Web

- Role: Sole Frontend Developer
- Tech: Next.js 15, React 19, TypeScript, Tailwind CSS v3, Firebase, next-auth, Framer Motion, Zustand, SWR, next-intl, Radix UI, Google Maps, QR code, axios-cache-interceptor, html2canvas
- Metrics: Pages 40+, Order Flows 3, Locales 2, React Version 19
- Screenshots: landing-page-1, landing-page-2, merchant-page-1, checkout-page, order-status-pending
- Highlights: three ordering contexts via route groups (delivery, table QR, hotel QR), axios-cache-interceptor over SWR, QR code generation, html2canvas bill export, Firebase + next-auth dual auth, React 19 early production adoption
