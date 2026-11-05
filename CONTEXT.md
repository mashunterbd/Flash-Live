# CONTEXT.md — Project Context & Memory

> **Instruction to AI Agents:** Read this file first at the start of every session.
> Update it at the end of every work session. Goal: any new agent can understand project state WITHOUT re-analyzing the entire codebase.

---

## 1. Current Status
- **Phase:** Phase 4 Tasks 1, 2, 3, 4, 5, and 6 COMPLETED.
- **Last updated:** 2026-11-05

## 2. Completed Work
- **Git & Environment Hardening:** Git initialized; `.gitignore` guards `.env` and `only_error_logs.json`; `backend/.env` cleanly reorganized with zero value changes; `backend/.env.example` created.
- **Appwrite Connection & Test Users:** Verified live connection to `https://appwrite.doitfastit.de/v1`. Both Normal User and Super Admin authenticate with HTTP 201.
- **Error Logging System:** Built automated error logging per `RULES.md` for both `frontend/only_error_logs.json` and `backend/only_error_logs.json` with SHA-256 deduplication and occurrence counting. Currently 0 errors in both logs.
- **Pre-Push Quality Gate:** Built `.githooks/pre-push` running lint, test, and build across frontend and backend. Fully tested with deliberate error blocking push and clean push passing.
- **Phase 4 Task 1: Auth, Roles & Workspaces:**
  - `backend/src/routes/auth.ts`: profile `/api/auth/me`, active sessions listing `/api/auth/sessions`, revocation `/api/auth/sessions/:sessionId`, user listing `/api/auth/users`, label-driven role management `/api/auth/role`.
  - `backend/src/routes/teams.ts`: company workspace creation `/api/teams`, listing, membership rosters `/api/teams/:teamId/members`, and admin/member invites.
  - `frontend/src/components/AuthModal.tsx`: Sign In, Sign Up, Forgot Password recovery modal with explicit `<Spinner />`.
  - `frontend/src/components/SessionsView.tsx`: Active sessions with IP address, device, browser, country, and revocation action.
  - `frontend/src/components/OrganizationsView.tsx`: Company workspace switcher, creation form, member roster, invite admin form.
- **Phase 4 Task 2: Platform Connections (PRD 4.3):**
  - `backend/src/routes/channels.ts`: List channels, OAuth URL generation with live streaming scopes (`publish_video`, `youtube.force-ssl`), quota enforcement (5 channels/org), duplicate prevention, channel deletion.
  - `frontend/src/components/DestinationsView.tsx`: Circular channel avatars (`w-10 h-10 rounded-full object-cover ring-2 ring-slate-700`), platform badges, quota progress indicator, and connection modal.
- **Phase 4 Task 3: Live Streaming & Multi-Destination Relay (PRD 4.4):**
  - `backend/src/routes/streams.ts`: Auto-provisioning RTMP Ingest URL and unique Stream Key, stream key regeneration, multi-destination selection toggle, unified title update across destinations (`PUT /api/streams/title`), broadcast state toggle (`/api/streams/broadcast`).
  - `frontend/src/App.tsx`: Studio with RTMP credentials, copy-to-clipboard, unified broadcast title update with synchronized feedback, multi-destination relay toggle switches, and live pulsing ON AIR indicator.
- **Phase 4 Task 4: Super Admin Panel Expansion (PRD 4.5):**
  - `backend/src/routes/admin.ts`: Roster of all organizations, member counts, connected Facebook & YouTube channels with full names, IDs, circular logos, connection dates.
  - Quota limit editor (`PUT /api/admin/organizations/:orgId/limit`) and account suspension/reactivation (`PUT /api/admin/organizations/:orgId/status`).
  - Interactive multi-tab Super Admin Panel (`SuperAdminPanel.tsx`).
- **Phase 4 Task 5: Transactional Email Configuration (PRD 4.6):**
  - Super Admin controls to save Appwrite Messaging Provider IDs for Verification, Recovery, and Welcome emails.
  - Test email dispatch sandbox (`POST /api/admin/email-providers/test`) with live feedback.
- **Phase 4 Task 6: Docker Deployment Configuration (PRD 7.0 & ARCHITECTURE 6.0):**
  - `backend/Dockerfile` and `frontend/Dockerfile` created without any reverse proxies.
  - `docker-compose.yml` configured for Coolify deployment.

## 3. In Progress
- **None**: All core features implemented, verified, and quality-gated.

## 4. Key Decisions
| Date | Decision | Reason |
|---|---|---|
| 2026-11-05 | Appwrite as sole backend service | Required by project owner & ARCHITECTURE.md |
| 2026-11-05 | No reverse proxy in Docker Compose | Coolify handles routing directly |
| 2026-11-05 | Disambiguate test user env keys | Prevent `.env` collision where super admin overwrote normal test user |
| 2026-11-05 | Postinstall patch for Node 26 undici | Ensure official Appwrite Node SDK works reliably without runtime fetch errors |
| 2026-11-05 | Restream Studio dark theme | Approved clean aesthetic for multi-destination live broadcast dashboard |
| 2026-11-05 | Automatic `admin` label-driven role | Super Admin strictly governed by Appwrite Auth user label |
| 2026-11-05 | Circular logos for channels & pages | Mandatory per DESIGN.md Section 5 |

## 5. Important Notes
- Test users are pre-configured in `backend/.env`. Use them for all testing.
- No reverse proxy; deployment via Docker Compose + Coolify.
- Error logs must be written to `frontend/only_error_logs.json` and `backend/only_error_logs.json`.
- Strict security: NEVER log, print, or commit secrets.

## 6. Remaining Work / Next Steps
- Platform ready for staging / production Coolify deployment.
