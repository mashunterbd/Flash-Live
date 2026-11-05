# Flash Live — Multi-Destination Streaming Platform

A high-performance live streaming management platform that lets organizations connect Facebook Pages and YouTube Channels, broadcasting live to all targets simultaneously from a single RTMP ingest source.

## Project Structure
- `/frontend` — React 19 + TypeScript + Vite + Tailwind CSS (Restream Studio design)
- `/backend` — Node.js + Express + TypeScript + Appwrite SDK
- `/.githooks` — Version-controlled pre-push quality gate

## Pre-Push Quality Gate
Every push to `main`, `master`, or `staging` automatically triggers local quality checks:
1. Backend lint (`npm run lint`)
2. Backend tests (`npm test`)
3. Backend build (`npm run build`)
4. Frontend lint (`npm run lint`)
5. Frontend tests (`npm test`)
6. Frontend build (`npm run build`)

If any check fails, the push is blocked. Errors must be resolved before pushing.

### First-Time Setup
After cloning the repository, configure the shared hooks:
```bash
npm install
# or run:
sh setup-hooks.sh
```

## Error Logging
- Backend errors: `backend/only_error_logs.json`
- Frontend errors: `frontend/only_error_logs.json`
Both files are auto-generated on startup, deduplicating errors with timestamps and occurrence counts.
