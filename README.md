# AI Translate API

Express backend for **AI Translate**, a real-time multilingual (Hindi + English) speech-to-text app.

- **Live API:** https://ai-translate-api-mwbj.onrender.com/api/health (Render)
- **Live app:** https://ai-translate-mu.vercel.app
- **Frontend repo:** https://github.com/anildeveloper26/AI-Translate
- **Stack:** Node.js, Express 5, TypeScript, PostgreSQL (`pg`), Google Gemini Live (`@google/genai`)

## What it does

1. **Transcription history (CRUD):** stores transcriptions in PostgreSQL. The table is created automatically on first use.
2. **Gemini Live tokens:** mints short-lived, single-use **ephemeral tokens** locked to the `gemini-3.5-transcribe-live` model. The browser streams microphone audio straight to Gemini Live with one of these tokens, so the real API key never leaves the server.

## API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check and config status |
| `GET` | `/api/transcriptions?q=&limit=&offset=` | List and search transcriptions (title + content) |
| `GET` | `/api/transcriptions/:id` | Get one transcription |
| `POST` | `/api/transcriptions` | Create `{ content, title?, language?, engine?, duration_ms? }` |
| `PATCH` | `/api/transcriptions/:id` | Update `{ title?, content?, language? }` |
| `DELETE` | `/api/transcriptions/:id` | Delete (204) |
| `POST` | `/api/live/token` | Mint a Gemini Live ephemeral token `{ token, model }` (rate-limited per IP) |

Every input is validated, every SQL query is parameterised, CORS is restricted to the configured frontend origins, and JSON bodies are capped at 100 KB.

### Schema

```sql
CREATE TABLE transcriptions (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL DEFAULT 'Untitled',
  content     TEXT NOT NULL,
  language    TEXT NOT NULL DEFAULT 'hi-IN',
  engine      TEXT NOT NULL DEFAULT 'gemini',   -- 'gemini' | 'browser'
  duration_ms INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Run locally

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL and GEMINI_API_KEY
npm run dev            # http://localhost:4000
```

## Environment variables

| Name | Required | Description |
|---|---|---|
| `DATABASE_URL` | yes | PostgreSQL connection string (e.g. Neon pooled URL) |
| `GEMINI_API_KEY` | yes | Google AI Studio API key |
| `CORS_ORIGIN` | yes in prod | Allowed frontend origin(s), comma-separated |
| `GEMINI_LIVE_MODEL` | no | Defaults to `gemini-3.5-transcribe-live` |

## Deploy

- **Render (current):** build `npm install && npm run build`, start `npm start`, and add the environment variables above.
- **Vercel (alternative):** import the repo. It detects Express and serves `src/index.ts` as a serverless function.

## Project structure

```
src/
  index.ts                      # entry: listens on PORT (or exports the app on Vercel)
  app.ts                        # createApp(): CORS, JSON, routes, error handling
  config/env.ts                 # typed environment config
  routes/                       # URL → controller mapping only
    index.ts
    transcription.routes.ts
    live.routes.ts
  controllers/                  # HTTP layer: parse request, call service, send response
    transcription.controller.ts
    live.controller.ts
    health.controller.ts
  services/                     # business logic + data access
    transcription.service.ts    # SQL (parameterised) for CRUD + search
    live.service.ts             # Gemini Live ephemeral token minting
  validators/
    transcription.validator.ts  # request validation, throws 400s
  middlewares/
    errorHandler.ts             # 404 + central error handler
    rateLimit.ts                # per-IP limiter for the token endpoint
  db/
    pool.ts                     # pg pool + lazy schema bootstrap
    schema.ts                   # CREATE TABLE / indexes
  types/transcription.ts        # shared domain types
  utils/httpError.ts            # HttpError with status helpers
```
