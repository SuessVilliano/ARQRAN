# ARQRAN

Standalone serverless WebAR + dynamic QR platform.

## Current working model

- React/Vite creator studio with local GLB preview.
- Browser AR through `<model-viewer>` using WebXR, Android Scene Viewer, and iOS Quick Look fallback.
- Scene controls for scale, yaw, animation, shadow, exposure, and fixed/auto AR scale.
- QR or GPS geofence trigger.
- SQR serverless publishing through `SQR_API_KEY`, including dynamic links and branded QR creation.
- `SQR_DOMAIN_ID` support for `scan.elevate.co` once the domain is connected in SQR.
- Supabase-backed scene persistence, analytics, finite collectible claims, and signed asset-upload URLs.
- Serverless endpoints under `/api` for publish, analytics, claims, saved scenes, and upload authorization.
- Automated utility tests and GitHub Actions build QA.

## Architecture

```text
Creator browser
  -> Vercel static Vite UI
  -> Vercel serverless /api/*
       -> SQR API (dynamic branded QR)
       -> Supabase Postgres (scenes/events/claims)
       -> Supabase Storage (GLB assets)

Scanner
  -> scan.elevate.co/<slug> via SQR
  -> HTTPS AR viewer
  -> geofence check when configured
  -> WebXR / Scene Viewer / Quick Look
```

## Setup

1. Create a Supabase project and run `supabase/schema.sql`.
2. Create a public Storage bucket named `ar-assets`.
3. Copy `.env.example` into your Vercel project environment and provide the real values.
4. In SQR, add `scan.elevate.co` as a custom domain, then set `SQR_DOMAIN_ID` to that SQR domain ID.
5. Deploy this repo to Vercel. Set `VITE_PUBLIC_AR_BASE_URL` to the HTTPS ARQRAN deployment URL.

No SQR or Supabase secret is ever exposed through a `VITE_` variable.

## Local development

```bash
npm install
npm test
npm run build
npx vercel dev
```

`npm run dev:web` runs only the Vite frontend; API routes require `vercel dev` or a Vercel deployment.

## Environment

See `.env.example`.

The public browser variables are `VITE_PUBLIC_AR_BASE_URL`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_ANON_KEY`. The service-role Supabase key and SQR API key are serverless-only secrets.

## 8th Wall

The platform does not require proprietary 8th Wall credentials for basic no-app object placement. The open-source 8th Wall stack can be introduced as an adapter for image-target tracking and richer camera effects after the core QR/location workflow is deployed and validated.
