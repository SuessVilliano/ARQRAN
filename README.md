# ARQRAN

Standalone serverless spatial-content + WebAR platform.

## Live domain model

- Creator/runtime app: `https://arqran.liv8.co`
- Branded scan/redirect domain: `https://scan.liv8.co`
- SQR API base: `https://sqr.co/api`

## Current platform capabilities

- React/Vite multi-object Spatial Studio.
- Scene objects: 3D models, images, video, web panels, text, and audio.
- Per-object X/Y/Z position, rotation, scale, color/tint, anchor type, and location rules.
- Browser AR for GLB models through `<model-viewer>` using WebXR, Android Scene Viewer, and iOS Quick Look fallback.
- Camera-overlay runtime for mixed-media scene objects.
- GPS scavenger-hunt runtime with nearest-target distance, bearing/cardinal direction, FAR/WARM/HOT/FOUND thresholds, and reveal radius.
- Stable public scene URLs at `/x/<scene-slug>` instead of encoding scene state in query parameters.
- SQR serverless publishing through `SQR_API_KEY`, including dynamic links and branded QR creation.
- `SQR_DOMAIN_ID` support for `scan.liv8.co`.
- Supabase-backed scene persistence, analytics, finite collectible claims, and signed GLB upload URLs.
- Vercel serverless endpoints under `/api` for publish, analytics, claims, saved scenes, and upload authorization.
- Automated utility tests and GitHub Actions build QA.

## Architecture

```text
Creator
  -> arqran.liv8.co
  -> Spatial Studio
  -> Vercel serverless /api/*
       -> SQR API (dynamic QR + scan.liv8.co)
       -> Supabase Postgres (scenes / objects / events / claims)
       -> Supabase Storage (GLB and future media assets)

Participant
  -> scan.liv8.co/<slug>
  -> SQR redirect
  -> arqran.liv8.co/x/<slug>
  -> location hunt / camera / AR runtime
```

## Spatial scene model

A scene can contain up to 50 authored objects. Each object stores content type/source, position x/y/z, rotation x/y/z, scale x/y/z, color/tint, autoplay/loop/mute behavior, anchor type, optional latitude/longitude, reveal/warm/near radii, and interaction behavior.

The current no-app runtime provides native/browser AR placement for GLB models and camera-overlay rendering for mixed-media content. Exact persistent wall/room anchoring for arbitrary mixed media is the next anchor-engine layer and will use image targets / QR markers / spatial anchors rather than GPS alone.

## Setup

1. Create or select the Supabase project and run `supabase/schema.sql`.
2. Create a public Storage bucket named `ar-assets`.
3. Add the `.env.example` values to the Vercel project.
4. In SQR, connect `scan.liv8.co` and put its domain ID in `SQR_DOMAIN_ID`.
5. Set `VITE_PUBLIC_AR_BASE_URL=https://arqran.liv8.co`.
6. Set `SQR_API_BASE_URL=https://sqr.co/api` and the server-only `SQR_API_KEY`.

No SQR or Supabase secret is ever exposed through a `VITE_` variable.

## Anchor roadmap

- GPS: outdoor discovery and proximity guidance.
- QR marker: deterministic physical anchor.
- Image target: posters, paintings, packaging, walls, signage.
- Spatial anchor/VPS: persistent exact room/world placement where supported.

One QR can begin an entire hunt while each object has its own physical location and reveal radius.
