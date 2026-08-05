#!/usr/bin/env node
/**
 * seed-legit-staging.mjs — round out the demo data on STAGING so the
 * brewery-admin dashboards and superadmin panels show meaningful numbers,
 * not zeros/nulls.
 *
 * seed-demo-month.mjs already covers the trailing 30 days of sessions/logs/
 * reviews/reactions/comments for the 5 demo breweries. KPI trend/WoW math
 * (lib/kpi.ts) compares that window against the PRIOR 30 days, which was
 * empty — so this script:
 *
 *   1. Backfills days -60..-31 (the prior month) for all 5 breweries, so
 *      trend comparisons have something to compare against.
 *   2. Adds loyalty programs to the 4 breweries that don't have one yet.
 *   3. Enrolls loyalty cards + records redemptions across the last 60 days.
 *   4. Grows brewery_follows across the last 60 days (follower growth KPI).
 *   5. Seeds brewery_claims against ~60 other real (unclaimed) breweries in
 *      the directory, spread over 45 days with a realistic status mix — this
 *      is the "breweries signing up" story for the superadmin claims queue
 *      and growth chart.
 *   6. Spreads existing test profiles' created_at over the last 45 days
 *      (skewed toward recent) so the superadmin "new users" growth chart
 *      shows an accelerating signup curve instead of one flat spike from
 *      whenever the seed migrations originally ran. Joshua's own account is
 *      left untouched.
 *
 * Refuses to run against anything but staging.
 * Usage: node scripts/seed-legit-staging.mjs [--check]
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

const NEW_LOYALTY_PROGRAMS = {
  'dd078001-0000-4000-8000-000000000001': { name: 'Charlotte Punch Card', stamps_required: 8, reward_description: 'A free pint on us.' },
  'dd000001-0000-0000-0000-000000000001': { name: 'Summit Club', stamps_required: 10, reward_description: 'Free pint of your choice.' },
  'dd000001-0000-0000-0000-000000000002': { name: 'River Regulars', stamps_required: 8, reward_description: 'A free pour, on the house.' },
  'dd000001-0000-0000-0000-000000000003': { name: 'Smoke Ring Rewards', stamps_required: 6, reward_description: 'Free flight of your choice.' },
};

const SERVING_STYLES = ['pint', 'goblet', 'tulip', 'snifter', 'taster'];
const FLAVOR_TAG_POOL = ['hoppy','citrus','hazy','tropical','malty','caramel','smooth','fruity','spicy','complex','juicy','chocolate','espresso','creamy','dry','peppery','toffee','dark_fruit','warming','biscuit','earthy','balanced','crisp','floral','piney','bready','roasty','tart'];
const BEER_COMMENTS = ['Hits different every time.','Could have another.','Solid pour.','Love this one.','Going back for a second.','My go-to.','Perfect after work.','Crisp and clean.','Really nice mouthfeel.','Complex but crushable.','Exactly what I needed.','Top tier.','This is the way.','No notes.','Worth every sip.','Getting another round.','Dangerous. Could have three.','First time trying this — wow.','As good as I remembered.','Bringing friends next time.','Great balance.','Sessionable but satisfying.','Honestly one of the best.','Bold choice. No regrets.','Nightcap material.','Starting the night right.'];
const BREWERY_REVIEW_COMMENTS = ['Best spot in town. Period.','The vibes are unmatched. Five stars.','Tap list is always on point.','Came back for the third time this month.','The staff here are incredible.','No competition around here.','Always a great atmosphere.','Solid lineup, stellar service.','Could live here. Seriously.','Every time I visit, I leave happy.','Best date night spot around.','Clean taps, fresh beer, great energy.','World-class craft beer.','Never disappoints.'];
const SESSION_COMMENTS = ['Great picks! That one is next on my list','Jealous! Save me a seat next time','How was it?','We need to do a session together soon!','That brewery is amazing, glad you went!','You always find the best pours','Try the next one — trust me','Been meaning to check this place out','Cheers! 🍻','Love seeing your check-ins!','Heading there this weekend actually'];

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

async function seedPriorMonth(brewery, allParticipants, today0) {
  const { data: beers } = await supabase.from('beers').select('id, name').eq('brewery_id', brewery.id);
  if (!beers || beers.length === 0) return { sessions: 0, logs: 0, ratings: 0, reviews: 0, reactions: 0, comments: 0 };

  const beerMeta = {};
  for (const b of beers) beerMeta[b.id] = { flavors: sample(FLAVOR_TAG_POOL, randInt(2, 4)), styles: sample(SERVING_STYLES, randInt(1, 2)) };
  const beerIds = beers.map((b) => b.id);

  const sessionRows = [], beerLogRows = [], beerReviewRows = [], breweryReviewRows = [], reactionRows = [], commentRows = [];
  const breweryReviewedUsers = new Set();
  const beerReviewedPairs = new Set();

  for (let back = 60; back >= 31; back--) {
    const dayBase = new Date(today0.getTime() - back * 86400000);
    const dow = dayBase.getUTCDay();
    const model = TRAFFIC[dow];
    const visitorCount = Math.max(3, Math.round(randInt(model.min, model.max) * brewery.scale));

    for (let i = 0; i < visitorCount; i++) {
      const userId = randChoice(allParticipants);
      const r = rng();
      let hour;
      if (r < 0.15) hour = randInt(11, 15);
      else if (r < 0.55) hour = randInt(model.peakStart, model.peakEnd);
      else hour = randInt(16, 24);
      const minute = randInt(0, 59);
      const duration = randInt(60, 180);
      const startTime = ts(dayBase, hour, minute);
      const endTime = new Date(startTime.getTime() + duration * 60000);
      const sessionId = crypto.randomUUID();

      sessionRows.push({
        id: sessionId, user_id: userId, brewery_id: brewery.id, context: 'brewery',
        started_at: iso(startTime), ended_at: iso(endTime), is_active: false,
        share_to_feed: rng() > 0.1, xp_awarded: randInt(15, 60), note: null,
      });

      const logsCount = randInt(1, 4);
      const sessionBeers = sample(beerIds, logsCount);
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
          const pool = allParticipants.filter((id) => id !== userId);
          if (pool.length > 0) reactionRows.push({ id: crypto.randomUUID(), user_id: randChoice(pool), session_id: sessionId, beer_log_id: beerLogId, type: randChoice(['thumbs_up', 'flame', 'beer']) });
        }
      }
      if (rng() < 0.15) {
        const pool = allParticipants.filter((id) => id !== userId);
        if (pool.length > 0) commentRows.push({ id: crypto.randomUUID(), user_id: randChoice(pool), session_id: sessionId, body: randChoice(SESSION_COMMENTS), created_at: iso(new Date(endTime.getTime() + randInt(5, 120) * 60000)) });
      }
      if (rng() < model.breweryReviewRate && !breweryReviewedUsers.has(userId)) {
        breweryReviewedUsers.add(userId);
        breweryReviewRows.push({ user_id: userId, brewery_id: brewery.id, rating: randFloat(4.0, 5.0, 1), comment: randChoice(BREWERY_REVIEW_COMMENTS) });
      }
    }
  }

  if (!isCheck) {
    await insertBatched('sessions', sessionRows, 50);
    await insertBatched('beer_logs', beerLogRows, 100);
    await insertBatched('beer_reviews', beerReviewRows, 50, { onConflict: 'user_id,beer_id', ignoreDuplicates: true });
    await insertBatched('brewery_reviews', breweryReviewRows, 50, { onConflict: 'user_id,brewery_id', ignoreDuplicates: true });
    await insertBatched('reactions', reactionRows, 100);
    await insertBatched('session_comments', commentRows, 50);
  }

  return { sessions: sessionRows.length, logs: beerLogRows.length, ratings: beerReviewRows.length, reviews: breweryReviewRows.length, reactions: reactionRows.length, comments: commentRows.length };
}

async function main() {
  console.log('HopTrack — seed-legit-staging.mjs');
  console.log(`target: staging (${STAGING_PROJECT_REF}) | mode: ${isCheck ? 'CHECK' : 'EXECUTE'}\n`);

  const { data: profiles, error: profErr } = await supabase.from('profiles').select('id, username, created_at');
  if (profErr) { console.error('Error loading profiles:', profErr.message); process.exit(1); }
  const ALL_PARTICIPANTS = profiles.map((p) => p.id);
  console.log(`Participant pool: ${ALL_PARTICIPANTS.length} users`);

  const now = new Date();
  const today0 = dayBaseUTC(now);

  // ── 1. Prior month (days -60..-31) per brewery ────────────────────────────
  console.log('\n=== Prior-month backfill (days -60..-31) ===');
  let grand = { sessions: 0, logs: 0, ratings: 0, reviews: 0, reactions: 0, comments: 0 };
  for (const brewery of BREWERIES) {
    const r = await seedPriorMonth(brewery, ALL_PARTICIPANTS, today0);
    console.log(`  ${brewery.label}: sessions ${r.sessions} | logs ${r.logs} | ratings ${r.ratings} | reviews ${r.reviews} | reactions ${r.reactions} | comments ${r.comments}`);
    for (const k of Object.keys(grand)) grand[k] += r[k];
  }
  console.log(`  TOTAL: ${JSON.stringify(grand)}`);

  // ── 2. Loyalty programs for the 4 breweries missing one ───────────────────
  console.log('\n=== Loyalty programs ===');
  const { data: existingPrograms } = await supabase.from('loyalty_programs').select('id, brewery_id').in('brewery_id', BREWERIES.map((b) => b.id));
  const programByBrewery = {};
  for (const p of existingPrograms ?? []) programByBrewery[p.brewery_id] = p.id;

  for (const [breweryId, def] of Object.entries(NEW_LOYALTY_PROGRAMS)) {
    if (programByBrewery[breweryId]) { console.log(`  skip (exists): ${breweryId}`); continue; }
    if (isCheck) { console.log(`  would create: ${def.name} @ ${breweryId}`); continue; }
    const { data: created, error } = await supabase.from('loyalty_programs').insert({
      brewery_id: breweryId, name: def.name, description: `Earn stamps with every visit.`,
      stamps_required: def.stamps_required, reward_description: def.reward_description, is_active: true,
    }).select('id').single();
    if (error) { console.warn(`  warn creating program for ${breweryId}:`, error.message); continue; }
    programByBrewery[breweryId] = created.id;
    console.log(`  created: ${def.name} @ ${breweryId}`);
  }

  // ── 3. Loyalty cards + redemptions across the last 60 days ────────────────
  console.log('\n=== Loyalty cards + redemptions ===');
  for (const brewery of BREWERIES) {
    const programId = programByBrewery[brewery.id];
    if (!programId) { console.log(`  ${brewery.label}: no program, skipping`); continue; }
    const { data: program } = await supabase.from('loyalty_programs').select('stamps_required').eq('id', programId).single();
    const stampsRequired = program?.stamps_required ?? 10;

    const { data: existingCards } = await supabase.from('loyalty_cards').select('user_id').eq('brewery_id', brewery.id);
    const existingUserIds = new Set((existingCards ?? []).map((c) => c.user_id));
    const targetCount = Math.max(8, Math.round(30 * brewery.scale));
    const candidates = ALL_PARTICIPANTS.filter((id) => !existingUserIds.has(id) && id !== JOSHUA_ID);
    const newMembers = sample(candidates, targetCount);

    const cardRows = [];
    const redemptionRows = [];
    for (const userId of newMembers) {
      const daysAgo = randInt(2, 58);
      const joinedAt = new Date(now.getTime() - daysAgo * 86400000 - randInt(0, 86400000));
      const lifetimeStamps = randInt(stampsRequired, stampsRequired * 4);
      const redemptionCount = Math.floor(lifetimeStamps / stampsRequired);
      const currentStamps = lifetimeStamps % stampsRequired;
      const lastStampAt = new Date(joinedAt.getTime() + randInt(1, Math.max(1, daysAgo - 1)) * 86400000);

      const cardId = crypto.randomUUID();
      cardRows.push({
        id: cardId, user_id: userId, brewery_id: brewery.id, program_id: programId,
        stamps: currentStamps, lifetime_stamps: lifetimeStamps,
        last_stamp_at: iso(lastStampAt), created_at: iso(joinedAt),
      });

      for (let i = 0; i < redemptionCount; i++) {
        const redeemedAt = new Date(joinedAt.getTime() + randInt(1, Math.max(1, daysAgo)) * 86400000);
        if (redeemedAt.getTime() > now.getTime()) continue;
        redemptionRows.push({ card_id: cardId, user_id: userId, brewery_id: brewery.id, program_id: programId, redeemed_at: iso(redeemedAt) });
      }
    }

    console.log(`  ${brewery.label}: +${cardRows.length} cards, +${redemptionRows.length} redemptions`);
    if (!isCheck) {
      await insertBatched('loyalty_cards', cardRows, 50);
      await insertBatched('loyalty_redemptions', redemptionRows, 50);
    }
  }

  // ── 4. Brewery follows growth across the last 60 days ─────────────────────
  console.log('\n=== Brewery follows ===');
  for (const brewery of BREWERIES) {
    const { data: existingFollows } = await supabase.from('brewery_follows').select('user_id').eq('brewery_id', brewery.id);
    const existingUserIds = new Set((existingFollows ?? []).map((f) => f.user_id));
    const targetCount = Math.max(10, Math.round(40 * brewery.scale));
    const candidates = ALL_PARTICIPANTS.filter((id) => !existingUserIds.has(id));
    const newFollowers = sample(candidates, targetCount);

    const followRows = newFollowers.map((userId) => {
      // Skew toward recent — sqrt bias pulls values down toward 0 (recent)
      const daysAgo = Math.floor(Math.sqrt(rng()) * 60);
      const followedAt = new Date(now.getTime() - daysAgo * 86400000 - randInt(0, 86400000));
      return { user_id: userId, brewery_id: brewery.id, created_at: iso(followedAt) };
    });

    console.log(`  ${brewery.label}: +${followRows.length} follows`);
    if (!isCheck) await insertBatched('brewery_follows', followRows, 50, { onConflict: 'user_id,brewery_id', ignoreDuplicates: true });
  }

  // ── 5. Brewery claims — "breweries signing up" for superadmin ─────────────
  console.log('\n=== Brewery claims (platform growth) ===');
  const excludeIds = BREWERIES.map((b) => b.id);
  const { data: candidateBreweries } = await supabase.from('breweries').select('id, name').not('id', 'in', `(${excludeIds.join(',')})`).limit(2000);
  const { data: existingClaims } = await supabase.from('brewery_claims').select('brewery_id');
  const alreadyClaimed = new Set((existingClaims ?? []).map((c) => c.brewery_id));
  const claimTargets = sample((candidateBreweries ?? []).filter((b) => !alreadyClaimed.has(b.id)), 60);

  const claimants = ALL_PARTICIPANTS.filter((id) => id !== JOSHUA_ID && id !== CO_OWNER_ID);
  const claimRows = claimTargets.map((b) => {
    const daysAgo = Math.floor(Math.sqrt(rng()) * 45);
    const createdAt = new Date(now.getTime() - daysAgo * 86400000 - randInt(0, 86400000));
    const r = rng();
    const status = r < 0.5 ? 'approved' : r < 0.85 ? 'pending' : 'rejected';
    const reviewed = status !== 'pending';
    return {
      user_id: randChoice(claimants),
      brewery_id: b.id,
      status,
      business_email: null,
      notes: status === 'rejected' ? 'Insufficient proof of ownership.' : null,
      reviewed_by: reviewed ? JOSHUA_ID : null,
      reviewed_at: reviewed ? iso(new Date(createdAt.getTime() + randInt(1, 3) * 86400000)) : null,
      created_at: iso(createdAt),
    };
  });
  console.log(`  +${claimRows.length} claims across ${claimTargets.length} breweries`);
  if (!isCheck) await insertBatched('brewery_claims', claimRows, 50);

  // ── 6. Spread existing profile signup dates for the growth chart ──────────
  console.log('\n=== User signup growth curve ===');
  const growthCandidates = profiles.filter((p) => p.id !== JOSHUA_ID);
  console.log(`  updating created_at for ${growthCandidates.length} profiles (skewed toward recent, last 45 days)`);
  if (!isCheck) {
    for (const p of growthCandidates) {
      const daysAgo = Math.floor(Math.sqrt(rng()) * 45);
      const createdAt = new Date(now.getTime() - daysAgo * 86400000 - randInt(0, 86400000));
      const { error } = await supabase.from('profiles').update({ created_at: iso(createdAt) }).eq('id', p.id);
      if (error) console.warn(`  warn updating profile ${p.id}:`, error.message);
    }
  }

  console.log('\n────────────────────────────────────────────────────────');
  console.log(isCheck ? 'CHECK mode — nothing written.' : 'Done. Staging now tells a month-long growth story.');
  console.log('────────────────────────────────────────────────────────');
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
