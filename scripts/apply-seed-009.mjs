/**
 * apply-seed-009.mjs
 * Applies friend feed demo data (seed 009) using service role key.
 * Run: node scripts/apply-seed-009.mjs
 */

import { createClient } from '@supabase/supabase-js';

// Keys read from env — copy .env.local values or set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://uadjtanoyvalnmlbnzxk.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

if (!SERVICE_ROLE_KEY) {
  console.error('❌ Set SUPABASE_SERVICE_ROLE_KEY env var before running this script.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Friend user UUIDs (from seed 003)
const u01 = 'cc000000-0000-0000-0000-000000000001'; // Alex Chen
const u02 = 'cc000000-0000-0000-0000-000000000002'; // Marcus Johnson
const u03 = 'cc000000-0000-0000-0000-000000000003'; // Priya Patel
const u05 = 'cc000000-0000-0000-0000-000000000005'; // Sam Rivera
const u07 = 'cc000000-0000-0000-0000-000000000007'; // Tom Nguyen
const u08 = 'cc000000-0000-0000-0000-000000000008'; // Jessica Blake
const u10 = 'cc000000-0000-0000-0000-000000000010'; // Rachel Foster
const u11 = 'cc000000-0000-0000-0000-000000000011'; // James O'Toole

// Breweries (from seed 007)
const pp_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'; // Pint & Pixel
const bs_id = 'b2c3d4e5-f6a7-8901-bcde-f12345678901'; // Barrel & Stone
const hf_id = 'c3d4e5f6-a7b8-9012-cdef-012345678902'; // Hopfield
const lc_id = 'd4e5f6a7-b8c9-0123-defa-123456789003'; // Lost Creek

// Other brewery beer UUIDs
const bs_amber  = 'e5f6a7b8-c9d0-1234-efab-234567890104';
const bs_ipa    = 'f6a7b8c9-d0e1-2345-fabc-345678901205';
const bs_wheat  = 'a7b8c9d0-e1f2-3456-abcd-456789012306';
const hf_hazy   = 'b8c9d0e1-f2a3-4567-bcde-567890123407';
const hf_saison = 'c9d0e1f2-a3b4-5678-cdef-678901234508';
const hf_porter = 'd0e1f2a3-b4c5-6789-defa-789012345609';
const lc_ipa    = 'e1f2a3b4-c5d6-7890-efab-890123456700';
const lc_kolsch = 'f2a3b4c5-d6e7-8901-fabc-901234567801';
const lc_sour   = 'a3b4c5d6-e7f8-9012-abcd-012345678902';

// Session UUIDs
const fs01 = 'ff000009-0000-0000-0000-000000000001';
const fs02 = 'ff000009-0000-0000-0000-000000000002';
const fs03 = 'ff000009-0000-0000-0000-000000000003';
const fs04 = 'ff000009-0000-0000-0000-000000000004';
const fs05 = 'ff000009-0000-0000-0000-000000000005';
const fs06 = 'ff000009-0000-0000-0000-000000000006';
const fs07 = 'ff000009-0000-0000-0000-000000000007';
const fs08 = 'ff000009-0000-0000-0000-000000000008';

function hoursAgo(h) {
  return new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
}
function daysHoursAgo(d, h) {
  return new Date(Date.now() - d * 24 * 60 * 60 * 1000 + h * 60 * 60 * 1000).toISOString();
}

async function run() {
  console.log('🍺 Applying seed 009 — friend feed demo data...\n');

  // ── 1. Resolve Pint & Pixel beer IDs ─────────────────────────────────────
  const beerNames = [
    'Debug IPA', 'Dark Mode Stout', 'Stack Overflow Sour', '404 Wheat Not Found',
    'Pixel Perfect Pils', 'Deploy Friday DIPA', 'Kernel Panic Porter',
    'Legacy Code Lager', 'Pull Request Pale', 'Merge Conflict Märzen'
  ];
  const beerMap = {};
  for (const name of beerNames) {
    const { data, error } = await supabase
      .from('beers')
      .select('id')
      .eq('brewery_id', pp_id)
      .eq('name', name)
      .single();
    if (error || !data) {
      console.warn(`⚠️  Beer not found: ${name}`);
    } else {
      beerMap[name] = data.id;
    }
  }
  const b_ipa    = beerMap['Debug IPA'];
  const b_stout  = beerMap['Dark Mode Stout'];
  const b_sour   = beerMap['Stack Overflow Sour'];
  const b_dipa   = beerMap['Deploy Friday DIPA'];
  const b_porter = beerMap['Kernel Panic Porter'];
  console.log('✅ Beer IDs resolved:', Object.keys(beerMap).length, 'beers found');

  // ── 2. Insert sessions ────────────────────────────────────────────────────
  const sessions = [
    { id: fs01, user_id: u01, brewery_id: pp_id, context: 'brewery', is_active: false, share_to_feed: true, xp_awarded: 175,
      started_at: hoursAgo(4), ended_at: hoursAgo(1), note: 'First time at P&P in months. Still the best IPA in Austin.' },
    { id: fs02, user_id: u07, brewery_id: hf_id, context: 'brewery', is_active: false, share_to_feed: true, xp_awarded: 195,
      started_at: hoursAgo(6), ended_at: hoursAgo(3), note: 'Hazy Daze + a saison. Thursday well spent.' },
    { id: fs03, user_id: u02, brewery_id: bs_id, context: 'brewery', is_active: false, share_to_feed: true, xp_awarded: 160,
      started_at: hoursAgo(10), ended_at: hoursAgo(7), note: null },
    { id: fs04, user_id: u10, brewery_id: lc_id, context: 'brewery', is_active: false, share_to_feed: true, xp_awarded: 180,
      started_at: hoursAgo(22), ended_at: hoursAgo(19), note: 'That Greenbelt Gose is genuinely dangerous in this heat.' },
    { id: fs05, user_id: u03, brewery_id: null, context: 'home', is_active: false, share_to_feed: true, xp_awarded: 100,
      started_at: daysHoursAgo(2, 20), ended_at: daysHoursAgo(2, 22), note: 'Trying some cans from the bottle shop. Research night.' },
    { id: fs06, user_id: u11, brewery_id: pp_id, context: 'brewery', is_active: false, share_to_feed: true, xp_awarded: 165,
      started_at: daysHoursAgo(3, 18), ended_at: daysHoursAgo(3, 21), note: null },
    { id: fs07, user_id: u08, brewery_id: hf_id, context: 'brewery', is_active: false, share_to_feed: true, xp_awarded: 190,
      started_at: daysHoursAgo(3, 14), ended_at: daysHoursAgo(3, 17), note: 'Dark Matter Porter is everything.' },
    { id: fs08, user_id: u05, brewery_id: bs_id, context: 'brewery', is_active: false, share_to_feed: true, xp_awarded: 155,
      started_at: daysHoursAgo(4, 16), ended_at: daysHoursAgo(4, 19), note: null },
  ];

  const { error: sessErr } = await supabase.from('sessions').upsert(sessions, { onConflict: 'id' });
  if (sessErr) console.error('❌ Sessions error:', sessErr.message);
  else console.log('✅ 8 sessions upserted');

  // ── 3. Beer logs ─────────────────────────────────────────────────────────
  const beerLogs = [
    // fs01: Alex @ Pint & Pixel
    { session_id: fs01, user_id: u01, beer_id: b_ipa,    brewery_id: pp_id, quantity: 1, rating: 4.5, flavor_tags: ['citrus','hoppy'],     serving_style: 'draft', comment: 'Classic opener. This place holds up.', logged_at: hoursAgo(4) },
    { session_id: fs01, user_id: u01, beer_id: b_dipa,   brewery_id: pp_id, quantity: 1, rating: 5.0, flavor_tags: ['tropical','dank'],     serving_style: 'draft', comment: 'Deploy Friday DIPA is genuinely elite.', logged_at: hoursAgo(3) },
    { session_id: fs01, user_id: u01, beer_id: b_stout,  brewery_id: pp_id, quantity: 1, rating: 4.0, flavor_tags: ['roasty','chocolate'], serving_style: 'draft', comment: null, logged_at: hoursAgo(2) },
    // fs02: Tom @ Hopfield
    { session_id: fs02, user_id: u07, beer_id: hf_hazy,   brewery_id: hf_id, quantity: 1, rating: 5.0, flavor_tags: ['mango','tropical','hazy'], serving_style: 'draft', comment: 'Every time. Undefeated.', logged_at: hoursAgo(6) },
    { session_id: fs02, user_id: u07, beer_id: hf_saison, brewery_id: hf_id, quantity: 1, rating: 4.0, flavor_tags: ['spicy','dry','crisp'],     serving_style: 'draft', comment: 'Lighter than expected but grows on you.', logged_at: hoursAgo(5) },
    // fs03: Marcus @ Barrel & Stone
    { session_id: fs03, user_id: u02, beer_id: bs_amber, brewery_id: bs_id, quantity: 1, rating: 4.5, flavor_tags: ['caramel','oaky','smooth'], serving_style: 'draft', comment: 'Stave Amber hits different on a weekday.', logged_at: hoursAgo(10) },
    { session_id: fs03, user_id: u02, beer_id: bs_ipa,   brewery_id: bs_id, quantity: 1, rating: 4.0, flavor_tags: ['citrus','whiskey','resinous'], serving_style: 'draft', comment: null, logged_at: hoursAgo(9) },
    // fs04: Rachel @ Lost Creek
    { session_id: fs04, user_id: u10, beer_id: lc_sour,   brewery_id: lc_id, quantity: 1, rating: 5.0, flavor_tags: ['lime','salty','refreshing'], serving_style: 'draft', comment: 'Greenbelt Gose is a top-5 beer for me. Not kidding.', logged_at: hoursAgo(22) },
    { session_id: fs04, user_id: u10, beer_id: lc_kolsch, brewery_id: lc_id, quantity: 1, rating: 4.5, flavor_tags: ['crisp','light','floral'],     serving_style: 'draft', comment: 'Barton Kölsch — accidentally ordered a second.', logged_at: hoursAgo(21) },
    { session_id: fs04, user_id: u10, beer_id: lc_ipa,    brewery_id: lc_id, quantity: 1, rating: 4.0, flavor_tags: ['pine','grapefruit','bitter'], serving_style: 'draft', comment: 'Spring Branch IPA: textbook West Coast.', logged_at: hoursAgo(20) },
    // fs05: Priya @ home
    { session_id: fs05, user_id: u03, beer_id: bs_wheat,  brewery_id: bs_id, quantity: 1, rating: 4.0, flavor_tags: ['vanilla','citrus','soft'], serving_style: 'can', comment: 'Grabbed a 4-pack of White Oak Wit. Good call.', logged_at: daysHoursAgo(2, 20) },
    { session_id: fs05, user_id: u03, beer_id: hf_porter, brewery_id: hf_id, quantity: 1, rating: 4.5, flavor_tags: ['coffee','chocolate'],      serving_style: 'can', comment: 'Dark Matter Porter from a can: still excellent.', logged_at: daysHoursAgo(2, 21) },
    // fs06: James @ Pint & Pixel
    { session_id: fs06, user_id: u11, beer_id: b_porter, brewery_id: pp_id, quantity: 1, rating: 5.0, flavor_tags: ['vanilla','smoky','roasty'],    serving_style: 'draft', comment: 'Kernel Panic Porter is in my top 3 beers ever.', logged_at: daysHoursAgo(3, 18) },
    { session_id: fs06, user_id: u11, beer_id: b_sour,   brewery_id: pp_id, quantity: 1, rating: 4.5, flavor_tags: ['tart','fruity','effervescent'], serving_style: 'draft', comment: 'Stack Overflow Sour: dangerous and delicious.', logged_at: daysHoursAgo(3, 19) },
    // fs07: Jessica @ Hopfield
    { session_id: fs07, user_id: u08, beer_id: hf_porter, brewery_id: hf_id, quantity: 1, rating: 5.0, flavor_tags: ['dark','coffee','rich'],   serving_style: 'draft', comment: 'Dark Matter Porter is everything I needed today.', logged_at: daysHoursAgo(3, 14) },
    { session_id: fs07, user_id: u08, beer_id: hf_hazy,   brewery_id: hf_id, quantity: 1, rating: 4.5, flavor_tags: ['juicy','tropical'],       serving_style: 'draft', comment: 'Hazy Daze: as advertised.', logged_at: daysHoursAgo(3, 15) },
    { session_id: fs07, user_id: u08, beer_id: hf_saison, brewery_id: hf_id, quantity: 1, rating: 3.5, flavor_tags: ['farmhouse','dry'],         serving_style: 'draft', comment: 'Circuit Saison is an acquired taste. Working on it.', logged_at: daysHoursAgo(3, 16) },
    // fs08: Sam @ Barrel & Stone
    { session_id: fs08, user_id: u05, beer_id: bs_ipa,   brewery_id: bs_id, quantity: 1, rating: 4.5, flavor_tags: ['citrus','oaky','hoppy'],  serving_style: 'draft', comment: null, logged_at: daysHoursAgo(4, 16) },
    { session_id: fs08, user_id: u05, beer_id: bs_amber, brewery_id: bs_id, quantity: 1, rating: 4.0, flavor_tags: ['malty','caramel','warm'],  serving_style: 'draft', comment: 'Stave Amber is so solid. Underrated.', logged_at: daysHoursAgo(4, 17) },
  ].filter(l => l.beer_id); // skip any null beer IDs

  const { error: logErr } = await supabase.from('beer_logs').upsert(beerLogs, { ignoreDuplicates: true });
  if (logErr) console.error('❌ Beer logs error:', logErr.message);
  else console.log(`✅ ${beerLogs.length} beer logs upserted`);

  // ── 4. Streak milestones ──────────────────────────────────────────────────
  const streakUpdates = [
    { id: u01, current_streak: 7  },
    { id: u07, current_streak: 14 },
    { id: u10, current_streak: 30 },
    { id: u11, current_streak: 5  },
  ];
  for (const { id, current_streak } of streakUpdates) {
    const { error } = await supabase.from('profiles').update({ current_streak }).eq('id', id);
    if (error) console.error(`❌ Streak update error for ${id}:`, error.message);
  }
  console.log('✅ Streak milestones set: Alex→7, Tom→14, Rachel→30, James→5');

  // ── 5. 5-star reviews for NewFavoriteCard ─────────────────────────────────
  const reviews = [
    { user_id: u10, beer_id: lc_sour,   rating: 5.0, comment: 'My new favorite beer. Period. Greenbelt Gose is perfect.',     created_at: hoursAgo(22) },
    { user_id: u07, beer_id: hf_hazy,   rating: 5.0, comment: 'Hazy Daze from Hopfield is elite. Top shelf hazy IPA.',         created_at: hoursAgo(6) },
    { user_id: u08, beer_id: hf_porter, rating: 5.0, comment: 'Dark Matter Porter: this is what craft beer is all about.',      created_at: daysHoursAgo(3, 14) },
  ];
  const { error: revErr } = await supabase.from('beer_reviews').upsert(reviews, { ignoreDuplicates: true });
  if (revErr) console.error('❌ Reviews error:', revErr.message);
  else console.log('✅ 3 five-star reviews inserted (triggers NewFavoriteCard)');

  // ── 6. Brewery visits ─────────────────────────────────────────────────────
  const visits = [
    { user_id: u01, brewery_id: pp_id, total_visits: 3, unique_beers_tried: 3, last_visit_at: hoursAgo(4) },
    { user_id: u07, brewery_id: hf_id, total_visits: 5, unique_beers_tried: 4, last_visit_at: hoursAgo(6) },
    { user_id: u02, brewery_id: bs_id, total_visits: 2, unique_beers_tried: 2, last_visit_at: hoursAgo(10) },
    { user_id: u10, brewery_id: lc_id, total_visits: 4, unique_beers_tried: 5, last_visit_at: hoursAgo(22) },
    { user_id: u11, brewery_id: pp_id, total_visits: 6, unique_beers_tried: 4, last_visit_at: daysHoursAgo(3, 0) },
    { user_id: u08, brewery_id: hf_id, total_visits: 3, unique_beers_tried: 3, last_visit_at: daysHoursAgo(3, 0) },
    { user_id: u05, brewery_id: bs_id, total_visits: 2, unique_beers_tried: 2, last_visit_at: daysHoursAgo(4, 0) },
  ];
  const { error: visitErr } = await supabase.from('brewery_visits').upsert(visits, { onConflict: 'user_id,brewery_id' });
  if (visitErr) console.error('❌ Brewery visits error:', visitErr.message);
  else console.log('✅ Brewery visits upserted');

  console.log('\n🍺 Seed 009 complete — all card types now seeded');
  console.log('   SessionCard ✅  StreakFeedCard ✅  AchievementFeedCard ✅');
  console.log('   NewFavoriteCard ✅  (FriendJoinedCard comes from friend relationships)');
}

run().catch(console.error);
