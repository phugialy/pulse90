# Pulse90

Pulse90 is a focused World Cup 2026 watch desk. It is built for people who want team context, fixtures, groups, knockout paths, recent team history, predicted formations, and match-day information without a headline-heavy sports-news experience.

## Product Scope

- Daily watch desk for current and upcoming matches
- Fixtures with date, kickoff time, venue, host city, stakes, and implications
- Groups and knockout bracket views
- Team directory with search and region filters
- Team pages with upcoming matches, recent history, squad, and predicted formation
- Supabase-backed data for teams, fixtures, squads, standings, match events, and recent national-team history

## Stack

- Next.js App Router
- React
- Tailwind CSS
- Supabase Postgres
- Vercel deployment target

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Runtime:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Compatibility fallback:

```bash
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Admin/import scripts only:

```bash
SUPABASE_SERVICE_ROLE_KEY=
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` in client code or public deployment logs.

## Database

Run SQL files in order:

```text
database/001_initial_schema.sql
database/002_group_scoring_engine.sql
database/003_team_lineups.sql
database/004_team_recent_history.sql
```

Notes:

- `002_group_scoring_engine.sql` adds group-stage scoring recalculation and recent form support.
- `003_team_lineups.sql` prepares tables for future official/last-used XI imports.
- `004_team_recent_history.sql` stores raw historical match rows and goal-scorer rows from Qatar 2022 onward.

## Data Imports

Seed World Cup 2026 baseline data:

```bash
npm run seed:worldcup
```

Import squads:

```bash
npm run import:squads
```

Import recent national-team history:

```bash
npm run import:history
```

Verify scoring engine:

```bash
npm run verify:scoring
```

Verify history import:

```bash
npm run verify:history
```

## Data Sources

- FIFA squad announcements and public squad mirrors
- Public 2026 World Cup fixture references
- `martj42/international_results` for completed international results and goal-scorer rows
- Editorial/predicted lineup sources for formation shape research

Predicted formations are not official team sheets. Official lineups should be treated as match-day data and imported separately when available.

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
npm run seed:worldcup
npm run import:squads
npm run import:history
npm run verify:scoring
npm run verify:history
```

## Deployment

Vercel should be configured with:

- Framework preset: Next.js
- Build command: `npm run build`
- Install command: `npm install`
- Output directory: Next.js default

Production env vars:

```bash
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

Do not set `SUPABASE_SERVICE_ROLE_KEY` unless a protected server-only admin workflow is added. Current production app reads public data through RLS-protected tables/views.

## Operational Notes

- Group standings are recalculated from fixture score updates.
- Knockout bracket data is currently structural and should remain data-only, not prediction-driven.
- Recent team history is capped in UI and paginated to reduce cognitive load.
- World Cup Story is intentionally blank until editorial/story data exists.
- Automation can later update scores, match events, standings, and lineup snapshots.

## Repository

Target GitHub repository:

```text
https://github.com/phugialy/pulse90
```
