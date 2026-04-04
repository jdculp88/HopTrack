# Connection Pooling — HopTrack

> Sprint 151 — The Ops Room (Riley + Quinn)

## How It Works

HopTrack uses the Supabase JS client (`@supabase/ssr` and `@supabase/supabase-js`), which communicates via the **REST API** (PostgREST), not direct PostgreSQL connections. PostgREST connects to PostgreSQL through **Supavisor**, Supabase's built-in connection pooler.

**This means connection pooling is handled automatically by Supabase infrastructure.** No client-side pooling configuration is needed for the JS client.

## Architecture

```
Browser/Server Component
  → Supabase JS Client (REST API)
    → PostgREST (HTTP → SQL translation)
      → Supavisor (connection pooling)
        → PostgreSQL
```

## When Pooling Matters

| Client Type | Pooling | Notes |
|-------------|---------|-------|
| `@supabase/ssr` (server.ts) | Automatic via PostgREST | Used by RSC, API routes |
| `@supabase/ssr` (client.ts) | Automatic via PostgREST | Used by browser components |
| `@supabase/supabase-js` (service.ts) | Automatic via PostgREST | Service role client |
| Direct PG (migrations, scripts) | Use pooled connection string | Port 6543, not 5432 |

## Verifying Pooling Is Active

1. Go to **Supabase Dashboard > Settings > Database**
2. Under **Connection Pooling**, verify:
   - Mode: **Transaction** (recommended for serverless)
   - Pool size: default is fine for launch
3. The **Pooled connection string** (port 6543) is for direct PG tools only
4. The **REST API URL** (`https://<ref>.supabase.co`) already routes through Supavisor

## Production Considerations

- **Serverless functions** (Vercel): Each invocation creates a new HTTP request to PostgREST, not a new PG connection. Supavisor handles multiplexing.
- **Connection exhaustion**: If you see `FATAL: too many connections`, check:
  1. Dashboard > Settings > Database > Active connections
  2. Run: `SELECT count(*) FROM pg_stat_activity;`
  3. Look for long-running queries: `SELECT * FROM pg_stat_activity WHERE state = 'active';`
- **Scaling**: The default Supavisor pool size (varies by plan) handles typical launch traffic. Monitor via Dashboard and increase if needed.

## Direct PG Access (Migrations Only)

For `supabase db push` or direct SQL scripts, use the **pooled connection string**:

```
postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

Never use port 5432 (direct) from serverless environments — it bypasses the pooler and can exhaust connections.

## References

- [Supabase Connection Pooling Docs](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Supavisor Architecture](https://supabase.com/blog/supavisor-postgres-connection-pooler)
- Incident runbook: `docs/launch-day-ops.md` (connection exhaustion section)
