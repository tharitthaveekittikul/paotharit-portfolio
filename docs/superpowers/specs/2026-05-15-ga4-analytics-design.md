# GA4 Analytics Integration

**Date:** 2026-05-15  
**Status:** Approved

## Goal

Replace Vercel Analytics with Google Analytics 4 using Next.js's official `@next/third-parties` package. GA4 provides unlimited page views and 14-month data retention on the free tier, vs Vercel's 30-day retention.

## Measurement ID

`G-LZSBERQCZ2` — stored in `.env.local` as `NEXT_PUBLIC_GA_ID`.

## Architecture

Single change in `src/app/[locale]/layout.tsx`:
- Remove `<Analytics />` from `@vercel/analytics/react`
- Add `<GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!} />` from `@next/third-parties/google`

The `GoogleAnalytics` component handles script loading with `strategy="afterInteractive"` internally — no manual `next/script` needed.

## Files Changed

| File | Change |
|------|--------|
| `src/app/[locale]/layout.tsx` | Swap Analytics import and component |
| `.env.local` | Add `NEXT_PUBLIC_GA_ID=G-LZSBERQCZ2` |
| `package.json` | Add `@next/third-parties`, remove `@vercel/analytics` |

## Out of Scope

- Custom event tracking (page view is automatic)
- Cookie consent banner (GA4 in basic mode, portfolio use)
