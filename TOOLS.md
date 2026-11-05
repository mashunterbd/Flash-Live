# Required Frontend Design Tools

## Official Repositories
| # | Tool | Purpose | Link |
|---|---|---|---|
| 1 | Awesome DESIGN.md (VoltAgent) | 73+ brand design systems | https://github.com/voltagent/awesome-design-md |
| 2 | Impeccable (Paul Bakaus) | 24 slash commands + 59 anti-slop rules | https://github.com/pbakaus/impeccable · Docs: https://impeccable.style/ |
| 3 | Taste Skill (Leonxlnx) | Boldness, motion and density controls | https://github.com/leonxlnx/taste-skill · Site: https://www.tasteskill.dev/ |
| 4 | Web Design Guidelines (Vercel Labs) | UX and accessibility audit | https://github.com/vercel-labs/agent-skills · Source: https://github.com/vercel-labs/web-interface-guidelines |
| 5 | Playwright MCP (Microsoft) | Real browser screenshots and visual QA | https://github.com/microsoft/playwright-mcp |

## Installation Commands
```bash
# 1. Awesome DESIGN.md — choose a brand (e.g., Stripe or Linear)
#    and place its DESIGN.md in the project root

# 2. Impeccable
npx skills add pbakaus/impeccable

# 3. Taste Skill
npx skills add Leonxlnx/taste-skill

# 4. Vercel Web Design Guidelines
npx skills add https://github.com/vercel-labs/agent-skills --skill web-design-guidelines

# 5. Playwright MCP
claude mcp add playwright npx '@playwright/mcp@latest'
```
