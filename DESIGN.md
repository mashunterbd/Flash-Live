# DESIGN.md — Design System (Restream Studio Architecture)

> **Instruction to AI Agents:** Read this file before creating or modifying ANY UI component.
> Do NOT alter colors, fonts, spacing, or component styles on your own.

---

## 1. Design Direction
- **Reference:** **Restream** & **Linear** live-streaming studio platforms.
- **Principles:** High density, dark-mode first, professional, low-latency visual feedback, responsive, fast-loading.
- **Tone:** Clean obsidian studio surfaces, vivid live indicator accents, crisp typography, clear contrast.

---

## 2. Color Tokens

| Token | CSS Variable | Hex / Value | Usage |
|---|---|---|---|
| **Primary** | `--color-primary` | `#2563EB` (Blue 600) | Primary actions, CTAs, focus rings |
| **Primary Hover** | `--color-primary-hover` | `#1D4ED8` (Blue 700) | Primary hover states |
| **Secondary** | `--color-secondary` | `#475569` (Slate 600) | Secondary buttons, subtle actions |
| **App Background** | `--color-bg` | `#0B0F17` (Deep Obsidian) | Main application canvas |
| **Surface (Card)** | `--color-surface` | `#131B2E` (Navy Slate) | Cards, panels, sidebars, modal surfaces |
| **Surface Hover** | `--color-surface-hover` | `#1E293B` (Slate 800) | Hovered table rows, interactive cards |
| **Surface Elevated** | `--color-surface-elevated` | `#1A2338` | Popovers, dropdown menus, tooltips |
| **Border / Divider** | `--color-border` | `#1E293B` (Slate 800) | Card outlines, table dividers |
| **Border Focus** | `--color-border-focus` | `#3B82F6` (Blue 500) | Form input focus boundaries |
| **Text Primary** | `--color-text` | `#F8FAFC` (Slate 50) | High-contrast body, titles, headings |
| **Text Muted** | `--color-text-muted` | `#94A3B8` (Slate 400) | Metadata, descriptions, inactive icons |
| **Success / Connected**| `--color-success` | `#10B981` (Emerald 500) | Active channels, healthy streams, connected |
| **Warning** | `--color-warning` | `#F59E0B` (Amber 500) | Quota warnings, approaching limits |
| **Danger / Live** | `--color-danger` | `#EF4444` (Red 500) | LIVE broadcasting indicator, destructive, errors |
| **Live Pulsing Glow**| `--color-live-glow` | `rgba(239, 68, 68, 0.4)` | Live broadcast pulsing ring glow |

---

## 3. Typography

- **Font Family:** `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- **Monospace Family:** `JetBrains Mono, "Fira Code", ui-monospace, SFMono-Regular, monospace` (for Stream Keys, Ingest URLs, IDs)

### Type Scale
| Role | Size | Line Height | Weight | Letter Spacing |
|---|---|---|---|---|
| **H1 (Page Title)** | `24px` (`1.5rem`) | `32px` | `700 (Bold)` | `-0.02em` |
| **H2 (Section Title)** | `18px` (`1.125rem`) | `26px` | `600 (Semibold)` | `-0.01em` |
| **H3 (Card Header)** | `15px` (`0.9375rem`) | `22px` | `600 (Semibold)` | `0` |
| **Body (Default)** | `14px` (`0.875rem`) | `20px` | `400 (Regular)` | `0` |
| **Body Strong** | `14px` (`0.875rem`) | `20px` | `500 (Medium)` | `0` |
| **Caption / Meta** | `12px` (`0.75rem`) | `16px` | `400 (Regular)` | `+0.01em` |
| **Code / Keys** | `13px` (`0.8125rem`) | `18px` | `500 (Medium)` | `0` |

---

## 4. Layout & Spacing Scale

- **Scale:** `4px (1) / 8px (2) / 12px (3) / 16px (4) / 20px (5) / 24px (6) / 32px (8) / 48px (12)`
- **Content Max-Width:** `1440px` for Studio Workspace, `1200px` for Admin tables.
- **Breakpoints:**
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px
  - `xl`: 1280px

### Border Radius & Elevation Tokens
- `--radius-sm`: `6px` (Tags, small pills)
- `--radius-md`: `8px` (Inputs, standard buttons)
- `--radius-lg`: `12px` (Cards, panels, modal dialogs)
- `--radius-full`: `9999px` (Avatars, platform channel logos)
- `--shadow-card`: `0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.3)`
- `--shadow-dropdown`: `0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.4)`

---

## 5. Components & UI Patterns

### Buttons
- **Primary:** `bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors`
- **Secondary:** `bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 rounded-lg`
- **Danger:** `bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 rounded-lg`
- **Ghost:** `hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg`
- **Disabled:** `opacity-50 cursor-not-allowed pointer-events-none`
- **Loading State:** Must replace icon/text with `<Spinner />` and disable interaction.

### Channel Avatars (Mandatory Circular Design)
- All connected Facebook Pages and YouTube Channels **MUST** display:
  1. A **circular** avatar (`w-10 h-10 rounded-full object-cover ring-2 ring-slate-700`)
  2. A corner platform icon badge (Facebook Blue / YouTube Red)
  3. The **full channel / page name** in high-contrast text (`text-slate-100 font-medium`)
  4. Connection timestamp & toggle switch for multi-destination live broadcast.

### Status Badges
- **LIVE:** Red pill with pulsing red dot (`bg-red-500/10 text-red-400 border border-red-500/30 animate-pulse`)
- **Active / Connected:** Emerald pill (`bg-emerald-500/10 text-emerald-400 border border-emerald-500/20`)
- **Offline:** Slate pill (`bg-slate-800 text-slate-400 border border-slate-700`)
- **Suspended:** Amber/Red pill (`bg-amber-500/10 text-amber-400 border border-amber-500/20`)

---

## 6. UX & Accessibility Rules
- **Minimum Hit Target:** `24×24px` for inline controls, `44×44px` on mobile screens.
- **Browser Zoom:** Never set `user-scalable=no` or `maximum-scale=1`.
- **Loading Spinners:** Every async action (auth submit, channel connect, stream toggle, title update) must display a `<Spinner />`.
- **Anti-Slop:** No generic purple-blue gradients. Use clean Lucide SVG icons.

---

## 7. Performance Standards
- Zero CLS (Cumulative Layout Shift) with explicit avatar placeholders.
- Instant feedback on toggles with optimistic UI state.
- Fast, code-split bundles using modern ESM.
