#!/usr/bin/env node
/**
 * seed-today.mjs — refresh TODAY's activity on STAGING across every layer
 * (consumer app, brewery-admin, superadmin) ahead of a live demo.
 *
 * seed-demo-month.mjs / seed-legit-staging.mjs backfilled a rolling month+
 * of history, but "today" ages out fast — this closes yesterday's stranded
 * "live" sessions, seeds fresh activity for today's hours-so-far plus a
 * guaranteed live-now slice, and adds today-dated brewery-admin actions
 * (loyalty redemptions) and superadmin actions (new claims to review,
 * achievement unlocks) so every layer has something dated today.
 *
 * Safe to rerun same-day (adds more, doesn't duplicate/break anything).
 * Refuses to run against anything but staging.
 * Usage: node scripts/seed-today.mjs [--check]
 */

import { createClient } from '@supabase/supabase-js';

try {
  process.loadEnvFile('.env.local');
} catch {}

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

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const isCheck = process.argv.includes('--check');
const JOSHUA_ID = '90a1a802-8a79-4816-bf10-a900b91f2c5c';
const CO_OWNER_ID = '208a6214-44ea-465e-817a-4cdeffa33b39';

const BREWERIES = [
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', label: 'Pint & Pixel — Austin', scale: 1.0 },
  { id: 'dd078001-0000-4000-8000-000000000001', label: 'Pint & Pixel — Charlotte', scale: 0.6 },
  { id: 'dd000001-0000-0000-0000-000000000001', label: 'Mountain Ridge Brewing', scale: 0.5 },
  { id: 'dd000001-0000-0000-0000-000000000002', label: 'River Bend Ales', scale: 0.45 },
  { id: 'dd000001-0000-0000-0000-000000000003', label: 'Smoky Barrel Craft Co.', scale: 0.35 },
];

const SERVING_STYLES = ['pint', 'goblet', 'tulip', 'snifter', 'taster'];
const FLAVOR_TAG_POOL = ['hoppy','citrus','hazy','tropical','malty','caramel','smooth','fruity','spicy','complex','juicy','chocolate','espresso','creamy','dry','peppery','toffee','dark_fruit','warming','biscuit','earthy','balanced','crisp','floral','piney','bready','roasty','tart'];
const BEER_COMMENTS = ['Hits different every time.','Could have another.','Solid pour.','Love this one.','Going back for a second.','My go-to.','Perfect after work.','Crisp and clean.','Really nice mouthfeel.','Complex but crushable.','Exactly what I needed.','Top tier.','This is the way.','No notes.','Worth every sip.','Getting another round.','First time trying this — wow.','Bringing friends next time.','Great balance.','Honestly one of the best.'];
const BREWERY_REVIEW_COMMENTS = ['Best spot in town. Period.','The vibes are unmatched. Five stars.','Tap list is always on point.','Came back for the third time this month.','The staff here are incredible.','Always a great atmosphere.','Solid lineup, stellar service.','Every time I visit, I leave happy.','Clean taps, fresh beer, great energy.','Never disappoints.'];
const SESSION_COMMENTS = ['Great picks! That one is next on my list','Jealous! Save me a seat next time','How was it?','We need to do a session together soon!','You always find the best pours','Cheers! 🍻','Love seeing your check-ins!','Heading there this weekend actually'];

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
function dayBaseUTC(date) { return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())); }
function ts(dayBase, hour, minute = 0) { const d = new Date(dayBase.getTime()); d.setUTCHours(hour, minute, 0, 0); return d; }

async function insertBatched(table, rows, batch, opts) {
  for (let i = 0; i < rows.length; i += batch) {
    const chunk = rows.slice(i, i + batch);
    const q = opts?.onConflict ? supabase.from(table).upsert(chunk, opts) : supabase.from(table).insert(chunk);
    const { error } = await q;
    if (error) {
      if (opts?.onConflict) {
        const { error: e2 } = await supabase.from(table).insert(chunk);
        if (e2) console.warn(`  warn inserting ${table}:`, e2.message);
      } else {
        console.warn(`  warn inserting ${table}:`, error.message);
      }
    }
  }
}

async function main() {
  console.log('HopTrack — seed-today.mjs');
  console.log(`target: staging (${STAGING_PROJECT_REF}) | mode: ${isCheck ? 'CHECK' : 'EXECUTE'}\n`);

  const now = new Date();
  const today0 = dayBaseUTC(now);
  const currentHour = now.getUTCHours();
  const currentMinute = now.getUTCMinutes();

  const { data: profiles } = await supabase.from('profiles').select('id');
  const ALL_PARTICIPANTS = profiles.map((p) => p.id);
  console.log(`Participant pool: ${ALL_PARTICIPANTS.length} users\n`);

  // ── 1. Close out yesterday's stranded "live" sessions ──────────────────
  console.log('=== Closing stranded live sessions from before today ===');
  const { data: stale } = await supabase
    .from('sessions')
    .select('id, started_at')
    .eq('is_active', true)
    .lt('started_at', iso(today0));
  console.log(`  found ${stale?.length ?? 0} stale active sessions`);
  if (!isCheck && stale?.length) {
    for (const s of stale) {
      const start = new Date(s.started_at);
      const end = new Date(start.getTime() + randInt(45, 150) * 60000);
      await supabase.from('sessions').update({ is_active: false, ended_at: iso(end) }).eq('id', s.id);
    }
    console.log(`  closed ${stale.length} sessions`);
  }

  // ── 2 & 3. Today's activity + guaranteed live-now slice per brewery ────
  console.log("\n=== Today's activity + live-now ===");
  let grand = { sessions: 0, logs: 0, ratings: 0, reviews: 0, reactions: 0, comments: 0, live: 0 };

  for (const brewery of BREWERIES) {
    const { data: beers } = await supabase.from('beers').select('id, name').eq('brewery_id', brewery.id);
    if (!beers || beers.length === 0) { console.log(`  ${brewery.label}: no beers, skipping`); continue; }
    const beerMeta = {};
    for (const b of beers) beerMeta[b.id] = { flavors: sample(FLAVOR_TAG_POOL, randInt(2, 4)), styles: sample(SERVING_STYLES, randInt(1, 2)) };
    const beerIds = beers.map((b) => b.id);

    const sessionRows = [], beerLogRows = [], beerReviewRows = [], breweryReviewRows = [], reactionRows = [], commentRows = [];
    const breweryReviewedUsers = new Set();
    const beerReviewedPairs = new Set();
    let liveCount = 0;

    // Today so far (hour 0 .. currentHour)
    const dow = today0.getUTCDay();
    const model = TRAFFIC[dow];
    const visitorCount = Math.max(2, Math.round(randInt(model.min, model.max) * brewery.scale * (Math.max(currentHour, 1) / 24)));

    for (let i = 0; i < visitorCount; i++) {
      const userId = randChoice(ALL_PARTICIPANTS);
      const hour = randInt(0, Math.max(0, currentHour - 1));
      const minute = randInt(0, 59);
      const duration = randInt(45, 150);
      const startTime = ts(today0, hour, minute);
      const endTime = new Date(startTime.getTime() + duration * 60000);
      const sessionId = crypto.randomUUID();

      sessionRows.push({
        id: sessionId, user_id: userId, brewery_id: brewery.id, context: 'brewery',
        started_at: iso(startTime), ended_at: iso(endTime), is_active: false,
        share_to_feed: rng() > 0.1, xp_awarded: randInt(15, 60), note: null,
      });

      const sessionBeers = sample(beerIds, randInt(1, 4));
      let logTime = new Date(startTime.getTime() + randInt(5, 20) * 60000);
      for (const beerId of sessionBeers) {
        const beerLogId = crypto.randomUUID();
        const meta = beerMeta[beerId];
        const rating = rng() > 0.3 ? randFloat(3.0, 5.0, 1) : null;
        beerLogRows.push({
          id: beerLogId, session_id: sessionId, user_id: userId, beer_id: beerId, brewery_id: brewery.id,
          quantity: 1, rating, flavor_tags: meta.flavors, serving_style: randChoice(meta.styles),
          comment: rng() > 0.5 ? randChoice(BEER_COMMENTS) : null, photo_url: null, logged_at: iso(logTime),
        });
        logTime = new Date(logTime.getTime() + randInt(30, 60) * 60000);

        if (rng() < model.reviewRate) {
          const key = `${userId}:${beerId}`;
          if (!beerReviewedPairs.has(key)) {
            beerReviewedPairs.add(key);
            beerReviewRows.push({ user_id: userId, beer_id: beerId, rating: randFloat(3.5, 5.0, 1), comment: randChoice(BEER_COMMENTS) });
          }
        }
        if (rng() < 0.20) {
          const pool = ALL_PARTICIPANTS.filter((id) => id !== userId);
          reactionRows.push({ id: crypto.randomUUID(), user_id: randChoice(pool), session_id: sessionId, beer_log_id: beerLogId, type: randChoice(['thumbs_up', 'flame', 'beer']) });
        }
      }
      if (rng() < 0.15) {
        const pool = ALL_PARTICIPANTS.filter((id) => id !== userId);
        commentRows.push({ id: crypto.randomUUID(), user_id: randChoice(pool), session_id: sessionId, body: randChoice(SESSION_COMMENTS), created_at: iso(new Date(endTime.getTime() + randInt(5, 60) * 60000)) });
      }
      if (rng() < model.breweryReviewRate && !breweryReviewedUsers.has(userId)) {
        breweryReviewedUsers.add(userId);
        breweryReviewRows.push({ user_id: userId, brewery_id: brewery.id, rating: randFloat(4.0, 5.0, 1), comment: randChoice(BREWERY_REVIEW_COMMENTS) });
      }
    }

    // Guaranteed live-now slice, independent of local time-of-day
    const liveVisitorCount = Math.max(2, Math.round(randInt(4, 10) * brewery.scale));
    for (let i = 0; i < liveVisitorCount; i++) {
      const userId = randChoice(ALL_PARTICIPANTS);
      const minutesAgo = randInt(3, 90);
      const startTime = new Date(now.getTime() - minutesAgo * 60000);
      const stillActive = rng() < 0.65;
      const duration = randInt(20, 90);
      const endTime = new Date(startTime.getTime() + duration * 60000);
      const sessionId = crypto.randomUUID();

      sessionRows.push({
        id: sessionId, user_id: userId, brewery_id: brewery.id, context: 'brewery',
        started_at: iso(startTime), ended_at: stillActive ? null : iso(new Date(Math.min(endTime.getTime(), now.getTime()))),
        is_active: stillActive, share_to_feed: rng() > 0.1, xp_awarded: randInt(15, 60), note: null,
      });
      if (stillActive) liveCount++;

      let logTime = new Date(startTime.getTime() + randInt(2, 15) * 60000);
      for (const beerId of sample(beerIds, randInt(1, 3))) {
        if (logTime.getTime() > now.getTime()) break;
        const beerLogId = crypto.randomUUID();
        const meta = beerMeta[beerId];
        beerLogRows.push({
          id: beerLogId, session_id: sessionId, user_id: userId, beer_id: beerId, brewery_id: brewery.id,
          quantity: 1, rating: rng() > 0.3 ? randFloat(3.0, 5.0, 1) : null, flavor_tags: meta.flavors,
          serving_style: randChoice(meta.styles), comment: rng() > 0.5 ? randChoice(BEER_COMMENTS) : null,
          photo_url: null, logged_at: iso(logTime),
        });
        logTime = new Date(logTime.getTime() + randInt(10, 25) * 60000);
      }
    }

    console.log(`  ${brewery.label}: sessions ${sessionRows.length} (${liveCount} live now) | logs ${beerLogRows.length} | ratings ${beerReviewRows.length} | reviews ${breweryReviewRows.length} | reactions ${reactionRows.length} | comments ${commentRows.length}`);

    if (!isCheck) {
      await insertBatched('sessions', sessionRows, 50);
      await insertBatched('beer_logs', beerLogRows, 100);
      await insertBatched('beer_reviews', beerReviewRows, 50, { onConflict: 'user_id,beer_id', ignoreDuplicates: true });
      await insertBatched('brewery_reviews', breweryReviewRows, 50, { onConflict: 'user_id,brewery_id', ignoreDuplicates: true });
      await insertBatched('reactions', reactionRows, 100);
      await insertBatched('session_comments', commentRows, 50);
    }
    for (const [k, v] of Object.entries({ sessions: sessionRows.length, logs: beerLogRows.length, ratings: beerReviewRows.length, reviews: breweryReviewRows.length, reactions: reactionRows.length, comments: commentRows.length, live: liveCount })) grand[k] += v;
  }
  console.log(`  TOTAL: ${JSON.stringify(grand)}`);

  // ── 4. Superadmin — fresh claims dated today (queue to review live) ────
  console.log('\n=== Superadmin: fresh brewery claims dated today ===');
  const excludeIds = BREWERIES.map((b) => b.id);
  const { data: candidateBreweries } = await supabase.from('breweries').select('id, name').not('id', 'in', `(${excludeIds.join(',')})`).limit(3000);
  const { data: existingClaims } = await supabase.from('brewery_claims').select('brewery_id');
  const alreadyClaimed = new Set((existingClaims ?? []).map((c) => c.brewery_id));
  const freshTargets = sample((candidateBreweries ?? []).filter((b) => !alreadyClaimed.has(b.id)), 5);
  const claimants = ALL_PARTICIPANTS.filter((id) => id !== JOSHUA_ID && id !== CO_OWNER_ID);

  const claimRows = freshTargets.map((b, i) => {
    const minutesAgo = randInt(15, 480); // within today
    const createdAt = new Date(now.getTime() - minutesAgo * 60000);
    // Leave most pending so there's a live queue to demo approving
    const status = i < 3 ? 'pending' : 'approved';
    const reviewed = status !== 'pending';
    return {
      user_id: randChoice(claimants), brewery_id: b.id, status,
      business_email: null,
      notes: null,
      reviewed_by: reviewed ? JOSHUA_ID : null,
      reviewed_at: reviewed ? iso(new Date(createdAt.getTime() + randInt(10, 90) * 60000)) : null,
      created_at: iso(createdAt),
    };
  });
  console.log(`  +${claimRows.length} claims (${claimRows.filter(c=>c.status==='pending').length} pending, ${claimRows.filter(c=>c.status==='approved').length} approved) dated today`);
  if (!isCheck && claimRows.length) await insertBatched('brewery_claims', claimRows, 50);

  // ── 5. Superadmin recent-activity: achievement unlocks dated today ─────
  console.log('\n=== Achievement unlocks dated today ===');
  const { data: achievements } = await supabase.from('achievements').select('id, name');
  const { data: existingUA } = await supabase.from('user_achievements').select('user_id, achievement_id');
  const haveSet = new Set((existingUA ?? []).map((u) => `${u.user_id}:${u.achievement_id}`));
  const uaRows = [];
  for (let i = 0; i < 6; i++) {
    const userId = randChoice(ALL_PARTICIPANTS);
    const achievement = randChoice(achievements);
    const key = `${userId}:${achievement.id}`;
    if (haveSet.has(key)) continue;
    haveSet.add(key);
    uaRows.push({ user_id: userId, achievement_id: achievement.id, earned_at: iso(new Date(now.getTime() - randInt(5, 300) * 60000)) });
  }
  console.log(`  +${uaRows.length} achievement unlocks dated today`);
  if (!isCheck && uaRows.length) await insertBatched('user_achievements', uaRows, 20);

  // ── 6. Brewery-admin action: loyalty redemptions confirmed today ───────
  console.log('\n=== Brewery-admin: loyalty redemptions confirmed today ===');
  for (const brewery of BREWERIES) {
    const { data: program } = await supabase.from('loyalty_programs').select('id, stamps_required').eq('brewery_id', brewery.id).eq('is_active', true).maybeSingle();
    if (!program) continue;
    const { data: eligible } = await supabase.from('loyalty_cards').select('id, user_id, stamps').eq('brewery_id', brewery.id).eq('program_id', program.id).gte('stamps', program.stamps_required).limit(3);
    if (!eligible?.length) continue;
    const redemptionRows = eligible.map((card) => ({
      card_id: card.id, user_id: card.user_id, brewery_id: brewery.id, program_id: program.id,
      redeemed_at: iso(new Date(now.getTime() - randInt(5, 400) * 60000)),
    }));
    console.log(`  ${brewery.label}: +${redemptionRows.length} redemptions today`);
    if (!isCheck) {
      await insertBatched('loyalty_redemptions', redemptionRows, 20);
      for (const card of eligible) {
        await supabase.from('loyalty_cards').update({ stamps: 0, last_stamp_at: iso(now) }).eq('id', card.id);
      }
    }
  }

  console.log('\n────────────────────────────────────────────────────────');
  console.log(isCheck ? 'CHECK mode — nothing written.' : "Done. Today's activity is live across consumer, brewery-admin, and superadmin.");
  console.log('────────────────────────────────────────────────────────');
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
