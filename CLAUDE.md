# CLAUDE.md — Frontend Design Engineering Rules (98/100 Pipeline)

## 0. Read First
Before any task read: `CONTEXT.md`, `TRACKER.md`, `PRD.md`, `ARCHITECTURE.md`, `DESIGN.md`, `RULES.md`.
After any task update: `TRACKER.md`, `CONTEXT.md`, `Updates.md`.

## 1. Design System Grounding (Awesome DESIGN.md)
- Always read `./DESIGN.md` before creating or modifying any UI component.
- Strictly enforce the exact hex colors, typography scale, spacing tokens, border radius, and shadow tokens defined in `./DESIGN.md`.

## 2. Anti-Slop Governance (Impeccable & Taste Skill)
- Never use generic purple-to-blue gradient text headlines.
- Never place emoji icon tiles above feature headings; use clean SVG icons instead.
- Run `/impeccable audit` and `/impeccable polish` across the COMPONENTS, TYPOGRAPHY, and BACKGROUND layers.
- Respect calibrated Taste parameters: BOLD (Design Variance), MOTION (Motion Intensity), and DENSITY (Visual Density).

## 3. UX & Accessibility Audit (Vercel Web Design Guidelines)
- Every interactive button or close icon must have a minimum hit target of 24×24px (44×44px for mobile touch targets).
- Never disable browser zoom (`user-scalable=no` or `maximum-scale=1` is strictly forbidden).
- Every async form submission or action button must display an explicit `<Spinner />` loading state while pending.

## 4. Closed-Loop Browser QA (Microsoft Playwright MCP)
- After building or updating any page, open the live localhost URL using Playwright MCP.
- Click interactive buttons and take a real browser screenshot (`take_screenshot`).
- Verify that no close (`X`) button or CTA overflows its card or overlaps text.
- Fix all visual bugs before completing the task.
