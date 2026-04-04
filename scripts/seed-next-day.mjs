/**
 * seed-next-day.mjs
 * Simulates one day of activity at Pint & Pixel brewery.
 *
 * Usage: node scripts/seed-next-day.mjs
 *
 * Reads env from .env.local, connects via service role, finds the most recent
 * session at Pint & Pixel, advances to the next calendar day, then inserts
 * sessions, beer_logs, beer_reviews, brewery_reviews, and reactions.
 */

import { createClient } from '@supabase/supabase-js';

// ─── Load env ────────────────────────────────────────────────────────────────
try {
  process.loadEnvFile('.env.local');
} catch {
  // Silently fall through — env vars may already be set
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

// ─── Constants ────────────────────────────────────────────────────────────────

const JOSHUA_ID = '90a1a802-8a79-4816-bf10-a900b91f2c5c';

/** All 41 valid participant UUIDs (40 test users + Joshua) */
function makeUserUUID(n) {
  const padded7 = String(n).padStart(7, '0');
  const padded3 = String(n).padStart(3, '0');
  return `f${padded7}-0000-4000-8000-000000000${padded3}`;
}
const TEST_USER_IDS = Array.from({ length: 40 }, (_, i) => makeUserUUID(i + 1));
const ALL_PARTICIPANTS = [...TEST_USER_IDS, JOSHUA_ID];

/** Pint & Pixel beer IDs (from migration 076) */
const PP_BEERS = [
  'cccccccc-0001-4000-8000-000000000001', // Infinite Loop IPA
  'cccccccc-0002-4000-8000-000000000002', // Regex Red
  'cccccccc-0003-4000-8000-000000000003', // Git Blame Belgian
  'cccccccc-0004-4000-8000-000000000004', // Infinite Loop IPA (alt slot)
  'cccccccc-0005-4000-8000-000000000005', // Null Pointer Nitro Stout
  'cccccccc-0006-4000-8000-000000000006', // Syntax Error Saison
  'cccccccc-0007-4000-8000-000000000007', // Hotfix Hazy Pale
  'cccccccc-0008-4000-8000-000000000008', // Binary Barleywine
  'cccccccc-0009-4000-8000-000000000009', // Cache Miss Cider
  'cccccccc-0010-4000-8000-000000000010', // Exception Handler ESB
];

/** Serving style options for each beer (loosely mapped by slot) */
const SERVING_STYLES_BY_BEER = {
  'cccccccc-0001-4000-8000-000000000001': ['pint'],
  'cccccccc-0002-4000-8000-000000000002': ['pint'],
  'cccccccc-0003-4000-8000-000000000003': ['goblet'],
  'cccccccc-0004-4000-8000-000000000004': ['pint'],
  'cccccccc-0005-4000-8000-000000000005': ['pint'],
  'cccccccc-0006-4000-8000-000000000006': ['tulip'],
  'cccccccc-0007-4000-8000-000000000007': ['pint'],
  'cccccccc-0008-4000-8000-000000000008': ['snifter', 'taster'],
  'cccccccc-0009-4000-8000-000000000009': ['pint'],
  'cccccccc-0010-4000-8000-000000000010': ['pint'],
};

const FLAVOR_TAGS_BY_BEER = {
  'cccccccc-0001-4000-8000-000000000001': ['hoppy', 'citrus', 'hazy', 'tropical'],
  'cccccccc-0002-4000-8000-000000000002': ['malty', 'caramel', 'smooth'],
  'cccccccc-0003-4000-8000-000000000003': ['fruity', 'spicy', 'complex'],
  'cccccccc-0004-4000-8000-000000000004': ['hoppy', 'juicy', 'tropical'],
  'cccccccc-0005-4000-8000-000000000005': ['chocolate', 'espresso', 'creamy'],
  'cccccccc-0006-4000-8000-000000000006': ['dry', 'peppery', 'citrus'],
  'cccccccc-0007-4000-8000-000000000007': ['citrus', 'light', 'sessionable'],
  'cccccccc-0008-4000-8000-000000000008': ['toffee', 'dark_fruit', 'warming'],
  'cccccccc-0009-4000-8000-000000000009': ['apple', 'ginger', 'dry'],
  'cccccccc-0010-4000-8000-000000000010': ['biscuit', 'earthy', 'balanced'],
};

/** Day-of-week traffic model (0=Sun, 1=Mon, ..., 6=Sat) */
const TRAFFIC = {
  0: { minVisitors: 45,  maxVisitors: 70,  reviewRate: 0.06, breweryReviewRate: 0.05, peakStart: 13, peakEnd: 18 },
  1: { minVisitors: 20,  maxVisitors: 35,  reviewRate: 0.04, breweryReviewRate: 0.02, peakStart: 17, peakEnd: 20 },
  2: { minVisitors: 25,  maxVisitors: 40,  reviewRate: 0.05, breweryReviewRate: 0.03, peakStart: 17, peakEnd: 20 },
  3: { minVisitors: 35,  maxVisitors: 55,  reviewRate: 0.06, breweryReviewRate: 0.04, peakStart: 17, peakEnd: 21 },
  4: { minVisitors: 50,  maxVisitors: 75,  reviewRate: 0.08, breweryReviewRate: 0.06, peakStart: 17, peakEnd: 22 },
  5: { minVisitors: 90,  maxVisitors: 130, reviewRate: 0.15, breweryReviewRate: 0.08, peakStart: 19, peakEnd: 23 },
  6: { minVisitors: 100, maxVisitors: 140, reviewRate: 0.18, breweryReviewRate: 0.10, peakStart: 14, peakEnd: 22 },
};

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ─── Beer log comments pool ────────────────────────────────────────────────────
const BEER_COMMENTS = [
  'Hits different every time.',
  'Could have another.',
  'Solid pour.',
  'Love this one.',
  'Going back for a second.',
  'My go-to.',
  'Asheville craft is unreal.',
  'Perfect after work.',
  'Crisp and clean.',
  'Really nice mouthfeel.',
  'Complex but crushable.',
  'Exactly what I needed.',
  'Top tier.',
  'This is the way.',
  'No notes.',
  'Pint & Pixel doing it right.',
  'Worth every sip.',
  'Tasting notes: yes.',
  'Getting another round.',
  'Dangerous. Could have three.',
  'First time trying this — wow.',
  'As good as I remembered.',
  'Bringing friends next time.',
  'The staff poured this perfectly.',
  'Great balance.',
  'Sessionable but satisfying.',
  'Honestly one of the best.',
  'Bold choice. No regrets.',
  'Nightcap material.',
  'Starting the night right.',
];

const BREWERY_REVIEW_COMMENTS = [
  'Best brewery in Asheville. Period.',
  'The vibes are unmatched. Five stars.',
  'Tap list is always on point.',
  'Came back for the third time this month.',
  'The staff here are incredible.',
  'Pint & Pixel has no competition.',
  'Arcade + amazing beer = perfect night.',
  'Always a great atmosphere.',
  'Solid lineup, stellar service.',
  'The hazy IPA alone is worth the visit.',
  'Could live here. Seriously.',
  'Every time I visit, I leave happy.',
  'Best date night spot in WNC.',
  'The nitro stout is a religious experience.',
  'Asheville has 50+ breweries and this is #1.',
  'Clean taps, fresh beer, great energy.',
  'The barleywine alone justifies the trip.',
  'World-class craft beer in Asheville.',
];

// ─── Utilities ────────────────────────────────────────────────────────────────

function rng() {
  return Math.random();
}

function randInt(min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function randChoice(arr) {
  return arr[Math.floor(rng() * arr.length)];
}

function randFloat(min, max, decimals = 1) {
  return parseFloat((rng() * (max - min) + min).toFixed(decimals));
}

/** Pick n random items from arr (no repeats) */
function sample(arr, n) {
  const shuffled = [...arr].sort(() => rng() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}

/** Convert a Date to an ISO string */
function iso(date) {
  return date.toISOString();
}

/**
 * Build a timestamp for the simulated day.
 * @param {Date} dayBase - midnight of the simulated day (local → UTC midnight)
 * @param {number} hour - 0-25 (25 = 1am next day)
 * @param {number} minuteOffset - extra minutes
 */
function ts(dayBase, hour, minuteOffset = 0) {
  const d = new Date(dayBase.getTime());
  d.setUTCHours(hour, minuteOffset, 0, 0);
  return d;
}

/**
 * Distribute visitors across the day using a rough bell-curve toward peak.
 * Returns an array of { userId, arrivalHour, arrivalMinute, durationMinutes }.
 */
function scheduleVisitors(visitorCount, peakStart, peakEnd) {
  const slots = [];
  for (let i = 0; i < visitorCount; i++) {
    const userId = randChoice(ALL_PARTICIPANTS);
    // Weighted random: most visitors arrive in or near peak window
    let hour;
    const r = rng();
    if (r < 0.15) {
      // Lunch/early afternoon: 11am-4pm
      hour = randInt(11, 15);
    } else if (r < 0.55) {
      // Peak window
      hour = randInt(peakStart, peakEnd);
    } else {
      // Shoulder: 4pm-close
      hour = randInt(16, 24);
    }
    const minute = randInt(0, 59);
    const duration = randInt(60, 180); // 1-3 hours
    slots.push({ userId, arrivalHour: hour, arrivalMinute: minute, durationMinutes: duration });
  }
  return slots;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('HopTrack — seed-next-day.mjs');
  console.log('Connecting to Supabase…');

  // 1. Look up Pint & Pixel
  const { data: brewery, error: breweryErr } = await supabase
    .from('breweries')
    .select('id, name')
    .eq('id', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890')
    .single();

  if (breweryErr || !brewery) {
    console.error('Could not find Pint & Pixel brewery. Make sure migration 076 has been applied.');
    console.error(breweryErr?.message ?? 'No matching brewery found.');
    process.exit(1);
  }

  const PP_BREWERY_ID = brewery.id;
  console.log(`Found brewery: "${brewery.name}" (${PP_BREWERY_ID})`);

  // 2. Find the most recent session at Pint & Pixel
  const { data: lastSessionRow, error: lastSessErr } = await supabase
    .from('sessions')
    .select('started_at')
    .eq('brewery_id', PP_BREWERY_ID)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  let lastSeededDate;
  if (lastSessErr) {
    console.error('Error querying sessions:', lastSessErr.message);
    process.exit(1);
  }

  if (!lastSessionRow) {
    // No sessions yet — treat yesterday as the last seeded day
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    lastSeededDate = new Date(Date.UTC(
      yesterday.getUTCFullYear(),
      yesterday.getUTCMonth(),
      yesterday.getUTCDate(),
    ));
    console.log('No existing sessions found — treating yesterday as last seeded day.');
  } else {
    const last = new Date(lastSessionRow.started_at);
    lastSeededDate = new Date(Date.UTC(
      last.getUTCFullYear(),
      last.getUTCMonth(),
      last.getUTCDate(),
    ));
  }

  // 3. Advance to next calendar day
  const nextDay = new Date(lastSeededDate.getTime());
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);

  // Never seed future data — cap at today (seed today if not done, skip if already seeded)
  const todayUTC = new Date(Date.UTC(
    new Date().getUTCFullYear(),
    new Date().getUTCMonth(),
    new Date().getUTCDate(),
  ));
  const tomorrowUTC = new Date(todayUTC.getTime() + 86400000);

  if (nextDay >= tomorrowUTC) {
    const lastDateStr = lastSeededDate.toISOString().split('T')[0];
    console.log(`\nAlready seeded today (last seeded: ${lastDateStr}).`);
    console.log('Nothing to seed — run again tomorrow.');
    process.exit(0);
  }

  const dow = nextDay.getUTCDay(); // 0=Sun, 6=Sat
  const dayName = DAY_NAMES[dow];
  const dateStr = nextDay.toISOString().split('T')[0];
  console.log(`\nSimulating: ${dayName} ${dateStr}`);

  // 4. Traffic model
  const model = TRAFFIC[dow];
  const visitorCount = randInt(model.minVisitors, model.maxVisitors);
  console.log(`Traffic model: ${model.minVisitors}–${model.maxVisitors} visitors, peak ${model.peakStart}–${model.peakEnd}h`);
  console.log(`Today's visitor draw: ${visitorCount}`);

  const schedule = scheduleVisitors(visitorCount, model.peakStart, model.peakEnd);

  // 5. Build inserts

  const sessionRows = [];
  const beerLogRows = [];
  const beerReviewRows = [];
  const breweryReviewRows = [];
  const reactionRows = [];

  // Track which users already left a brewery review today (avoid duplicates per run)
  const breweryReviewedUsers = new Set();
  // Track which (userId, beerId) combos already have a beer review today
  const beerReviewedPairs = new Set();

  for (const slot of schedule) {
    const sessionId = crypto.randomUUID();
    const startTime = ts(nextDay, slot.arrivalHour, slot.arrivalMinute);
    const endTime = new Date(startTime.getTime() + slot.durationMinutes * 60 * 1000);
    const isActive = false; // seeding past data

    // Session
    sessionRows.push({
      id: sessionId,
      user_id: slot.userId,
      brewery_id: PP_BREWERY_ID,
      context: 'brewery',
      started_at: iso(startTime),
      ended_at: iso(endTime),
      is_active: isActive,
      share_to_feed: rng() > 0.1, // 90% share to feed
      xp_awarded: randInt(15, 60),
      note: null,
    });

    // Beer logs: 1-4 per session
    const logsCount = randInt(1, 4);
    const sessionBeers = sample(PP_BEERS, logsCount);
    let logTime = new Date(startTime.getTime() + randInt(5, 20) * 60 * 1000);

    for (const beerId of sessionBeers) {
      const beerLogId = crypto.randomUUID();
      const servingStyles = SERVING_STYLES_BY_BEER[beerId] ?? ['pint'];
      const flavorTags = FLAVOR_TAGS_BY_BEER[beerId] ?? ['malty'];
      const rating = rng() > 0.3 ? randFloat(3.0, 5.0, 1) : null; // 70% leave a log rating
      const hasComment = rng() > 0.5;

      beerLogRows.push({
        id: beerLogId,
        session_id: sessionId,
        user_id: slot.userId,
        beer_id: beerId,
        brewery_id: PP_BREWERY_ID,
        quantity: 1,
        rating,
        flavor_tags: sample(flavorTags, randInt(1, flavorTags.length)),
        serving_style: randChoice(servingStyles),
        comment: hasComment ? randChoice(BEER_COMMENTS) : null,
        photo_url: null,
        logged_at: iso(logTime),
      });

      // Advance log time by 30-60 mins between beers
      logTime = new Date(logTime.getTime() + randInt(30, 60) * 60 * 1000);

      // Beer review: ~15% of visitors per beer reviewed, once per (user, beer) pair
      if (rng() < model.reviewRate) {
        const reviewKey = `${slot.userId}:${beerId}`;
        if (!beerReviewedPairs.has(reviewKey)) {
          beerReviewedPairs.add(reviewKey);
          beerReviewRows.push({
            user_id: slot.userId,
            beer_id: beerId,
            rating: randFloat(3.5, 5.0, 1),
            comment: randChoice(BEER_COMMENTS),
          });
        }
      }

      // Reactions: ~20% chance on each beer log
      if (rng() < 0.20) {
        const reactionTypes = ['thumbs_up', 'flame', 'beer'];
        // Reactor is a random friend (different user)
        const reactorPool = ALL_PARTICIPANTS.filter(id => id !== slot.userId);
        if (reactorPool.length > 0) {
          reactionRows.push({
            id: crypto.randomUUID(),
            user_id: randChoice(reactorPool),
            session_id: sessionId,
            beer_log_id: beerLogId,
            type: randChoice(reactionTypes),
          });
        }
      }
    }

    // Brewery review: per-day rate, once per user per day
    if (rng() < model.breweryReviewRate && !breweryReviewedUsers.has(slot.userId)) {
      breweryReviewedUsers.add(slot.userId);
      const reviewTime = new Date(endTime.getTime() - randInt(5, 30) * 60 * 1000);
      breweryReviewRows.push({
        user_id: slot.userId,
        brewery_id: PP_BREWERY_ID,
        rating: randFloat(4.0, 5.0, 1),
        comment: randChoice(BREWERY_REVIEW_COMMENTS),
      });
    }
  }

  // 6. Insert in dependency order

  // Sessions
  if (sessionRows.length > 0) {
    const BATCH = 50;
    for (let i = 0; i < sessionRows.length; i += BATCH) {
      const chunk = sessionRows.slice(i, i + BATCH);
      const { error } = await supabase.from('sessions').insert(chunk);
      if (error) {
        console.error('Error inserting sessions:', error.message);
        process.exit(1);
      }
    }
  }

  // Beer logs (need session IDs to exist first)
  if (beerLogRows.length > 0) {
    const BATCH = 100;
    for (let i = 0; i < beerLogRows.length; i += BATCH) {
      const chunk = beerLogRows.slice(i, i + BATCH);
      const { error } = await supabase.from('beer_logs').insert(chunk);
      if (error) {
        console.error('Error inserting beer_logs:', error.message);
        process.exit(1);
      }
    }
  }

  // Beer reviews (upsert — conflict on user_id + beer_id if unique constraint exists, else plain insert)
  if (beerReviewRows.length > 0) {
    const BATCH = 50;
    for (let i = 0; i < beerReviewRows.length; i += BATCH) {
      const chunk = beerReviewRows.slice(i, i + BATCH);
      const { error } = await supabase
        .from('beer_reviews')
        .upsert(chunk, { onConflict: 'user_id,beer_id', ignoreDuplicates: true });
      if (error) {
        // Fall back to plain insert if upsert fails (e.g. no unique constraint)
        const { error: insertErr } = await supabase.from('beer_reviews').insert(chunk);
        if (insertErr) {
          console.warn('Warning inserting beer_reviews:', insertErr.message);
        }
      }
    }
  }

  // Brewery reviews
  if (breweryReviewRows.length > 0) {
    const BATCH = 50;
    for (let i = 0; i < breweryReviewRows.length; i += BATCH) {
      const chunk = breweryReviewRows.slice(i, i + BATCH);
      const { error } = await supabase
        .from('brewery_reviews')
        .upsert(chunk, { onConflict: 'user_id,brewery_id', ignoreDuplicates: true });
      if (error) {
        const { error: insertErr } = await supabase.from('brewery_reviews').insert(chunk);
        if (insertErr) {
          console.warn('Warning inserting brewery_reviews:', insertErr.message);
        }
      }
    }
  }

  // Reactions
  if (reactionRows.length > 0) {
    const BATCH = 100;
    for (let i = 0; i < reactionRows.length; i += BATCH) {
      const chunk = reactionRows.slice(i, i + BATCH);
      const { error } = await supabase.from('reactions').insert(chunk);
      if (error) {
        // Reactions may fail on duplicate session+user combos — warn, don't exit
        console.warn('Warning inserting reactions:', error.message);
      }
    }
  }

  // 7. Summary
  console.log('\n────────────────────────────────────────────────────────');
  console.log(
    `Day: ${dayName} ${dateStr} | Visitors: ${sessionRows.length} | Beer logs: ${beerLogRows.length} | Ratings: ${beerReviewRows.length} | Reviews: ${breweryReviewRows.length} | Reactions: ${reactionRows.length}`,
  );
  console.log('────────────────────────────────────────────────────────');
  console.log('Done. Beers poured, data seeded.');
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
