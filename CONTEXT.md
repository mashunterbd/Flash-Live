# CONTEXT.md — Project Context & Memory

> **Instruction to AI Agents:** Read this file first at the start of every session.
> Update it at the end of every work session. Goal: any new agent can understand project state WITHOUT re-analyzing the entire codebase.

---

## 1. Current Status
- **Phase:** Phase 2 & Phase 3 COMPLETED. Ready for Phase 4 (PRD Feature Implementation).
- **Last updated:** 2026-11-05

## 2. Completed Work
- **Git & Environment Hardening:** Git initialized; `.gitignore` guards `.env` and `only_error_logs.json`; `backend/.env` cleanly reorganized with zero value changes; `backend/.env.example` created.
- **Appwrite Connection & Test Users:** Verified live connection to `https://appwrite.doitfastit.de/v1`. Both Normal User (`mdabubakkr226@gmail.com`) and Super Admin (`admin-live@doitfastit.com` with `admin` label) authenticate (HTTP 201).
- **Node 26 Compatibility:** Solved `node-fetch-native-with-agent` undici incompatibility via `backend/scripts/patch-agent.js` and `postinstall` hook.
- **Error Logging System:** Built automated error logging per `RULES.md` for both `frontend/only_error_logs.json` and `backend/only_error_logs.json` with SHA-256 deduplication and occurrence counting. Currently 0 errors in both logs.
- **Pre-Push Quality Gate:** Built `.githooks/pre-push` running lint, test, and build across frontend and backend. Fully tested with deliberate error blocking push and clean push passing.
- **Design System:** Restream Studio dark tokens implemented in `DESIGN.md`, Tailwind config, and React UI. Verified interactive browser screenshot via DevTools MCP.
- **Dev Servers:** Both backend (port 5000) and frontend (port 3000) build cleanly and run with sub-second startup.

## 3. In Progress
- Transitioning to Phase 4: Feature Implementation (Task 1: Appwrite Auth, sessions view with IP & device, role logic, and Teams).

## 4. Key Decisions
| Date | Decision | Reason |
|---|---|---|
| 2026-11-05 | Appwrite as sole backend service | Required by project owner & ARCHITECTURE.md |
| 2026-11-05 | No reverse proxy in Docker Compose | Coolify handles routing directly |
| 2026-11-05 | Disambiguate test user env keys | Prevent `.env` collision where super admin overwrote normal test user |
| 2026-11-05 | Postinstall patch for Node 26 undici | Ensure official Appwrite Node SDK works reliably without runtime fetch errors |
| 2026-11-05 | Restream Studio dark theme | Approved clean aesthetic for multi-destination live broadcast dashboard |

## 5. Important Notes
- Test users are pre-configured in `backend/.env`. Use them for all testing.
- No reverse proxy; deployment via Docker Compose + Coolify.
- Error logs must be written to `frontend/only_error_logs.json` and `backend/only_error_logs.json`.
- Strict security: NEVER log, print, or commit secrets.

## 6. Remaining Work / Next Steps
- **T-002**: Appwrite Auth: signup, login, logout, email verification, forgot password, active sessions view (IP & device).
- **T-002b**: Role logic: `admin` label automatically grants/revokes Super Admin.
- **T-002c**: Organizations: Appwrite Teams and memberships, isolated company workspaces, admin invites.
- **T-003**: Facebook Page & YouTube Channel connection with live-streaming permissions, circular logo, quotas.
- **T-004**: Live streaming: generate ingest URL & stream key, multi-destination fan-out, unified title update.
- **T-005**: Super Admin panel: users, orgs, channels with timestamps, limits, suspend/reactivate, activity monitoring.
- **T-006**: Email provider configuration (Appwrite Messaging).
