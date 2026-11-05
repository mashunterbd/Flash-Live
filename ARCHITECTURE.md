# ARCHITECTURE.md — Architecture Document

> **Instruction to AI Agents:** Follow this architecture strictly.
> Do NOT introduce alternative databases, backends, or reverse proxies.

---

## 1. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | As defined in `/frontend` (see package.json) |
| Backend | As defined in `/backend` (see package.json) |
| Database / Auth / Messaging | **Appwrite** (the only allowed backend service) |
| Deployment | Docker Compose via **Coolify** |
| Reverse Proxy | **None** (no Traefik, Caddy, etc.) |

> Do NOT add MySQL, MongoDB, PostgreSQL, or any other database.

## 2. Folder Structure

```
project-root/
├── frontend/          # UI application (own tree, own scripts)
│   └── only_error_logs.json   # auto-generated at runtime
├── backend/           # API/server (own tree, own scripts)
│   ├── .env
│   └── only_error_logs.json   # auto-generated at runtime
├── docker-compose.yml
├── PRD.md
├── ARCHITECTURE.md
├── DESIGN.md
├── CONTEXT.md
├── RULES.md
├── TRACKER.md
├── Updates.md
└── CLAUDE.md
```

## 3. Identity, Roles & Organizations (Appwrite)

```
Individual / Company signs up
        │
        ▼
Appwrite Auth (user account)
        │
        │  invites additional admins
        ▼
Appwrite Teams (Organization Memberships)
        │
        ▼
One isolated Team workspace per company
```

- **Super Admin:** Auth user with label `admin` (automatic grant/revoke).
- **Organization Admin:** Team member of a company workspace.
- Each company's admins live in that company's own Team workspace.
- **Sessions:** track login IP, device, and active sessions per user via Appwrite session data.
- **Forgot password:** use Appwrite Auth recovery flow.

## 4. Data Model (Logical Schema)

| Entity | Key Fields |
|---|---|
| Organization (Team) | team_id, name, connection_limit, status (active/suspended) |
| Member | user_id, team_id, role |
| Connected Channel | id, org_id, platform (facebook/youtube), external_id, name, logo_url, permissions, connected_at |
| Stream Session | id, org_id, ingest_url, stream_key (secured), title, destinations[], status, started_at |
| Email Provider Config | type (verification/recovery/welcome), provider_id |
| Activity Log | user_id, action, ip, timestamp |

> Final collection/attribute definitions must be created in Appwrite and mirrored here.

## 5. Key API Flows

**5.1 Connect a Channel**
1. User selects Facebook or YouTube → OAuth consent with live-streaming permissions.
2. Backend stores token securely and fetches name, ID and logo.
3. Backend checks the organization's connection limit, then saves the channel.

**5.2 Go Live**
1. User generates ingest URL + stream key.
2. User selects destination channels (one or many).
3. External software pushes the stream to the ingest endpoint.
4. Backend relays the stream to each selected platform's live endpoint.
5. Title update → propagated to all destinations in one action.

**5.3 Super Admin Controls**
- List users/orgs → inspect connected channels → adjust limits → suspend/reactivate.

**5.4 Transactional Emails**
- Backend reads the Provider ID for the email type → sends via Appwrite Messaging to the targeted user.

## 6. Deployment
- All services are containerized and deployed with Docker Compose through Coolify.
- Environment configuration is read from `backend/.env`.
