# DESIGN.md — Design System (Apex Glass Architecture with 3 Switchable Themes)

> **Instruction to AI Agents:** Read this file before creating or modifying ANY UI component.
> Do NOT alter colors, fonts, spacing, or component styles on your own.
> All components must use CSS custom properties (design tokens) exclusively.

---

## 1. Design Direction
- **Reference:** **Apex Glass Dashboard** & **Restream Multi-Destination Studio**.
- **Principles:** Premium glassmorphism, semi-transparent frosted cards with 1px border and inner top highlight (`inset 0 1px 0 0 rgba(255,255,255,0.1)`), deep atmospheric background with soft CSS radial glow, generous spacing, high visual contrast, WCAG AA compliance (4.5:1).
- **Themes Supported:** **Dark** (Default, deep navy), **Light** (Clean pearl with subtle lilac glow), **Green** (Fresh translucent mint glass).

---

## 2. Three-Theme Design Tokens

Tokens are declared on `[data-theme="dark" | "light" | "green"]` and persisted to `localStorage`.

### Theme 1: Dark (Default — Matches Apex Reference)
| Token | CSS Variable | Hex / Value | Usage |
|---|---|---|---|
| **Background** | `--bg` | `#070B1A` | Deep navy application canvas |
| **Background Glow** | `--bg-glow` | `radial-gradient(circle at 75% 15%, rgba(42, 58, 143, 0.35) 0%, transparent 50%), radial-gradient(circle at 20% 85%, rgba(42, 58, 143, 0.20) 0%, transparent 40%)` | Atmospheric glow |
| **Surface** | `--surface` | `rgba(255, 255, 255, 0.04)` | Glass cards, table rows, pills |
| **Surface Hover** | `--surface-hover` | `rgba(255, 255, 255, 0.07)` | Hover states |
| **Surface Elevated** | `--surface-elevated`| `rgba(255, 255, 255, 0.08)` | Dropdown menus, modal dialogs |
| **Surface Card** | `--surface-card` | `rgba(13, 19, 39, 0.65)` | Primary container panels with 20px blur |
| **Border** | `--border` | `rgba(255, 255, 255, 0.10)` | 1px card outlines, divider lines |
| **Border Subtle** | `--border-subtle` | `rgba(255, 255, 255, 0.06)` | Sub-dividers, inner grids |
| **Border Focus** | `--border-focus` | `#7C8CFF` | Focused inputs, primary rings |
| **Inner Highlight** | `--highlight` | `inset 0 1px 0 0 rgba(255, 255, 255, 0.10)` | Glass top rim reflection |
| **Text Primary** | `--text` | `#F3F5FA` | Headings, high-contrast values |
| **Text Muted** | `--text-muted` | `#8B93A7` | Metadata, captions, inactive labels |
| **Accent Primary** | `--accent` | `#7C8CFF` | Soft glowing indigo accent |
| **Accent Strong** | `--accent-strong` | `#5B6EF5` | Active pills, primary buttons |
| **Accent Glow** | `--accent-glow` | `rgba(124, 140, 255, 0.25)` | Button and orb glow shadows |
| **Success** | `--success` | `#34D399` | Connected platforms, healthy streams |
| **Danger / Live** | `--danger` | `#F87171` | ON AIR indicators, destructive actions |
| **Warning** | `--warning` | `#FBBF24` | Quota approaching, alerts |

### Theme 2: Light (Clean Pearl)
| Token | CSS Variable | Hex / Value | Usage |
|---|---|---|---|
| **Background** | `--bg` | `#F4F6FB` | Crisp soft pearl canvas |
| **Background Glow** | `--bg-glow` | `radial-gradient(circle at 75% 15%, rgba(220, 227, 255, 0.70) 0%, transparent 55%), radial-gradient(circle at 20% 85%, rgba(220, 227, 255, 0.40) 0%, transparent 40%)` | Soft lilac glow |
| **Surface** | `--surface` | `rgba(255, 255, 255, 0.75)` | Frosted glass cards |
| **Surface Hover** | `--surface-hover` | `rgba(255, 255, 255, 0.90)` | Hovered cards |
| **Surface Elevated** | `--surface-elevated`| `#FFFFFF` | Solid elevated popovers |
| **Surface Card** | `--surface-card` | `rgba(255, 255, 255, 0.78)` | Container panels |
| **Border** | `--border` | `rgba(15, 23, 42, 0.08)` | Crisp borders |
| **Inner Highlight** | `--highlight` | `inset 0 1px 0 0 rgba(255, 255, 255, 0.90)` | White glass sheen |
| **Text Primary** | `--text` | `#0F172A` | Deep slate typography |
| **Text Muted** | `--text-muted` | `#64748B` | Slate secondary text |
| **Accent Primary** | `--accent` | `#4F5BD5` | Royal indigo accent |
| **Success / Danger** | `--success` / `--danger` | `#16A34A` / `#DC2626` | Emerald / Ruby status |

### Theme 3: Green (Soft Mint Glass)
| Token | CSS Variable | Hex / Value | Usage |
|---|---|---|---|
| **Background** | `--bg` | `#F0FAF4` | Soft mint canvas |
| **Background Glow** | `--bg-glow` | `radial-gradient(circle at 75% 15%, rgba(187, 247, 208, 0.65) 0%, transparent 55%), radial-gradient(circle at 20% 85%, rgba(187, 247, 208, 0.40) 0%, transparent 40%)` | Spring emerald glow |
| **Surface** | `--surface` | `rgba(255, 255, 255, 0.70)` | Mint-frosted glass cards |
| **Surface Hover** | `--surface-hover` | `rgba(255, 255, 255, 0.88)` | Hover states |
| **Border** | `--border` | `rgba(6, 95, 70, 0.12)` | Mint border |
| **Inner Highlight** | `--highlight` | `inset 0 1px 0 0 rgba(255, 255, 255, 0.90)` | Highlight sheen |
| **Text Primary** | `--text` | `#0B2B20` | Deep forest dark text |
| **Text Muted** | `--text-muted` | `#52705F` | Sage secondary text |
| **Accent Primary** | `--accent` | `#10B981` | Emerald accent |
| **Accent Strong** | `--accent-strong` | `#059669` | Deep emerald button |

---

## 3. Typography
- **Font Family:** `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- **Monospace Family:** `JetBrains Mono, "Fira Code", monospace` (for Stream Keys, Ingest URLs, IDs)
- **Tabular Figures:** `font-variant-numeric: tabular-nums` enforced on all numbers and metrics.

### Scale
- **H1 (Page Title):** `24–28px` semibold (`font-bold tracking-tight`)
- **Card Title:** `16–18px` medium (`font-bold`)
- **KPI Value:** `28–36px` bold (`font-extrabold tracking-tight tabular-nums`)
- **Body:** `13–14px` (`text-xs` / `text-sm`)
- **Caption / Meta:** `11–12px` (`text-[11px]`)

---

## 4. Components & UI Patterns

### Glass Panels & Cards
```css
.glass-panel {
  background-color: var(--surface-card);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-glass), var(--highlight);
  border-radius: 18px;
}

.glass-card {
  background-color: var(--surface);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--border);
  box-shadow: var(--highlight);
  border-radius: 16px;
}
```

### Channel Avatars (Mandatory Circular Design)
- All connected Facebook Pages and YouTube Channels **MUST** display:
  1. A **circular** avatar (`w-10 h-10 rounded-full object-cover ring-2 ring-[var(--border)]`)
  2. Corner platform icon badge (`f` blue / `yt` red)
  3. Full channel/page name beside it in high-contrast text (`text-[var(--text)]`)
  4. Toggle switch for multi-destination live broadcast.

### Status Pills
- **LIVE:** Red pill with pulsing dot (`bg-red-500/10 text-[var(--danger)] border border-red-500/30 font-mono`)
- **Active:** Emerald pill with dot (`bg-emerald-500/10 text-[var(--success)] border border-emerald-500/20 font-mono`)
- **Offline / Draft:** Slate pill (`bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)] font-mono`)
