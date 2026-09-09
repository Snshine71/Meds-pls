# Sand Table

**AI-Guided Story Studio for Character-Driven Books**

> A sand table is where you plan the mission before you execute it. This app is the sand table for your books: plan the whole operation first, then write with AI fire support, chapter by chapter, until the manuscript is compiled and publish-ready.

Sand Table is a local-first Progressive Web App that walks a solo author through a proven "plotter" workflow — pick a format, lock the ending first, build the cast, map the structure, then draft collaboratively with AI one unit at a time, and finally compile and export a publish-ready manuscript. It is **BYOK** (bring your own Anthropic API key); all story data lives in the browser (IndexedDB). No backend, no accounts.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React 18 + TypeScript (functional components + hooks) |
| Build | Vite + `vite-plugin-pwa` (installable, offline shell) |
| State | Zustand (one store per domain) |
| Persistence | Dexie.js (IndexedDB), full-project JSON export/import |
| Styling | Tailwind CSS (design tokens per spec §8) |
| Routing | React Router v6 |
| AI | Anthropic Messages API, direct from the browser (BYOK) |
| Testing | Vitest |

## Getting started

```bash
npm install
npm run dev        # start the dev server
npm run build      # type-check + production build (emits PWA service worker)
npm run test       # run the Vitest suite
npm run typecheck  # tsc, no emit
```

Then open **Settings**, paste your Anthropic API key (stored only on your device), and hit **Test connection**.

## Build phases

This repository is being built in the phase order defined in the build spec.

- **Phase 1 — Skeleton (complete).** Vite + React + TS + Tailwind + PWA scaffold, Dexie schema, Zustand stores, routing, Settings (API key + test call, model overrides, theme, developer mode, danger zone), and the Hangar with full project CRUD + JSON export/import. The signature mission-timeline stepper and the Mission Plan project shell are in place; station content is filled in during later phases.
- **Phase 2** — Stations 0–3 (Briefing → Objective → Roster → Structure), prompt engine core.
- **Phase 3** — Station 4 novel drafting (streaming, review/approve, continuity ledger).
- **Phase 4** — Picture-book path (spreads, illustration briefs, visual consistency blocks).
- **Phase 5** — Station 5 compile & export, front matter, Publish Prep, first-run overlay, dark-mode polish.

## Project layout

```
src/
  config/      models & pricing, format registry (§5), station definitions
  db/          Dexie schema, domain types (§4), repositories (+ tests)
  lib/         Anthropic client (test-connection, backoff), id helpers
  stores/      Zustand: settings, projects, workflow, drafting, toasts
  components/   AppLayout, StationStepper, ProgressRing, UI primitives
  pages/       Hangar, MissionPlan (project shell), Settings
```

## Design

Field-map aesthetic (spec §8): deep-navy command surfaces, blueprint blues, go-green status, signal-red accents. Colors are CSS variables so dark mode swaps them in one place. Fonts are self-hosted via `@fontsource` (Saira Semi Condensed / Source Serif 4 / Inter).
