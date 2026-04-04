/**
 * cleanup-future-seeds.mjs
 * One-time script to backdate future seed data so the timeline ends at yesterday.
 *
 * Usage: node scripts/cleanup-future-seeds.mjs [--dry-run]
 *
 * The seed-next-day.mjs script was run once per sprint close, advancing one day
 * each time. After 38+ sprints, seed data advanced ~33 days past today's date.
 * This script shifts ALL Pint & Pixel timestamps backward so the latest session
 * lands on yesterday. All data is preserved — just shifted in time.
 *
 * Sprint 155 — one-time backdate.
 */

import { createClient } from '@supabase/supabase-js';

try {
  process.loadEnvFile('.env.local');
} catch {
  // env vars may already be set
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const PP_BREWERY_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const dryRun = process.argv.includes('--dry-run');
const BATCH_SIZE = 200;

async function main() {
  console.log(`cleanup-future-seeds.mjs — BACKDATE MODE${dryRun ? ' (DRY RUN)' : ''}`);
  console.log('Targeting Pint & Pixel brewery only.\n');

  // 1. Find the latest session date
  const { data: latestSession } = await supabase
    .from('sessions')
    .select('started_at')
    .eq('brewery_id', PP_BREWERY_ID)
    .order('started_at', { ascending: false })
    .limit(1)
    .single();

  if (!latestSession) {
    console.log('No sessions found for Pint & Pixel. Nothing to do.');
    return;
  }

  const latestDate = new Date(latestSession.started_at);
  const latestDateStr = latestDate.toISOString().split('T')[0];

  // Yesterday at midnight UTC
  const now = new Date();
  const yesterday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1));
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // Calculate offset in milliseconds
  const latestMidnight = new Date(Date.UTC(latestDate.getUTCFullYear(), latestDate.getUTCMonth(), latestDate.getUTCDate()));
  const offsetMs = latestMidnight.getTime() - yesterday.getTime();
  const offsetDays = Math.round(offsetMs / 86400000);

  console.log(`Latest seed date:  ${latestDateStr}`);
  console.log(`Target (yesterday): ${yesterdayStr}`);
  console.log(`Offset: ${offsetDays} days to shift backward\n`);

  if (offsetDays <= 0) {
    console.log('No future data — latest seed is already at or before yesterday. Done.');
    return;
  }

  // 2. Count what we're shifting
  const { count: totalSessions } = await supabase
    .from('sessions')
    .select('id', { count: 'exact', head: true })
    .eq('brewery_id', PP_BREWERY_ID);

  const { count: totalBeerLogs } = await supabase
    .from('beer_logs')
    .select('id', { count: 'exact', head: true })
    .eq('brewery_id', PP_BREWERY_ID);

  console.log(`Sessions to backdate: ${totalSessions ?? 0}`);
  console.log(`Beer logs to backdate: ${totalBeerLogs ?? 0}`);

  // Find earliest date to show the new range
  const { data: earliestSession } = await supabase
    .from('sessions')
    .select('started_at')
    .eq('brewery_id', PP_BREWERY_ID)
    .order('started_at', { ascending: true })
    .limit(1)
    .single();

  if (earliestSession) {
    const earliestDate = new Date(earliestSession.started_at);
    const newEarliest = new Date(earliestDate.getTime() - offsetMs);
    console.log(`\nDate range after backdate:`);
    console.log(`  ${newEarliest.toISOString().split('T')[0]}  →  ${yesterdayStr}`);
  }

  if (dryRun) {
    console.log('\n(DRY RUN — no data modified. Run without --dry-run to execute.)');
    return;
  }

  // 3. Backdate sessions in batches
  console.log('\nBackdating sessions...');
  let sessionOffset = 0;
  let sessionsUpdated = 0;

  while (true) {
    const { data: batch } = await supabase
      .from('sessions')
      .select('id, started_at, ended_at')
      .eq('brewery_id', PP_BREWERY_ID)
      .order('started_at', { ascending: true })
      .range(sessionOffset, sessionOffset + BATCH_SIZE - 1);

    if (!batch || batch.length === 0) break;

    for (const session of batch) {
      const newStarted = new Date(new Date(session.started_at).getTime() - offsetMs).toISOString();
      const newEnded = session.ended_at
        ? new Date(new Date(session.ended_at).getTime() - offsetMs).toISOString()
        : null;

      const { error } = await supabase
        .from('sessions')
        .update({ started_at: newStarted, ended_at: newEnded })
        .eq('id', session.id);

      if (error) {
        console.warn(`  Warning updating session ${session.id}:`, error.message);
      }
      sessionsUpdated++;
    }

    sessionOffset += batch.length;
    process.stdout.write(`  ${sessionsUpdated}/${totalSessions ?? '?'} sessions...\r`);

    if (batch.length < BATCH_SIZE) break;
  }
  console.log(`  ${sessionsUpdated} sessions backdated.`);

  // 4. Backdate beer_logs in batches
  console.log('Backdating beer_logs...');
  let logOffset = 0;
  let logsUpdated = 0;

  while (true) {
    const { data: batch } = await supabase
      .from('beer_logs')
      .select('id, logged_at')
      .eq('brewery_id', PP_BREWERY_ID)
      .order('logged_at', { ascending: true })
      .range(logOffset, logOffset + BATCH_SIZE - 1);

    if (!batch || batch.length === 0) break;

    for (const log of batch) {
      const newLogged = new Date(new Date(log.logged_at).getTime() - offsetMs).toISOString();

      const { error } = await supabase
        .from('beer_logs')
        .update({ logged_at: newLogged })
        .eq('id', log.id);

      if (error) {
        console.warn(`  Warning updating beer_log ${log.id}:`, error.message);
      }
      logsUpdated++;
    }

    logOffset += batch.length;
    process.stdout.write(`  ${logsUpdated}/${totalBeerLogs ?? '?'} beer_logs...\r`);

    if (batch.length < BATCH_SIZE) break;
  }
  console.log(`  ${logsUpdated} beer_logs backdated.`);

  // 5. Verify — no future data remaining
  const { count: remainingFuture } = await supabase
    .from('sessions')
    .select('id', { count: 'exact', head: true })
    .eq('brewery_id', PP_BREWERY_ID)
    .gte('started_at', new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString());

  const { data: newLatest } = await supabase
    .from('sessions')
    .select('started_at')
    .eq('brewery_id', PP_BREWERY_ID)
    .order('started_at', { ascending: false })
    .limit(1)
    .single();

  console.log(`\n── Verification ──`);
  console.log(`Future sessions remaining: ${remainingFuture ?? 0}`);
  console.log(`New latest session: ${newLatest?.started_at?.split('T')[0] ?? 'unknown'}`);
  console.log('Done. All Pint & Pixel data backdated. 🍺');
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
