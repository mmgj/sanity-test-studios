# Visual Editing with Next.js

Test project from DOC-1935 Visual Editing article review. A minimal Sanity Studio + Next.js frontend demonstrating Visual Editing, Presentation Tool, and Draft Mode.

## Project

- **Sanity project:** `ysict0n7`
- **Dataset:** `production`

## Setup

### Studio

```sh
cd studio
npm install
npx sanity dev --port 3333
```

### Web (Next.js)

```sh
cd web
cp .env.local.example .env.local
# Edit .env.local and add your Sanity API read token
npm install
npm run dev
```

The frontend runs on `http://localhost:3000`, the Studio on `http://localhost:3333`.

## What it demonstrates

- **Presentation Tool:** Open the Studio, go to Presentation, and see the Next.js frontend embedded with click-to-edit overlays.
- **Visual Editing:** Click any text element in the preview to jump to the corresponding field in the Studio.
- **Draft Mode:** The frontend shows draft content with stega encoding when Draft Mode is active.
- **Live content:** Changes in the Studio appear in the frontend in real time via `defineLive`.

## Files

### Studio
- `sanity.config.ts` — Studio config with structureTool, presentationTool, and visionTool
- `src/schemaTypes/post.ts` — Simple post schema (title, slug, body)
- `src/presentation/resolve.ts` — Document location resolver for the Presentation Tool

### Web
- `src/sanity/lib/client.ts` — Sanity client with stega config
- `src/sanity/lib/live.ts` — `defineLive` setup for real-time content
- `src/sanity/queries.ts` — GROQ queries using `defineQuery`
- `src/app/page.tsx` — Posts list page
- `src/app/posts/[slug]/page.tsx` — Individual post page with `generateStaticParams`
- `src/app/api/draft-mode/` — Enable/disable Draft Mode routes
- `src/components/disable-draft-mode.tsx` — Client component to exit Draft Mode
