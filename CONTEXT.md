# CONTEXT.md — Project Context & Memory

> **Instruction to AI Agents:** Read this file first at the start of every session.
> Update it at the end of every work session. Goal: any new agent can understand project state WITHOUT re-analyzing the entire codebase.

---

## 1. Current Status
- **Phase:** Phase 4 Task 1 COMPLETED (Appwrite Auth, Session View, Role Logic & Teams).
- **Last updated:** 2026-11-05

## 2. Completed Work
- **Git & Environment Hardening:** Git initialized; `.gitignore` guards `.env` and `only_error_logs.json`; `backend/.env` cleanly reorganized with zero value changes; `backend/.env.example` created.
- **Appwrite Connection & Test Users:** Verified live connection to `https://appwrite.doitfastit.de/v1`. Both Normal User and Super Admin authenticate with HTTP 201.
- **Error Logging System:** Built automated error logging per `RULES.md` for both `frontend/only_error_logs.json` and `backend/only_error_logs.json` with SHA-256 deduplication and occurrence counting. Currently 0 errors in both logs.
- **Pre-Push Quality Gate:** Built `.githooks/pre-push` running lint, test, and build across frontend and backend. Fully tested with deliberate error blocking push and clean push passing.
- **Phase 4 Task 1 Implementation:**
  - `backend/src/routes/auth.ts`: profile `/api/auth/me`, active sessions listing with IP & device model `/api/auth/sessions`, session revocation `/api/auth/sessions/:sessionId`, user listing for Super Admin `/api/auth/users`, and label-driven role management `/api/auth/role`.
  - `backend/src/routes/teams.ts`: company team creation `/api/teams`, listing, membership rosters `/api/teams/:teamId/members`, and admin/member invites.
  - `frontend/src/components/AuthModal.tsx`: Sign In, Sign Up, Forgot Password recovery modal with explicit loading `<Spinner />`.
  - `frontend/src/components/SessionsView.tsx`: Displays active sessions with IP address, device, browser, country, and revocation action.
  - `frontend/src/components/OrganizationsView.tsx`: Lists company workspaces, creates workspaces, manages team members, and invites admins.
  - `frontend/src/components/SuperAdminPanel.tsx`: View all platform accounts, inspect labels, and promote/demote users with `admin` label.
  - Verified live in browser with real-time role switching, workspace creation, and session inspection via Chrome DevTools MCP.

## 3. In Progress
- **T-003**: Phase 4 Task 2 — Facebook Page & YouTube Channel connection flow with live-streaming permissions, circular logo, and quotas.

## 4. Key Decisions
| Date | Decision | Reason |
|---|---|---|
| 2026-11-05 | Appwrite as sole backend service | Required by project owner & ARCHITECTURE.md |
| 2026-11-05 | No reverse proxy in Docker Compose | Coolify handles routing directly |
| 2026-11-05 | Disambiguate test user env keys | Prevent `.env` collision where super admin overwrote normal test user |
| 2026-11-05 | Postinstall patch for Node 26 undici | Ensure official Appwrite Node SDK works reliably without runtime fetch errors |
| 2026-11-05 | Restream Studio dark theme | Approved clean aesthetic for multi-destination live broadcast dashboard |
| 2026-11-05 | Automatic `admin` label-driven role | Super Admin strictly governed by Appwrite Auth user label |

## 5. Important Notes
- Test users are pre-configured in `backend/.env`. Use them for all testing.
- No reverse proxy; deployment via Docker Compose + Coolify.
- Error logs must be written to `frontend/only_error_logs.json` and `backend/only_error_logs.json`.
- Strict security: NEVER log, print, or commit secrets.

## 6. Remaining Work / Next Steps
- **T-003**: Facebook Page & YouTube Channel connection flow (OAuth with live scopes, circular logos, connection limits).
- **T-004**: Live streaming: generate ingest URL & stream key, multi-destination fan-out, unified title update.
- **T-005**: Super Admin panel: organizations, channels with timestamps, limits, suspend/reactivate, activity monitoring.
- **T-006**: Email provider configuration (Appwrite Messaging).
