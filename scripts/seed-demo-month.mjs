#!/usr/bin/env node
/**
 * seed-demo-month.mjs — populate a trailing 30-day activity history (plus a
 * handful of "live right now" sessions) across all of Joshua's demo
 * breweries on STAGING, for the private Vercel preview demo.
 *
 * Generalizes scripts/seed-next-day.mjs (which only simulates Pint & Pixel
 * Austin, one day at a time) to run across every brewery Joshua owns on
 * staging, backfilling a full month in one pass and leaving a slice of
 * today's visitors checked in (is_active: true) so "Drinking Now" /
 * presence features have something to show.
 *
 * Refuses to run unless STAGING_SUPABASE_URL / STAGING_SUPABASE_SERVICE_ROLE_KEY
 * are set and the URL contains the known staging project ref — this must
 * never be pointed at prod.
 *
 * Usage: node scripts/seed-demo-month.mjs [--days=30] [--check]
 */

import { createClient } from '@supabase/supabase-js';

try {
  process.loadEnvFile('.env.local');
} catch {
  // env may already be set
}

const STAGING_PROJECT_REF = 'qhznhxyhwqmqfdaqebla';
const PROD_PROJECT_REF = 'uadjtanoyvalnmlbnzxk';

const SUPABASE_URL = process.env.STAGING_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.STAGING_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing STAGING_SUPABASE_URL or STAGING_SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}
if (SUPABASE_URL.includes(PROD_PROJECT_REF)) {
  console.error(`REFUSING — STAGING_SUPABASE_URL contains prod project ref ${PROD_PROJECT_REF}.`);
  process.exit(1);
}
if (!SUPABASE_URL.includes(STAGING_PROJECT_REF)) {
  console.error(`REFUSING — STAGING_SUPABASE_URL does not contain staging ref ${STAGING_PROJECT_REF}.`);
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const isCheck = process.argv.includes('--check');
const daysArg = process.argv.find((a) => a.startsWith('--days='));
const DAYS_BACK = daysArg ? parseInt(daysArg.split('=')[1], 10) : 30;

// ─── Demo breweries (all owned by Joshua on staging) ───────────────────────
const BREWERIES = [
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', label: 'Pint & Pixel — Austin', scale: 1.0 },
  { id: 'dd078001-0000-4000-8000-000000000001', label: 'Pint & Pixel — Charlotte', scale: 0.6 },
  { id: 'dd000001-0000-0000-0000-000000000001', label: 'Mountain Ridge Brewing', scale: 0.5 },
  { id: 'dd000001-0000-0000-0000-000000000002', label: 'River Bend Ales', scale: 0.45 },
  { id: 'dd000001-0000-0000-0000-000000000003', label: 'Smoky Barrel Craft Co.', scale: 0.35 },
];

const SERVING_STYLES = ['pint', 'goblet', 'tulip', 'snifter', 'taster'];
const FLAVOR_TAG_POOL = [
  'hoppy', 'citrus', 'hazy', 'tropical', 'malty', 'caramel', 'smooth',
  'fruity', 'spicy', 'complex', 'juicy', 'chocolate', 'espresso', 'creamy',
  'dry', 'peppery', 'toffee', 'dark_fruit', 'warming', 'biscuit', 'earthy',
  'balanced', 'crisp', 'floral', 'piney', 'bready', 'roasty', 'tart',
];

const BEER_COMMENTS = [
  'Hits different every time.', 'Could have another.', 'Solid pour.',
  'Love this one.', 'Going back for a second.', 'My go-to.',
  'Perfect after work.', 'Crisp and clean.', 'Really nice mouthfeel.',
  'Complex but crushable.', 'Exactly what I needed.', 'Top tier.',
  'This is the way.', 'No notes.', 'Worth every sip.',
  'Getting another round.', 'Dangerous. Could have three.',
  'First time trying this — wow.', 'As good as I remembered.',
  'Bringing friends next time.', 'Great balance.',
  'Sessionable but satisfying.', 'Honestly one of the best.',
  'Bold choice. No regrets.', 'Nightcap material.', 'Starting the night right.',
];

const BREWERY_REVIEW_COMMENTS = [
  'Best spot in town. Period.', 'The vibes are unmatched. Five stars.',
  'Tap list is always on point.', 'Came back for the third time this month.',
  'The staff here are incredible.', 'No competition around here.',
  'Always a great atmosphere.', 'Solid lineup, stellar service.',
  'Could live here. Seriously.', 'Every time I visit, I leave happy.',
  'Best date night spot around.', 'Clean taps, fresh beer, great energy.',
  'World-class craft beer.', 'Never disappoints.',
];

const SESSION_COMMENTS = [
  'Great picks! That one is next on my list', 'Jealous! Save me a seat next time',
  'How was it?', 'We need to do a session together soon!',
  'That brewery is amazing, glad you went!', 'You always find the best pours',
  'Try the next one — trust me', 'Been meaning to check this place out',
  'Cheers! 🍻', 'Love seeing your check-ins!', 'Heading there this weekend actually',
];

// Day-of-week traffic model (0=Sun..6=Sat) — base rates, scaled per brewery
const TRAFFIC = {
  0: { min: 45, max: 70, reviewRate: 0.06, breweryReviewRate: 0.05, peakStart: 13, peakEnd: 18 },
  1: { min: 20, max: 35, reviewRate: 0.04, breweryReviewRate: 0.02, peakStart: 17, peakEnd: 20 },
  2: { min: 25, max: 40, reviewRate: 0.05, breweryReviewRate: 0.03, peakStart: 17, peakEnd: 20 },
  3: { min: 35, max: 55, reviewRate: 0.06, breweryReviewRate: 0.04, peakStart: 17, peakEnd: 21 },
  4: { min: 50, max: 75, reviewRate: 0.08, breweryReviewRate: 0.06, peakStart: 17, peakEnd: 22 },
  5: { min: 90, max: 130, reviewRate: 0.15, breweryReviewRate: 0.08, peakStart: 19, peakEnd: 23 },
  6: { min: 100, max: 140, reviewRate: 0.18, breweryReviewRate: 0.10, peakStart: 14, peakEnd: 22 },
};

function rng() { return Math.random(); }
function randInt(min, max) { return Math.floor(rng() * (max - min + 1)) + min; }
function randChoice(arr) { return arr[Math.floor(rng() * arr.length)]; }
function randFloat(min, max, decimals = 1) { return parseFloat((rng() * (max - min) + min).toFixed(decimals)); }
function sample(arr, n) { return [...arr].sort(() => rng() - 0.5).slice(0, Math.min(n, arr.length)); }
function iso(d) { return d.toISOString(); }

function dayBaseUTC(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}
function ts(dayBase, hour, minute = 0) {
  const d = new Date(dayBase.getTime());
  d.setUTCHours(hour, minute, 0, 0);
  return d;
}

async function main() {
  console.log('HopTrack — seed-demo-month.mjs');
  console.log(`target: staging (${STAGING_PROJECT_REF}) | days back: ${DAYS_BACK} | mode: ${isCheck ? 'CHECK' : 'EXECUTE'}\n`);

  // 1. Participant pool — every profile on staging
  const { data: profiles, error: profErr } = await supabase.from('profiles').select('id, username');
  if (profErr) { console.error('Error loading profiles:', profErr.message); process.exit(1); }
  const ALL_PARTICIPANTS = profiles.map((p) => p.id);
  console.log(`Participant pool: ${ALL_PARTICIPANTS.length} users`);

  const now = new Date();
  const today0 = dayBaseUTC(now);
  const currentHour = now.getUTCHours();
  const currentMinute = now.getUTCMinutes();

  let grand = { sessions: 0, logs: 0, ratings: 0, reviews: 0, breweryReviews: 0, reactions: 0, comments: 0, live: 0 };

  for (const brewery of BREWERIES) {
    console.log(`\n=== ${brewery.label} ===`);

    const { data: beers, error: beerErr } = await supabase
      .from('beers')
      .select('id, name')
      .eq('brewery_id', brewery.id);
    if (beerErr || !beers || beers.length === 0) {
      console.warn(`  skipped — no beers found (${beerErr?.message ?? 'empty tap list'})`);
      continue;
    }

    // Stable-ish per-beer flavor/serving assignment
    const beerMeta = {};
    for (const b of beers) {
      beerMeta[b.id] = {
        flavors: sample(FLAVOR_TAG_POOL, randInt(2, 4)),
        styles: sample(SERVING_STYLES, randInt(1, 2)),
      };
    }
    const beerIds = beers.map((b) => b.id);

    const sessionRows = [];
    const beerLogRows = [];
    const beerReviewRows = [];
    const breweryReviewRows = [];
    const reactionRows = [];
    const commentRows = [];
    const breweryReviewedUsers = new Set();
    const beerReviewedPairs = new Set();
    let liveCount = 0;

    for (let back = DAYS_BACK - 1; back >= 0; back--) {
      const dayBase = new Date(today0.getTime() - back * 86400000);
      const isToday = back === 0;
      const dow = dayBase.getUTCDay();
      const model = TRAFFIC[dow];

      const visitorCount = Math.max(3, Math.round(randInt(model.min, model.max) * brewery.scale));
      const slots = [];
      for (let i = 0; i < visitorCount; i++) {
        const userId = randChoice(ALL_PARTICIPANTS);
        const r = rng();
        let hour;
        if (r < 0.15) hour = randInt(11, 15);
        else if (r < 0.55) hour = randInt(model.peakStart, model.peakEnd);
        else hour = randInt(16, 24);

        // Today: only seed visitors up through the current hour
        if (isToday && hour > currentHour) continue;

        const minute = isToday && hour === currentHour
          ? randInt(0, Math.max(0, currentMinute - 1))
          : randInt(0, 59);
        const duration = randInt(60, 180);
        slots.push({ userId, arrivalHour: hour, arrivalMinute: minute, durationMinutes: duration });
      }

      for (const slot of slots) {
        const sessionId = crypto.randomUUID();
        const startTime = ts(dayBase, slot.arrivalHour, slot.arrivalMinute);
        const endTime = new Date(startTime.getTime() + slot.durationMinutes * 60000);

        // Live slice: for today's most recent arrivals (within the last 2h), leave ~30% checked in
        const minutesAgo = (now.getTime() - startTime.getTime()) / 60000;
        const makeLive = isToday && minutesAgo <= 120 && rng() < 0.30;

        sessionRows.push({
          id: sessionId,
          user_id: slot.userId,
          brewery_id: brewery.id,
          context: 'brewery',
          started_at: iso(startTime),
          ended_at: makeLive ? null : iso(endTime),
          is_active: makeLive,
          share_to_feed: rng() > 0.1,
          xp_awarded: randInt(15, 60),
          note: null,
        });
        if (makeLive) liveCount++;

        const logsCount = randInt(1, 4);
        const sessionBeers = sample(beerIds, logsCount);
        let logTime = new Date(startTime.getTime() + randInt(5, 20) * 60000);

        for (const beerId of sessionBeers) {
          const beerLogId = crypto.randomUUID();
          const meta = beerMeta[beerId];
          const rating = rng() > 0.3 ? randFloat(3.0, 5.0, 1) : null;
          const hasComment = rng() > 0.5;

          beerLogRows.push({
            id: beerLogId,
            session_id: sessionId,
            user_id: slot.userId,
            beer_id: beerId,
            brewery_id: brewery.id,
            quantity: 1,
            rating,
            flavor_tags: meta.flavors,
            serving_style: randChoice(meta.styles),
            comment: hasComment ? randChoice(BEER_COMMENTS) : null,
            photo_url: null,
            logged_at: iso(logTime),
          });
          logTime = new Date(logTime.getTime() + randInt(30, 60) * 60000);

          if (rng() < model.reviewRate) {
            const key = `${slot.userId}:${beerId}`;
            if (!beerReviewedPairs.has(key)) {
              beerReviewedPairs.add(key);
              beerReviewRows.push({
                user_id: slot.userId,
                beer_id: beerId,
                rating: randFloat(3.5, 5.0, 1),
                comment: randChoice(BEER_COMMENTS),
              });
            }
          }

          if (rng() < 0.20) {
            const pool = ALL_PARTICIPANTS.filter((id) => id !== slot.userId);
            if (pool.length > 0) {
              reactionRows.push({
                id: crypto.randomUUID(),
                user_id: randChoice(pool),
                session_id: sessionId,
                beer_log_id: beerLogId,
                type: randChoice(['thumbs_up', 'flame', 'beer']),
              });
            }
          }
        }

        if (rng() < 0.15) {
          const pool = ALL_PARTICIPANTS.filter((id) => id !== slot.userId);
          if (pool.length > 0) {
            commentRows.push({
              id: crypto.randomUUID(),
              user_id: randChoice(pool),
              session_id: sessionId,
              body: randChoice(SESSION_COMMENTS),
              created_at: iso(new Date((makeLive ? startTime : endTime).getTime() + randInt(5, 120) * 60000)),
            });
          }
        }

        if (rng() < model.breweryReviewRate && !breweryReviewedUsers.has(slot.userId)) {
          breweryReviewedUsers.add(slot.userId);
          breweryReviewRows.push({
            user_id: slot.userId,
            brewery_id: brewery.id,
            rating: randFloat(4.0, 5.0, 1),
            comment: randChoice(BREWERY_REVIEW_COMMENTS),
          });
        }
      }
    }

    // Dedicated "live right now" slice — independent of the day's peak-hour
    // schedule, so the demo has checked-in drinkers no matter what time of
    // day (or brewery-local time) it's opened.
    const liveVisitorCount = Math.max(2, Math.round(randInt(4, 10) * brewery.scale));
    for (let i = 0; i < liveVisitorCount; i++) {
      const userId = randChoice(ALL_PARTICIPANTS);
      const minutesAgo = randInt(3, 90);
      const startTime = new Date(now.getTime() - minutesAgo * 60000);
      const stillActive = rng() < 0.65; // rest "just left" a few minutes ago
      const duration = randInt(20, 90);
      const endTime = new Date(startTime.getTime() + duration * 60000);
      const sessionId = crypto.randomUUID();

      sessionRows.push({
        id: sessionId,
        user_id: userId,
        brewery_id: brewery.id,
        context: 'brewery',
        started_at: iso(startTime),
        ended_at: stillActive ? null : iso(new Date(Math.min(endTime.getTime(), now.getTime()))),
        is_active: stillActive,
        share_to_feed: rng() > 0.1,
        xp_awarded: randInt(15, 60),
        note: null,
      });
      if (stillActive) liveCount++;

      const logsCount = randInt(1, 3);
      const sessionBeers = sample(beerIds, logsCount);
      let logTime = new Date(startTime.getTime() + randInt(2, 15) * 60000);
      for (const beerId of sessionBeers) {
        if (logTime.getTime() > now.getTime()) break;
        const beerLogId = crypto.randomUUID();
        const meta = beerMeta[beerId];
        const rating = rng() > 0.3 ? randFloat(3.0, 5.0, 1) : null;
        const hasComment = rng() > 0.5;
        beerLogRows.push({
          id: beerLogId,
          session_id: sessionId,
          user_id: userId,
          beer_id: beerId,
          brewery_id: brewery.id,
          quantity: 1,
          rating,
          flavor_tags: meta.flavors,
          serving_style: randChoice(meta.styles),
          comment: hasComment ? randChoice(BEER_COMMENTS) : null,
          photo_url: null,
          logged_at: iso(logTime),
        });
        logTime = new Date(logTime.getTime() + randInt(10, 25) * 60000);

        if (rng() < 0.20) {
          const pool = ALL_PARTICIPANTS.filter((id) => id !== userId);
          if (pool.length > 0) {
            reactionRows.push({
              id: crypto.randomUUID(),
              user_id: randChoice(pool),
              session_id: sessionId,
              beer_log_id: beerLogId,
              type: randChoice(['thumbs_up', 'flame', 'beer']),
            });
          }
        }
      }
    }

    console.log(`  days: ${DAYS_BACK} | sessions: ${sessionRows.length} (${liveCount} live now) | logs: ${beerLogRows.length} | ratings: ${beerReviewRows.length} | reviews: ${breweryReviewRows.length} | reactions: ${reactionRows.length} | comments: ${commentRows.length}`);

    if (isCheck) continue;

    const insertBatched = async (table, rows, batch, opts) => {
      for (let i = 0; i < rows.length; i += batch) {
        const chunk = rows.slice(i, i + batch);
        const q = opts?.onConflict
          ? supabase.from(table).upsert(chunk, opts)
          : supabase.from(table).insert(chunk);
        const { error } = await q;
        if (error) {
          if (opts?.onConflict) {
            const { error: e2 } = await supabase.from(table).insert(chunk);
            if (e2) console.warn(`  warn inserting ${table}:`, e2.message);
          } else if (opts?.soft) {
            console.warn(`  warn inserting ${table}:`, error.message);
          } else {
            console.error(`  error inserting ${table}:`, error.message);
            process.exit(1);
          }
        }
      }
    };

    await insertBatched('sessions', sessionRows, 50);
    await insertBatched('beer_logs', beerLogRows, 100);
    await insertBatched('beer_reviews', beerReviewRows, 50, { onConflict: 'user_id,beer_id', ignoreDuplicates: true });
    await insertBatched('brewery_reviews', breweryReviewRows, 50, { onConflict: 'user_id,brewery_id', ignoreDuplicates: true });
    await insertBatched('reactions', reactionRows, 100, { soft: true });
    await insertBatched('session_comments', commentRows, 50, { soft: true });

    grand.sessions += sessionRows.length;
    grand.logs += beerLogRows.length;
    grand.ratings += beerReviewRows.length;
    grand.reviews += breweryReviewRows.length;
    grand.reactions += reactionRows.length;
    grand.comments += commentRows.length;
    grand.live += liveCount;
  }

  console.log('\n────────────────────────────────────────────────────────');
  console.log(`TOTAL — sessions: ${grand.sessions} (${grand.live} live now) | logs: ${grand.logs} | ratings: ${grand.ratings} | reviews: ${grand.reviews} | reactions: ${grand.reactions} | comments: ${grand.comments}`);
  console.log(isCheck ? 'CHECK mode — nothing written.' : 'Done. Beers poured across every demo brewery.');
  console.log('────────────────────────────────────────────────────────');
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
