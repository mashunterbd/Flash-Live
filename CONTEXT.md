# CONTEXT.md — Project Context & Memory

> **Instruction to AI Agents:** Read this file first at the start of every session.
> Update it at the end of every work session. Goal: any new agent can understand project state WITHOUT re-analyzing the entire codebase.

---

## 1. Current Status
- **Phase:** Phase 1 Completed (Codebase Audit & Verification) / Awaiting approval to start Phase 2 & Foundation
- **Last updated:** 2026-11-05

## 2. Completed Work
- **Phase 0 & 1 Audit:** Inspected project root, confirmed directory structure, documented state of `backend/` and `frontend/`.
- Identified that `frontend/` is completely uninitialized, and `backend/` only contains `backend/.env`.
- Identified missing `.git` repository and `.gitignore`.
- Identified `.env` key collisions (`login_mail`, `login_passwd`, `user_id` defined twice) and missing RTMP/Server/Database variables.
- Verified connectivity to `appwrite.doitfastit.de` (TCP port 443 connects, but TLS/HTTP requests time out on VPS).

## 3. In Progress
- Presenting Phase 0 & 1 Audit Report to the lead/project owner.
- Awaiting confirmation on Appwrite VPS connectivity status, .env reorganization, and approval of design system tokens before proceeding to Phase 2.

## 4. Key Decisions
| Date | Decision | Reason |
|---|---|---|
| 2026-11-05 | Appwrite as sole backend service | Required by project owner & ARCHITECTURE.md |
| 2026-11-05 | No reverse proxy in Docker Compose | Coolify handles routing directly |
| 2026-11-05 | Disambiguate test user env keys | Prevent `.env` collision where super admin overwrites normal test user |

## 5. Important Notes
- Test users are pre-configured in `backend/.env`.
- No reverse proxy; deployment via Docker Compose + Coolify.
- Error logs must be written to `frontend/only_error_logs.json` and `backend/only_error_logs.json`.
- Strict security: NEVER log, print, or commit secrets.

## 6. Remaining Work / Next Steps
- Phase 2: Environment & Secrets Verification (`.gitignore`, reorganize `.env`, create `.env.example`, confirm Appwrite/test user auth).
- Phase 3: Foundation Setup (error loggers, pre-push hook, design tools, DESIGN.md tokens approval, build/start verification).
- Phase 4: Feature Implementation (Appwrite Auth, Roles, Teams, Channel Connection, Live Streaming / RTMP, Super Admin, Messaging).
