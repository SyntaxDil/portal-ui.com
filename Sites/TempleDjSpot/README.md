# Temple DJ Spot

A lightweight React + Vite site for managing a DJ roster and schedule using Firebase.

## Local dev

1. From this folder:
   - Install deps
   - Run the dev server

```
npm install
npm run dev
```

The app serves on http://localhost:3002.

Tailwind is included via CDN for speed. If you want a build-time Tailwind pipeline, add PostCSS/Tailwind later.

## Firebase config

The app expects global variables injected before the app script runs:

- `window.__firebase_config`: JSON string with your Firebase config
- `window.__app_id`: string used for namespacing Firestore paths (default: `temple-djs`)
- `window.__initial_auth_token` (optional): custom auth token string for `signInWithCustomToken`

You can set these in `index.html` during development, or inject via your hosting platform before the app bundle loads.

## Build

```
npm run build
```

Build output goes to `site/` with base `/Spaces/TempleDjs/` so it works under that subdirectory in production.

## Deploy (GoDaddy)

From repo root, after building this project:

```
npm run deploy:templedjs
```

This uploads `Sites/TempleDjSpot/site` to `/public_html/Spaces/TempleDjs` on your GoDaddy host using `deploy.js` and your `.env` FTP credentials.
