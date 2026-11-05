# PRD.md — Product Requirements Document

> **Instruction to AI Agents:** This document is the single source of truth for product scope.
> Do NOT invent, assume, or add features that are not listed here. If something is unclear, ask before implementing.

---

## 1. Product Overview

A multi-tenant live streaming management platform that lets organizations connect their Facebook Pages and YouTube Channels, then broadcast live to all of them simultaneously from a single stream source (any RTMP-capable streaming software).

**Design reference:** Restream-style platform (clean, professional, fast).

## 2. Target Users

| Segment | Description |
|---|---|
| Multimedia houses | Production companies that go live frequently. |
| Content creators | Creators who stream many times daily across platforms. |
| Media organizations | News and media outlets broadcasting live events from multiple locations. |

## 3. User Roles & Access

| Role | How it is assigned | Capabilities |
|---|---|---|
| **Super Admin** | Any user whose Appwrite Auth account has the label `admin` | Full platform control via the Super Admin Panel |
| **Organization Admin** | Invited into a company team | Manage own organization, channels, streams and team |
| **Normal User** | Default for all other accounts | Limited to own account features |

**Super Admin rules (automatic, label-driven):**
- Adding the `admin` label to a user in Appwrite Auth immediately grants Super Admin access.
- Removing the label immediately downgrades the user to Normal User.
- This applies to newly created users as well, whenever the label is applied from the Appwrite Auth section.

## 4. Core Features

### 4.1 Authentication & Account Management
- Sign up, login, logout, email verification.
- Forgot password / reset password integration.
- Session management: each user can view active sessions, including IP address and device details.

### 4.2 Organization & Team Management
- A company or individual starts with a personal Auth account.
- Inviting additional admins converts the account into an organization using Appwrite Teams (memberships).
- Each company has its own isolated Team workspace.
- Invitable roles: Super Admin (platform-level, via label) or standard Organization Admin.

### 4.3 Platform Connections
- Connect **Facebook Pages** and **YouTube Channels**.
- Request all permissions required for live streaming during the connection flow.
- Display the full channel/page **name** and a **circular logo**.
- Connection count per organization is limited by a Super Admin-defined quota.

### 4.4 Live Streaming
- User generates an **RTMP Ingest URL + Stream Key**.
- User pastes them into any streaming software (OBS, vMix, etc.).
- The platform receives the stream and re-distributes it to selected destinations.
- **Multi-destination selection:** choose which connected pages/channels receive the live stream.
- **Unified title update:** changing the title once updates it on all selected platforms.

### 4.5 Super Admin Panel
- View all registered users and organizations.
- Per organization: number of connected Facebook Pages and YouTube Channels, page/channel names, IDs, and connection date and time.
- Increase or decrease the connection limit per organization.
- Monitor account activity.
- Suspend an account and restore (reactivate) it.
- Configure **Email Provider IDs** (see 4.6).

### 4.6 Transactional Email (Appwrite Messaging)
- Super Admin enters a separate Provider ID (created in Appwrite Messaging) for each email type:
  - Account verification
  - Forgot password
  - Welcome / congratulations after signup
- The system sends targeted emails to specific users via the configured provider.

## 5. Non-Functional Requirements
- Fast initial load and responsive UI across devices.
- Professional, polished, consistent UI.
- Secure handling of OAuth tokens and stream keys.

## 6. Project Structure

```
/frontend    -> independent file tree and work scope
/backend     -> independent file tree and work scope
```

- Frontend and backend are developed and run independently.
- Required configuration already exists in `backend/.env`. Use it.
- Reorganize and document `.env` professionally (grouped sections, clear comments, `.env.example` without secrets).

## 7. Deployment Constraints
- Deployment: **Docker Compose via Coolify**.
- **Do NOT use any reverse proxy** (e.g., Traefik, Caddy, Nginx-proxy). Coolify handles routing.

## 8. Testing
- Test accounts are already configured in the config files. Use them for all testing.

## 9. Out of Scope
- Any feature not listed above.
