# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
npm run dev        # Start dev server at localhost:8080
npm run build      # Production build
npm run lint       # ESLint checks
npm run test       # Run Vitest tests
npm run test:watch # Tests in watch mode
npm run preview    # Preview production build
```

## Architecture

**Scout's Eye** is an offline-first FTC (FIRST Tech Challenge) scouting app. Data is stored in `localStorage` as the primary database, with optional cloud sync to a Google Sheets endpoint.

### Data Flow

1. User fills out match/pit scouting forms → saved to `localStorage`
2. A fire-and-forget POST also syncs to Google Sheets (`VITE_SHEETS_ENDPOINT`)
3. On `DataPage` load, data is fetched from Sheets via GET and merged locally
4. Analytics are computed client-side from raw match entries

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/types.ts` | Core data types: `MatchEntry`, `PitEntry`, `TeamSummary` |
| `src/lib/storage.ts` | localStorage CRUD + Google Sheets sync |
| `src/lib/analytics.ts` | Computes `TeamSummary` — Contribution Rating (sOPR-like) and Reliability Index |
| `src/App.tsx` | Router setup (React Router v6), providers |
| `apps-script.gs` | Google Apps Script that serves as the Sheets API backend |

### Routes

```
/        → MatchScout (match-by-match form)
/pit     → PitScout (pre-match capability form)
/data/*  → DataPage with subroutes: /lookup, /rankings, /log, pit view
```

### Analytics

- **Contribution Rating**: weighted sum of auto + teleop + endgame scores + pattern adherence + park success + reliability
- **Reliability Index** (0–100): composite of auto reliability, pattern execution rate, and park success rate

### AutoPathCanvas

`src/components/AutoPathCanvas.tsx` is an interactive SVG canvas for drawing robot autonomous paths on a field diagram. Paths are stored as normalized `{x, y}` coordinate arrays in `MatchEntry.autoPath`. Supports both touch and mouse input.

### Environment Variables

```
VITE_SHEETS_ENDPOINT   # Google Apps Script web app URL for data sync
```

### Tech Notes

- TypeScript config is intentionally loose (`noImplicitAny: false`, `strictNullChecks: false`) for rapid development
- Path alias: `@/*` → `src/*`
- UI components in `src/components/ui/` are shadcn-ui (Radix UI + Tailwind); don't edit these manually — use the shadcn CLI to add/update
- Custom Tailwind colors: `alliance-red`, `alliance-blue` (used for FTC alliance coloring)
