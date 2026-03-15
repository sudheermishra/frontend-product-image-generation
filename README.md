# Frontend

UI for product image and video generation. Talks to a backend API.

## Run

```bash
npm install
npm run dev
```

Runs at `http://localhost:5173`. Frontend calls the backend directly; enable CORS on the backend for the frontend origin.

## Env

Copy `.env.example` to `.env`. Set `VITE_API_BASE_URL` to your backend URL (e.g. `http://localhost:3000` in dev).

- **Image API** – `VITE_IMAGE_GENERATE_PATH` (default `/api/images/generate`)
- **Video API** – `VITE_VIDEO_GENERATE_PATH` (default `/api/videos/generate`)

## What it does

- **Image page** – Product URL and/or sample image (upload or paste). POST FormData to the image endpoint. Shows the returned image; download button saves it.
- **Video page** – Image file and text prompt. POST FormData (`image`, `prompt`) to the video endpoint. Shows the returned video; download button saves it.

Utility helpers live in `src/lib/utils.js` (API URLs, response parsing, download, blob cleanup).
