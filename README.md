# Scout's Eye

Scout's Eye is an offline-first match scouting web app for FIRST Tech Challenge (FTC) teams. Scouts record match and pit data on a phone or tablet, and the app turns it into team rankings and per-team breakdowns so an alliance can plan strategy. Data lives in the browser's `localStorage`, so it keeps working without a connection, and it can be shared between devices by QR code or synced to a Google Sheet.

## Live app

https://makescouting.vercel.app (page title "FTC Scout - Strategy Engine")

## Features

- **Match scouting** (`/`): match-by-match form with alliance color selection, counters for scoring, auto reliability, park status and cycle style.
- **AutoPathCanvas**: a touch and mouse canvas for drawing a robot's autonomous path on a field diagram; the path is saved with the match entry.
- **Pit scouting** (`/pit`): a pre-match robot capability form.
- **Data page** (`/data`):
  - Team Lookup with charts (line, pie and bar via Recharts).
  - Rankings sorted by Contribution Rating.
  - Match Log.
  - Pit data view (toggle between match and pit data).
- **Analytics**: computed client-side from raw entries. Contribution Rating (an sOPR-like weighted score) and a 0 to 100 Reliability Index.
- **Export**: Excel workbook (`.xlsx`) and CSV downloads for match data, pit data or rankings, from the Data page.
- **QR code data sync**: the Share page (`/share`) compresses entries (lz-string) into a sequence of QR codes; the Receive page (`/receive`) scans them with the camera and imports only new entries.
- **Optional Google Sheets sync**: saves are also POSTed to a Google Apps Script web app, and the Data page fetches from it. `apps-script.gs` is the backend script (separate "Matches" and "Pits" sheets, GET and POST by `?type=match|pit`). Without an endpoint the app stays local-only.

## Tech stack

- React 18, TypeScript, Vite 5 (SWC plugin)
- React Router 6
- Tailwind CSS with shadcn-ui (Radix UI) components
- TanStack Query, Recharts, framer-motion, sonner
- `xlsx` (export), `lz-string`, `react-qr-code`, `html5-qrcode` (QR sync)
- Vitest and Testing Library for tests; Playwright is a dev dependency
- Deployed on Vercel (`vercel.json`)

## Local setup

```sh
git clone https://github.com/AryaVora621/ftc-decode-scouting.git
cd ftc-decode-scouting
npm install
npm run dev
```

The dev server runs at `http://localhost:8080` (port set in `vite.config.ts`).

### Environment variables

Only needed for Google Sheets sync. The app works without it.

- `VITE_SHEETS_ENDPOINT`: URL of the deployed Apps Script web app (see `apps-script.gs`).

## Scripts

- `npm run dev`: start the dev server
- `npm run build`: production build to `dist/`
- `npm run build:dev`: development-mode build
- `npm run preview`: preview the production build
- `npm run lint`: ESLint
- `npm run test`: run Vitest once
- `npm run test:watch`: Vitest in watch mode

## Tests

`npm run test` runs Vitest with jsdom (`vitest.config.ts`). The suite is currently a single placeholder test in `src/test/example.test.ts`, so it does not yet cover the analytics, storage or QR code.

## Built by

Built by Arya Vora, captain of FTC team 23786 MakEMinds.
