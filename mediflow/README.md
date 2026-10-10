# Sanjeevani Hospital AI – "The Blocked Bed"

Hospital operations dashboard (beds, doctors, labs, discharges, staff, inventory) with a
rule-based AI agent that detects bottlenecks, ranks departments and raises escalations.

**Run it:** open `index.html` in any modern browser (no server, no build step, no install).

## Folder structure

```
mediflow/
├── index.html                 Page skeleton only: markup + <link>/<script> tags
├── css/                       UI / UX styling
│   ├── base.css               Layout, cards, tables, forms, responsive rules
│   ├── liquid-glass.css       Glass theme (dark / light)
│   ├── liquid-glass-buttons.css
│   ├── boot.css               Splash screen
│   ├── page-loader.css        Page-transition loader
│   ├── addons.css             Agent panels (ranking, escalations, scenarios)
│   ├── auth.css               Sign in / sign up / account page
│   └── import.css             Dataset import wizard
└── js/
    ├── theme-init.js          Applies saved theme before first paint
    ├── core/                  config.js · utils.js · state.js (db, save, permissions, toast)
    ├── data/seed.js           Demo seed data
    ├── logic/rules-engine.js  Capacity metrics, bottleneck rules, auto-actions
    ├── pages/                 hospital-pages · ai-reviews-updates · inventory-reports
    ├── ui/                    layout · events · boot-screen · theme-and-motion · glass-glow · page-loader
    ├── agent/                 insights · ranking · scenarios · agent-cycle · monitor · panels · agent-events
    ├── auth/                  auth-core (hashing, lockout) · login-ui · accounts-page
    ├── import/                import-config · import-engine · import-ui (CSV / JSON / Excel)
    └── main.js                Start-up
```

## How the pieces connect

Scripts are plain (non-module) files that share one global scope, so the project works by
double-clicking `index.html`. **Load order in `index.html` matters** – keep it as is:
core → data → logic → ui/pages → agent → auth → import → main.js.

Flow: `main.js` → `render()` (ui/layout.js) → page builders (pages/) → `wirePage()` (ui/events.js).
Data lives in `localStorage` (demo only, not connected to real hospital systems).
