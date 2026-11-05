# RULES.md — Development Rules

> **Instruction to AI Agents:** These rules are mandatory for every change.

---

## 1. General Rules
1. Do NOT add unnecessary dependencies.
2. Do NOT break existing APIs or functionality.
3. Run all relevant tests after every change.
4. Follow the project's coding standards and conventions.
5. Do NOT change existing code or configuration unnecessarily.
6. Update `TRACKER.md`, `CONTEXT.md`, and `Updates.md` after every task.

## 2. Automatic Error Logging

Both applications must automatically generate an error log file when they start:

| App | File Path |
|---|---|
| Frontend | `frontend/only_error_logs.json` |
| Backend | `backend/only_error_logs.json` |

**Behavior:**
- Created automatically whenever the frontend or backend runs.
- Every `error` or `warning` entry from the logs is captured into this file.
- **Deduplication:** the same issue is stored only once.
- Each entry tracks how many times it occurred.

**Suggested entry format:**
```json
{
  "id": "hash-of-message-and-source",
  "level": "error | warning",
  "message": "Issue description",
  "source": "file/module",
  "count": 12,
  "first_seen": "ISO-8601 timestamp",
  "last_seen": "ISO-8601 timestamp"
}
```

**Purpose:** developers and AI agents read this file to quickly identify and resolve unique issues.
