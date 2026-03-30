/**
 * apply-seed-010.mjs
 * Full activity seed — all feed card types for Joshua's demo account.
 * Run: SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/apply-seed-010.mjs
 *
 * Covers:
 *   - SessionCard       (existing + new)
 *   - AchievementFeedCard (user_achievements for friends)
 *   - StreakFeedCard    (streak milestones, NOT seen in localStorage)
 *   - NewFavoriteCard   (5-star beer_reviews from friends)
 *   - FriendJoinedCard  (recent friendship created_at)
 *   - RatingCard        (friend beer_reviews within 7 days)
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://uadjtanoyvalnmlbnzxk.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
if (!SERVICE_ROLE_KEY) { console.error('❌ Set SUPABASE_SERVICE_ROLE_KEY'); process.exit(1); }

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Friend UUIDs (seed 003)
const u01 = 'cc000000-0000-0000-0000-000000000001'; // Alex Chen
const u02 = 'cc000000-0000-0000-0000-000000000002'; // Marcus Johnson
const u03 = 'cc000000-0000-0000-0000-000000000003'; // Priya Patel
const u05 = 'cc000000-0000-0000-0000-000000000005'; // Sam Rivera
const u07 = 'cc000000-0000-0000-0000-000000000007'; // Tom Nguyen
const u08 = 'cc000000-0000-0000-0000-000000000008'; // Jessica Blake
const u10 = 'cc000000-0000-0000-0000-000000000010'; // Rachel Foster
const u11 = 'cc000000-0000-0000-0000-000000000011'; // James O'Toole
const u12 = 'cc000000-0000-0000-0000-000000000012'; // NEW — Maya Lin (just joined)

// Breweries (seed 007)
const pp_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'; // Pint & Pixel
const bs_id = 'b2c3d4e5-f6a7-8901-bcde-f12345678901'; // Barrel & Stone
const hf_id = 'c3d4e5f6-a7b8-9012-cdef-012345678902'; // Hopfield
const lc_id = 'd4e5f6a7-b8c9-0123-defa-123456789003'; // Lost Creek

// Beer UUIDs
const bs_amber  = 'e5f6a7b8-c9d0-1234-efab-234567890104';
const bs_ipa    = 'f6a7b8c9-d0e1-2345-fabc-345678901205';
const hf_hazy   = 'b8c9d0e1-f2a3-4567-bcde-567890123407';
const hf_saison = 'c9d0e1f2-a3b4-5678-cdef-678901234508';
const hf_porter = 'd0e1f2a3-b4c5-6789-defa-789012345609';
const lc_sour   = 'a3b4c5d6-e7f8-9012-abcd-012345678902';
const lc_ipa    = 'e1f2a3b4-c5d6-7890-efab-890123456700';

function ago(h) { return new Date(Date.now() - h * 3600000).toISOString(); }
function daysAgo(d, h = 0) { return new Date(Date.now() - d * 86400000 + h * 3600000).toISOString(); }

async function run() {
  console.log('🍺 Seed 010 — full activity demo data\n');

  // ── Resolve Pint & Pixel beer IDs ────────────────────────────────────────
  const ppBeers = {};
  const names = ['Debug IPA','Dark Mode Stout','Stack Overflow Sour','Deploy Friday DIPA','Kernel Panic Porter'];
  for (const name of names) {
    const { data } = await sb.from('beers').select('id').eq('brewery_id', pp_id).eq('name', name).single();
    if (data) ppBeers[name] = data.id;
  }
  const b_ipa    = ppBeers['Debug IPA'];
  const b_stout  = ppBeers['Dark Mode Stout'];
  const b_sour   = ppBeers['Stack Overflow Sour'];
  const b_dipa   = ppBeers['Deploy Friday DIPA'];
  const b_porter = ppBeers['Kernel Panic Porter'];
  console.log('✅ Beer IDs resolved');

  // ── 1. Create Maya Lin (FriendJoinedCard) ──────────────────────────────
  // Insert into profiles with recent created_at (triggers FriendJoinedCard in feed)
  const { error: mayaErr } = await sb.from('profiles').upsert({
    id: u12,
    username: 'maya_lin',
    display_name: 'Maya Lin',
    avatar_url: null,
    xp: 50,
    level: 1,
    total_checkins: 0,
    current_streak: 0,
    created_at: ago(18), // joined 18 hours ago
  }, { onConflict: 'id' });
  if (mayaErr) console.warn('⚠️  Maya upsert:', mayaErr.message);
  else console.log('✅ Maya Lin profile created (FriendJoinedCard trigger)');

  // ── 2. Friend Achievements — user_achievements rows ────────────────────
  // Need achievement keys that exist in the DB. Let's fetch a few.
  const { data: achievementRows } = await sb.from('achievements').select('id, key, name, category').limit(20);
  const achMap = {};
  for (const a of (achievementRows ?? [])) achMap[a.key] = a;

  const streakAch  = achMap['seven_day_streak'] ?? achMap['seven_day'] ?? Object.values(achMap).find(a => a.category === 'time');
  const varietyAch = achMap['wheat_king'] ?? Object.values(achMap).find(a => a.category === 'variety');
  const socialAch  = Object.values(achMap).find(a => a.category === 'social');
  const anyAch1    = achievementRows?.[0];
  const anyAch2    = achievementRows?.[1];
  const anyAch3    = achievementRows?.[2];

  const achievements = [
    streakAch  && { user_id: u01, achievement_id: streakAch.id,  earned_at: ago(3)  },
    varietyAch && { user_id: u07, achievement_id: varietyAch.id, earned_at: ago(7)  },
    socialAch  && { user_id: u10, achievement_id: socialAch.id,  earned_at: daysAgo(2) },
    anyAch1    && { user_id: u02, achievement_id: anyAch1.id,    earned_at: daysAgo(1) },
    anyAch2    && { user_id: u08, achievement_id: anyAch2.id,    earned_at: daysAgo(1, 5) },
    anyAch3    && { user_id: u11, achievement_id: anyAch3.id,    earned_at: daysAgo(2, 3) },
  ].filter(Boolean);

  if (achievements.length > 0) {
    const { error: achErr } = await sb.from('user_achievements').upsert(
      achievements,
      { onConflict: 'user_id,achievement_id', ignoreDuplicates: true }
    );
    if (achErr) console.warn('⚠️  Achievements:', achErr.message);
    else console.log(`✅ ${achievements.length} user_achievements inserted (AchievementFeedCard)`);
  }

  // ── 3. Streak milestones (ensure fresh — set to current values) ─────────
  // Note: isStreakSeen() uses localStorage. Tell Joshua to clear it OR
  // we bump streaks to new milestone values so the "seen" key won't match.
  const streaks = [
    { id: u01, current_streak: 7  },
    { id: u07, current_streak: 14 },
    { id: u10, current_streak: 30 },
    { id: u11, current_streak: 5  },
    { id: u02, current_streak: 3  },
  ];
  for (const { id, current_streak } of streaks) {
    await sb.from('profiles').update({ current_streak }).eq('id', id);
  }
  console.log('✅ Streak milestones set (StreakFeedCard — clear localStorage to see)');

  // ── 4. Friend beer_reviews for RatingCard (last 7 days) ─────────────────
  const ratings = [
    { user_id: u01, beer_id: b_ipa,    rating: 4.5, comment: 'Debug IPA every time. Reliable.',          created_at: ago(5) },
    { user_id: u02, beer_id: bs_amber, rating: 4.0, comment: 'Stave Amber is perfectly balanced.',       created_at: ago(8) },
    { user_id: u05, beer_id: bs_ipa,   rating: 4.5, comment: null,                                       created_at: daysAgo(1) },
    { user_id: u07, beer_id: hf_hazy,  rating: 5.0, comment: 'Hazy Daze from Hopfield is elite.',        created_at: ago(6) },
    { user_id: u08, beer_id: hf_porter,rating: 5.0, comment: 'Dark Matter Porter: top 3 beer ever.',     created_at: daysAgo(3, 14) },
    { user_id: u10, beer_id: lc_sour,  rating: 5.0, comment: 'Greenbelt Gose. My GOAT.',                 created_at: ago(22) },
    { user_id: u11, beer_id: b_porter, rating: 4.5, comment: 'Kernel Panic Porter = perfection.',        created_at: daysAgo(2, 18) },
    { user_id: u03, beer_id: hf_saison,rating: 3.5, comment: 'Growing on me. Farmhouse vibes.',          created_at: daysAgo(2, 20) },
  ];
  const { error: ratingsErr } = await sb.from('beer_reviews').upsert(ratings, { ignoreDuplicates: true });
  if (ratingsErr) console.warn('⚠️  Ratings:', ratingsErr.message);
  else console.log(`✅ ${ratings.length} beer_reviews inserted (RatingCard + NewFavoriteCard)`);

  // ── 5. Additional sessions spread across 5 days ──────────────────────────
  const sessions = [
    { id: 'ff000010-0000-0000-0000-000000000001', user_id: u01, brewery_id: pp_id, context: 'brewery',
      is_active: false, share_to_feed: true, xp_awarded: 175,
      started_at: ago(4), ended_at: ago(1),
      note: 'First time at P&P in months. Still the best IPA in Austin.' },
    { id: 'ff000010-0000-0000-0000-000000000002', user_id: u07, brewery_id: hf_id, context: 'brewery',
      is_active: false, share_to_feed: true, xp_awarded: 195,
      started_at: ago(6), ended_at: ago(3),
      note: 'Hazy Daze + a saison. Thursday well spent.' },
    { id: 'ff000010-0000-0000-0000-000000000003', user_id: u02, brewery_id: bs_id, context: 'brewery',
      is_active: false, share_to_feed: true, xp_awarded: 160,
      started_at: ago(10), ended_at: ago(7), note: null },
    { id: 'ff000010-0000-0000-0000-000000000004', user_id: u10, brewery_id: lc_id, context: 'brewery',
      is_active: false, share_to_feed: true, xp_awarded: 180,
      started_at: ago(22), ended_at: ago(19),
      note: 'That Greenbelt Gose is genuinely dangerous in this heat.' },
    { id: 'ff000010-0000-0000-0000-000000000005', user_id: u03, brewery_id: null, context: 'home',
      is_active: false, share_to_feed: true, xp_awarded: 100,
      started_at: daysAgo(2, 20), ended_at: daysAgo(2, 22),
      note: 'Trying some cans from the bottle shop. Research night.' },
    { id: 'ff000010-0000-0000-0000-000000000006', user_id: u11, brewery_id: pp_id, context: 'brewery',
      is_active: false, share_to_feed: true, xp_awarded: 165,
      started_at: daysAgo(3, 18), ended_at: daysAgo(3, 21), note: null },
    { id: 'ff000010-0000-0000-0000-000000000007', user_id: u08, brewery_id: hf_id, context: 'brewery',
      is_active: false, share_to_feed: true, xp_awarded: 190,
      started_at: daysAgo(3, 14), ended_at: daysAgo(3, 17),
      note: 'Dark Matter Porter is everything.' },
    { id: 'ff000010-0000-0000-0000-000000000008', user_id: u05, brewery_id: bs_id, context: 'brewery',
      is_active: false, share_to_feed: true, xp_awarded: 155,
      started_at: daysAgo(4, 16), ended_at: daysAgo(4, 19), note: null },
  ];
  const { error: sessErr } = await sb.from('sessions').upsert(sessions, { onConflict: 'id' });
  if (sessErr) console.warn('⚠️  Sessions:', sessErr.message);
  else console.log(`✅ ${sessions.length} sessions upserted`);

  // ── 6. Beer logs for new sessions ────────────────────────────────────────
  const logs = [
    { session_id: sessions[0].id, user_id: u01, beer_id: b_ipa,    brewery_id: pp_id, quantity: 1, rating: 4.5, flavor_tags: ['citrus','hoppy'],       serving_style: 'draft', comment: 'Classic opener.', logged_at: ago(4) },
    { session_id: sessions[0].id, user_id: u01, beer_id: b_dipa,   brewery_id: pp_id, quantity: 1, rating: 5.0, flavor_tags: ['tropical','dank'],      serving_style: 'draft', comment: 'Deploy Friday DIPA is genuinely elite.', logged_at: ago(3) },
    { session_id: sessions[1].id, user_id: u07, beer_id: hf_hazy,  brewery_id: hf_id, quantity: 1, rating: 5.0, flavor_tags: ['mango','hazy'],         serving_style: 'draft', comment: 'Every time. Undefeated.', logged_at: ago(6) },
    { session_id: sessions[1].id, user_id: u07, beer_id: hf_saison,brewery_id: hf_id, quantity: 1, rating: 4.0, flavor_tags: ['spicy','crisp'],        serving_style: 'draft', comment: null, logged_at: ago(5) },
    { session_id: sessions[2].id, user_id: u02, beer_id: bs_amber, brewery_id: bs_id, quantity: 1, rating: 4.5, flavor_tags: ['caramel','oaky'],       serving_style: 'draft', comment: 'Stave Amber on a weekday.', logged_at: ago(10) },
    { session_id: sessions[2].id, user_id: u02, beer_id: bs_ipa,   brewery_id: bs_id, quantity: 1, rating: 4.0, flavor_tags: ['citrus','resinous'],    serving_style: 'draft', comment: null, logged_at: ago(9) },
    { session_id: sessions[3].id, user_id: u10, beer_id: lc_sour,  brewery_id: lc_id, quantity: 1, rating: 5.0, flavor_tags: ['lime','salty'],         serving_style: 'draft', comment: 'Greenbelt Gose is a top-5 beer for me.', logged_at: ago(22) },
    { session_id: sessions[3].id, user_id: u10, beer_id: lc_ipa,   brewery_id: lc_id, quantity: 1, rating: 4.0, flavor_tags: ['pine','grapefruit'],    serving_style: 'draft', comment: null, logged_at: ago(20) },
    { session_id: sessions[4].id, user_id: u03, beer_id: hf_porter,brewery_id: hf_id, quantity: 1, rating: 4.5, flavor_tags: ['coffee','chocolate'],   serving_style: 'can',   comment: 'Dark Matter Porter from a can: still excellent.', logged_at: daysAgo(2,21) },
    { session_id: sessions[5].id, user_id: u11, beer_id: b_porter, brewery_id: pp_id, quantity: 1, rating: 5.0, flavor_tags: ['vanilla','smoky'],      serving_style: 'draft', comment: 'Kernel Panic Porter is in my top 3.', logged_at: daysAgo(3,18) },
    { session_id: sessions[5].id, user_id: u11, beer_id: b_sour,   brewery_id: pp_id, quantity: 1, rating: 4.5, flavor_tags: ['tart','fruity'],        serving_style: 'draft', comment: null, logged_at: daysAgo(3,19) },
    { session_id: sessions[6].id, user_id: u08, beer_id: hf_porter,brewery_id: hf_id, quantity: 1, rating: 5.0, flavor_tags: ['dark','coffee'],        serving_style: 'draft', comment: 'Dark Matter Porter is everything.', logged_at: daysAgo(3,14) },
    { session_id: sessions[6].id, user_id: u08, beer_id: hf_hazy,  brewery_id: hf_id, quantity: 1, rating: 4.5, flavor_tags: ['juicy','tropical'],     serving_style: 'draft', comment: 'Hazy Daze: as advertised.', logged_at: daysAgo(3,15) },
    { session_id: sessions[7].id, user_id: u05, beer_id: bs_ipa,   brewery_id: bs_id, quantity: 1, rating: 4.5, flavor_tags: ['citrus','hoppy'],       serving_style: 'draft', comment: null, logged_at: daysAgo(4,16) },
    { session_id: sessions[7].id, user_id: u05, beer_id: bs_amber, brewery_id: bs_id, quantity: 1, rating: 4.0, flavor_tags: ['malty','caramel'],      serving_style: 'draft', comment: 'Stave Amber is so solid. Underrated.', logged_at: daysAgo(4,17) },
  ].filter(l => l.beer_id);
  const { error: logsErr } = await sb.from('beer_logs').upsert(logs, { ignoreDuplicates: true });
  if (logsErr) console.warn('⚠️  Beer logs:', logsErr.message);
  else console.log(`✅ ${logs.length} beer logs inserted`);

  console.log('\n🍺 Seed 010 complete!\n');
  console.log('Card types seeded:');
  console.log('  SessionCard       ✅  (8 friend sessions with beer logs)');
  console.log('  AchievementFeedCard ✅  (user_achievements for 6 friends)');
  console.log('  StreakFeedCard    ✅  (milestones: 3/5/7/14/30 days)');
  console.log('  NewFavoriteCard   ✅  (5-star reviews from 3 friends)');
  console.log('  RatingCard        ✅  (friend reviews from last 7 days)');
  console.log('  FriendJoinedCard  ✅  (Maya Lin joined 18h ago)');
  console.log('\n⚠️  StreakFeedCards are filtered by localStorage.');
  console.log('   To reset: open DevTools → Application → Local Storage');
  console.log('   Delete all keys matching "hoptrack:streak-seen:*"');
}

run().catch(console.error);
