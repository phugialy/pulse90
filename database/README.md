# Pulse90 Database Setup

The app is configured for Supabase in `.env.local`.

The initial schema lives in:

```text
database/001_initial_schema.sql
```

## Current Status

The Supabase project URL is reachable from the app, but the connected Supabase MCP account does not currently have permission to apply migrations to project `pqfdzelkucqdobyturfv`.

Until the schema is applied, the app will keep rendering from mock data.

If Supabase SQL Editor reports:

```text
syntax error at or near "("
LINE 1: with (security_invoker = true) as
```

make sure the full script is selected/run, not only the line beginning with `with`. The view statements now use explicit `drop view` + `create view ... with (security_invoker = true) as` syntax to make this less fragile.

## Apply The Schema

Option A:

1. Open the Supabase dashboard for the Pulse90 project.
2. Go to SQL Editor.
3. Paste and run `database/001_initial_schema.sql`.
4. Restart the local dev server.

Option B:

1. Connect project `pqfdzelkucqdobyturfv` to the Supabase connector available to Codex.
2. Ask Codex to apply `database/001_initial_schema.sql`.

Option C:

Provide the direct Postgres connection string for the project from Supabase Dashboard → Project Settings → Database. The anon and service-role API keys cannot run raw DDL by themselves.

## Security Shape

- RLS is enabled on all tables.
- Public read policies exist only for app-facing data.
- `source_snapshots` and `job_runs` stay private.
- The service-role key must stay server-only.
- `.env.local` is ignored by git.
