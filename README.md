# Aufi

A personal wardrobe management app. Catalog your clothing, build outfits, track what you wear, and get outfit suggestions — all from your phone.

## Features

- **Wardrobe** — photograph and catalog clothing items by category (top, bottom, shoes, outerwear, accessory)
- **AI Background Removal** — automatically removes photo backgrounds using client-side WASM processing in a Web Worker, no server round-trip required
- **Outfit Builder** — group items into named outfits with free-form tags (e.g. "casual", "work", "date night")
- **Outfit Suggestions** — filter by tags and get a random outfit suggestion
- **Wear Tracking** — log when you wear an outfit; sort your wardrobe by most/least worn
- **Wear History** — chronological log of what you wore and when
- **Dark Mode** — follows system preference via Tailwind CSS

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, React Router |
| Backend | Node.js, Hono, TypeScript |
| Auth | Firebase Auth (Google sign-in) |
| Database | Firestore |
| Storage | Google Cloud Storage (signed URLs for direct upload/download) |
| Background Removal | [@imgly/background-removal](https://github.com/nickerbocker/background-removal-js) (WASM, runs in Web Worker) |
| Hosting | Firebase Hosting (frontend) + Cloud Run (API) |
| Monorepo | npm workspaces |

## Project Structure

```
aufi/
├── shared/              # @aufi/shared — shared TypeScript types
│   └── src/types.ts
├── api/                 # @aufi/api — Hono REST API
│   └── src/
│       ├── index.ts
│       ├── routes/      # items, outfits, wear
│       ├── middleware/   # Firebase Auth verification
│       └── lib/         # Firestore + Cloud Storage helpers
├── frontend/            # @aufi/frontend — React SPA
│   └── src/
│       ├── pages/       # Wardrobe, AddItem, Outfits, CreateOutfit, Suggest, History
│       ├── components/  # Layout, DataProvider, BgRemovalProvider, ItemCard, etc.
│       ├── workers/     # Background removal Web Worker
│       ├── auth/        # Firebase Auth provider
│       └── api/         # Typed fetch client
├── Dockerfile           # Multi-stage build for Cloud Run
├── firebase.json        # Hosting config with Cloud Run rewrite
└── package.json         # Workspace root
```

## Getting Started

### Prerequisites

- Node.js 22+
- A Firebase project with **Auth** (Google provider), **Firestore**, and **Cloud Storage** enabled
- A service account key JSON for local development

### 1. Clone and install

```bash
git clone https://github.com/Crutheo/aufi-app.git
cd aufi-app
npm install
```

### 2. Configure environment variables

**API** — create `api/.env`:

```env
GOOGLE_APPLICATION_CREDENTIALS=./your-service-account-key.json
GCS_BUCKET=your-project-id.firebasestorage.app
PORT=8080
```

**Frontend** — create `frontend/.env`:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 3. Set up Cloud Storage CORS

Apply the CORS config so the browser can upload images directly to GCS:

```bash
gcloud storage buckets update gs://YOUR_BUCKET --cors-file=api/cors.json
```

### 4. Run locally

```bash
npm run dev
```

This starts both the API (port 8080) and frontend (port 5173) concurrently. The Vite dev server proxies `/api` requests to the local API.

## API Endpoints

All endpoints require a Firebase ID token as `Authorization: Bearer <token>`.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/items` | Create item (returns signed upload URL) |
| `GET` | `/api/items` | List all items for user |
| `POST` | `/api/items/:id/reupload` | Get new upload URL (used by bg removal) |
| `DELETE` | `/api/items/:id` | Delete item + image |
| `POST` | `/api/outfits` | Create outfit |
| `GET` | `/api/outfits` | List outfits (optional `?tag=` filter) |
| `GET` | `/api/outfits/random` | Random outfit (optional `?tag=` filter) |
| `GET` | `/api/outfits/:id` | Get single outfit |
| `PUT` | `/api/outfits/:id` | Update outfit |
| `DELETE` | `/api/outfits/:id` | Delete outfit |
| `POST` | `/api/wear` | Log a wear event |
| `GET` | `/api/wear/history` | Full wear history |
| `GET` | `/api/wear/stats` | Aggregate wear stats (per-item and per-outfit) |

## Deployment

### API (Cloud Run)

```bash
gcloud run deploy aufi-api --source . \
  --project=YOUR_PROJECT \
  --region=us-east1 \
  --set-env-vars="GCS_BUCKET=your-bucket.firebasestorage.app" \
  --allow-unauthenticated
```

The root `Dockerfile` handles the multi-stage build (installs deps, compiles TypeScript, produces a slim runtime image).

### Frontend (Firebase Hosting)

```bash
npm run build -w @aufi/frontend
firebase deploy --only hosting --project=YOUR_PROJECT
```

Firebase Hosting serves the static SPA and reverse-proxies `/api/**` requests to Cloud Run (configured in `firebase.json`).

### IAM Permissions

The Cloud Run service account needs these roles:

- `roles/iam.serviceAccountTokenCreator` — for generating signed GCS URLs
- `roles/cloudbuild.builds.builder` — for source-based Cloud Run deployments

## Architecture

```
Browser
  ├── React SPA (Firebase Hosting)
  │     ├── Firebase Auth (Google sign-in)
  │     ├── DataProvider (in-memory cache for items + outfits)
  │     ├── BgRemovalProvider (Web Worker queue for background removal)
  │     └── Direct GCS upload/download via signed URLs
  │
  └── /api/* ──→ Firebase Hosting rewrite ──→ Cloud Run (Hono)
                    ├── Firebase Admin Auth (token verification)
                    ├── Firestore (items, outfits, wear events)
                    └── Cloud Storage (signed URL generation)
```

Images are never proxied through the API — the client uploads and downloads directly from Cloud Storage using short-lived signed URLs.
