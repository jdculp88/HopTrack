-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 043: Beers for Real US Breweries (migration 042)
-- 6 beers per city cluster (top brewery in each city) = 60 beers
-- Styles, ABVs, IBUs, glass types, prices, and tap status realistic.
-- Safe to re-run (ON CONFLICT DO UPDATE).  Run AFTER migration 042.
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  -- Asheville — Burial Beer Co. (avl_01)
  b_avl_01 uuid := 'ff000001-0001-0000-0000-000000000001';
  b_avl_02 uuid := 'ff000001-0001-0000-0000-000000000002';
  b_avl_03 uuid := 'ff000001-0001-0000-0000-000000000003';
  b_avl_04 uuid := 'ff000001-0001-0000-0000-000000000004';
  b_avl_05 uuid := 'ff000001-0001-0000-0000-000000000005';
  b_avl_06 uuid := 'ff000001-0001-0000-0000-000000000006';

  -- Portland — Great Notion (pdx_01)
  b_pdx_01 uuid := 'ff000001-0002-0000-0000-000000000001';
  b_pdx_02 uuid := 'ff000001-0002-0000-0000-000000000002';
  b_pdx_03 uuid := 'ff000001-0002-0000-0000-000000000003';
  b_pdx_04 uuid := 'ff000001-0002-0000-0000-000000000004';
  b_pdx_05 uuid := 'ff000001-0002-0000-0000-000000000005';
  b_pdx_06 uuid := 'ff000001-0002-0000-0000-000000000006';

  -- San Diego — North Park Beer Co. (sd_02)
  b_sd_01 uuid := 'ff000001-0003-0000-0000-000000000001';
  b_sd_02 uuid := 'ff000001-0003-0000-0000-000000000002';
  b_sd_03 uuid := 'ff000001-0003-0000-0000-000000000003';
  b_sd_04 uuid := 'ff000001-0003-0000-0000-000000000004';
  b_sd_05 uuid := 'ff000001-0003-0000-0000-000000000005';
  b_sd_06 uuid := 'ff000001-0003-0000-0000-000000000006';

  -- Denver — Ratio Beerworks (den_02)
  b_den_01 uuid := 'ff000001-0004-0000-0000-000000000001';
  b_den_02 uuid := 'ff000001-0004-0000-0000-000000000002';
  b_den_03 uuid := 'ff000001-0004-0000-0000-000000000003';
  b_den_04 uuid := 'ff000001-0004-0000-0000-000000000004';
  b_den_05 uuid := 'ff000001-0004-0000-0000-000000000005';
  b_den_06 uuid := 'ff000001-0004-0000-0000-000000000006';

  -- Austin — Lazarus Brewing (atx_01)
  b_atx_01 uuid := 'ff000001-0005-0000-0000-000000000001';
  b_atx_02 uuid := 'ff000001-0005-0000-0000-000000000002';
  b_atx_03 uuid := 'ff000001-0005-0000-0000-000000000003';
  b_atx_04 uuid := 'ff000001-0005-0000-0000-000000000004';
  b_atx_05 uuid := 'ff000001-0005-0000-0000-000000000005';
  b_atx_06 uuid := 'ff000001-0005-0000-0000-000000000006';

  -- Chicago — Half Acre Beer (chi_01)
  b_chi_01 uuid := 'ff000001-0006-0000-0000-000000000001';
  b_chi_02 uuid := 'ff000001-0006-0000-0000-000000000002';
  b_chi_03 uuid := 'ff000001-0006-0000-0000-000000000003';
  b_chi_04 uuid := 'ff000001-0006-0000-0000-000000000004';
  b_chi_05 uuid := 'ff000001-0006-0000-0000-000000000005';
  b_chi_06 uuid := 'ff000001-0006-0000-0000-000000000006';

  -- Brooklyn — Other Half (bk_01)
  b_bk_01 uuid := 'ff000001-0007-0000-0000-000000000001';
  b_bk_02 uuid := 'ff000001-0007-0000-0000-000000000002';
  b_bk_03 uuid := 'ff000001-0007-0000-0000-000000000003';
  b_bk_04 uuid := 'ff000001-0007-0000-0000-000000000004';
  b_bk_05 uuid := 'ff000001-0007-0000-0000-000000000005';
  b_bk_06 uuid := 'ff000001-0007-0000-0000-000000000006';

  -- Nashville — Southern Grist (nas_01)
  b_nas_01 uuid := 'ff000001-0008-0000-0000-000000000001';
  b_nas_02 uuid := 'ff000001-0008-0000-0000-000000000002';
  b_nas_03 uuid := 'ff000001-0008-0000-0000-000000000003';
  b_nas_04 uuid := 'ff000001-0008-0000-0000-000000000004';
  b_nas_05 uuid := 'ff000001-0008-0000-0000-000000000005';
  b_nas_06 uuid := 'ff000001-0008-0000-0000-000000000006';

  -- Seattle — Cloudburst Brewing (sea_01)
  b_sea_01 uuid := 'ff000001-0009-0000-0000-000000000001';
  b_sea_02 uuid := 'ff000001-0009-0000-0000-000000000002';
  b_sea_03 uuid := 'ff000001-0009-0000-0000-000000000003';
  b_sea_04 uuid := 'ff000001-0009-0000-0000-000000000004';
  b_sea_05 uuid := 'ff000001-0009-0000-0000-000000000005';
  b_sea_06 uuid := 'ff000001-0009-0000-0000-000000000006';

  -- Burlington — Foam Brewers (bvt_01)
  b_bvt_01 uuid := 'ff000001-0010-0000-0000-000000000001';
  b_bvt_02 uuid := 'ff000001-0010-0000-0000-000000000002';
  b_bvt_03 uuid := 'ff000001-0010-0000-0000-000000000003';
  b_bvt_04 uuid := 'ff000001-0010-0000-0000-000000000004';
  b_bvt_05 uuid := 'ff000001-0010-0000-0000-000000000005';
  b_bvt_06 uuid := 'ff000001-0010-0000-0000-000000000006';

BEGIN

INSERT INTO beers (id, brewery_id, name, style, abv, ibu, description, is_on_tap, display_order, price_per_pint, glass_type) VALUES

-- ── ASHEVILLE — Burial Beer Co. ─────────────────────────────────────────────
(b_avl_01, 'ee000001-0001-0000-0000-000000000001', 'Surf Wax', 'IPA', 6.8, 65,
 'West Coast-inspired IPA with Simcoe, Centennial, and Columbus hops. Resinous pine and grapefruit.', true, 1, 8.00, 'shaker_pint'),
(b_avl_02, 'ee000001-0001-0000-0000-000000000001', 'Shadowclock', 'Imperial Stout', 11.2, 55,
 'Bourbon barrel-aged imperial stout with coffee, dark chocolate, and vanilla. Released annually.', true, 2, 10.00, 'snifter'),
(b_avl_03, 'ee000001-0001-0000-0000-000000000001', 'Skillet', 'Blonde Ale', 5.0, 18,
 'Sessionable blonde ale with honey malt sweetness and a clean, dry finish.', true, 3, 7.00, 'shaker_pint'),
(b_avl_04, 'ee000001-0001-0000-0000-000000000001', 'Blade & Sheath', 'Saison', 6.2, 28,
 'Farmhouse saison with lemon zest, white pepper, and a bone-dry finish.', true, 4, 8.00, 'tulip'),
(b_avl_05, 'ee000001-0001-0000-0000-000000000001', 'Gang of Blades', 'Double IPA', 8.5, 80,
 'Aggressive double IPA with Citra and Mosaic. Tropical fruit bomb with a bitter backbone.', true, 5, 9.00, 'shaker_pint'),
(b_avl_06, 'ee000001-0001-0000-0000-000000000001', 'Hawkbill', 'Sour Ale', 5.5, 8,
 'Mixed-culture sour with passionfruit and guava. Tart, tropical, and crushable.', true, 6, 9.00, 'tulip'),

-- ── PORTLAND — Great Notion ─────────────────────────────────────────────────
(b_pdx_01, 'ee000001-0002-0000-0000-000000000001', 'Juice Jr.', 'Hazy IPA', 6.5, 40,
 'The gateway haze. Pillowy soft with Citra and Galaxy hops. Mango and tangerine all day.', true, 1, 8.00, 'shaker_pint'),
(b_pdx_02, 'ee000001-0002-0000-0000-000000000001', 'Blueberry Muffin', 'Fruited Sour', 5.8, 10,
 'Smoothie-style sour that literally tastes like a blueberry muffin. Lactose, vanilla, blueberry.', true, 2, 9.00, 'tulip'),
(b_pdx_03, 'ee000001-0002-0000-0000-000000000001', 'Double Stack', 'Imperial Stout', 11.0, 50,
 'Maple, vanilla, and coffee imperial stout. Pancake breakfast in a glass.', true, 3, 10.00, 'snifter'),
(b_pdx_04, 'ee000001-0002-0000-0000-000000000001', 'Ripe', 'Fruited IPA', 7.2, 45,
 'Triple dry-hopped IPA with peach and apricot puree. Dangerously drinkable for the ABV.', true, 4, 9.00, 'shaker_pint'),
(b_pdx_05, 'ee000001-0002-0000-0000-000000000001', 'Fluffy', 'Hazy Pale Ale', 5.2, 30,
 'Session haze with oat milk softness. Citra and El Dorado. The perfect first beer.', true, 5, 7.00, 'shaker_pint'),
(b_pdx_06, 'ee000001-0002-0000-0000-000000000001', 'Lemon Meringue Pie', 'Fruited Sour', 5.5, 8,
 'Pastry sour with lemon curd, vanilla, and graham cracker. Dessert in a tulip glass.', true, 6, 9.00, 'tulip'),

-- ── SAN DIEGO — North Park Beer Co. ────────────────────────────────────────
(b_sd_01, 'ee000001-0003-0000-0000-000000000002', 'Hop-Fu!', 'IPA', 7.0, 70,
 'Award-winning West Coast IPA. Citrus, pine, and a clean bitter finish. San Diego in a glass.', true, 1, 8.00, 'shaker_pint'),
(b_sd_02, 'ee000001-0003-0000-0000-000000000002', 'North Parker', 'Session IPA', 4.8, 45,
 'Neighborhood session IPA. Light body, big hop flavor, all-day drinkable.', true, 2, 7.00, 'shaker_pint'),
(b_sd_03, 'ee000001-0003-0000-0000-000000000002', 'Toasted Coconut Porter', 'Porter', 5.8, 30,
 'Rich porter with real toasted coconut. Chocolate and caramel malt base.', true, 3, 8.00, 'nonic_pint'),
(b_sd_04, 'ee000001-0003-0000-0000-000000000002', 'Sidewinder', 'Hazy IPA', 6.5, 50,
 'New England-style with El Dorado and Strata hops. Peach, stone fruit, and pillow-soft.', true, 4, 8.00, 'shaker_pint'),
(b_sd_05, 'ee000001-0003-0000-0000-000000000002', 'Guava Gose', 'Gose', 4.5, 12,
 'Tart wheat beer with guava, coriander, and sea salt. Perfect for a sunny North Park afternoon.', true, 5, 7.00, 'weizen'),
(b_sd_06, 'ee000001-0003-0000-0000-000000000002', 'Anniversary DIPA', 'Double IPA', 8.8, 85,
 'Annual release double IPA with rotating hop bill. Bold, resinous, and celebratory.', true, 6, 10.00, 'shaker_pint'),

-- ── DENVER — Ratio Beerworks ────────────────────────────────────────────────
(b_den_01, 'ee000001-0004-0000-0000-000000000002', 'Antidote', 'IPA', 6.2, 60,
 'Flagship IPA with Centennial and Citra. Balanced, approachable, endlessly crushable.', true, 1, 7.00, 'shaker_pint'),
(b_den_02, 'ee000001-0004-0000-0000-000000000002', 'Hold Steady', 'Amber Ale', 5.5, 35,
 'Toasty amber with caramel malt and Cascade hops. Reliable as a Denver sunset.', true, 2, 7.00, 'nonic_pint'),
(b_den_03, 'ee000001-0004-0000-0000-000000000002', 'Genius Wizard', 'Imperial Stout', 10.8, 50,
 'Massive stout with coffee, cacao nibs, and vanilla. The RiNo nightcap.', true, 3, 10.00, 'snifter'),
(b_den_04, 'ee000001-0004-0000-0000-000000000002', 'Dear You', 'French Saison', 7.2, 25,
 'Dry, peppery saison with Belgian yeast and a hint of orange peel. Effervescent.', true, 4, 8.00, 'tulip'),
(b_den_05, 'ee000001-0004-0000-0000-000000000002', 'New Wave', 'Hazy IPA', 6.8, 45,
 'Modern hazy with Mosaic and Galaxy. Juicy, soft, and unapologetically trendy.', true, 5, 8.00, 'shaker_pint'),
(b_den_06, 'ee000001-0004-0000-0000-000000000002', 'Repeater', 'Kolsch', 4.8, 20,
 'Clean German-style Kolsch. Crisp, light, and the patio beer of choice.', true, 6, 6.00, 'pilsner'),

-- ── AUSTIN — Lazarus Brewing ────────────────────────────────────────────────
(b_atx_01, 'ee000001-0005-0000-0000-000000000001', 'Bomba', 'Belgian Blonde', 6.5, 22,
 'Belgian blonde with coriander and agave. Smooth, spicy, and perfect with tacos.', true, 1, 7.00, 'tulip'),
(b_atx_02, 'ee000001-0005-0000-0000-000000000001', 'El Sendero', 'Mexican Lager', 4.5, 15,
 'Crisp Mexican-style lager with flaked corn. Light, clean, and made for Texas heat.', true, 2, 6.00, 'pilsner'),
(b_atx_03, 'ee000001-0005-0000-0000-000000000001', 'Rise Up', 'Coffee Stout', 6.0, 30,
 'Cold-brewed with local roasters. Chocolate, espresso, and a silky mouthfeel.', true, 3, 8.00, 'nonic_pint'),
(b_atx_04, 'ee000001-0005-0000-0000-000000000001', 'Tepache Sour', 'Fruited Sour', 5.0, 8,
 'House-fermented pineapple tepache blended with kettle sour. Tart, tropical, and uniquely Lazarus.', true, 4, 8.00, 'tulip'),
(b_atx_05, 'ee000001-0005-0000-0000-000000000001', 'Resurrection', 'IPA', 7.0, 65,
 'West Coast IPA with Simcoe and Amarillo. Piney, citrusy, and resinous.', true, 5, 8.00, 'shaker_pint'),
(b_atx_06, 'ee000001-0005-0000-0000-000000000001', 'Luz', 'Witbier', 4.8, 14,
 'Wheat ale with orange peel and chamomile. Hazy, floral, and easy-going.', true, 6, 7.00, 'weizen'),

-- ── CHICAGO — Half Acre Beer ────────────────────────────────────────────────
(b_chi_01, 'ee000001-0006-0000-0000-000000000001', 'Daisy Cutter', 'Pale Ale', 5.2, 55,
 'Chicago flagship. Centennial and Cascade hops, biscuit malt, dry as the lakefront wind.', true, 1, 7.00, 'shaker_pint'),
(b_chi_02, 'ee000001-0006-0000-0000-000000000001', 'Vallejo', 'IPA', 6.9, 68,
 'Bold IPA named after the Bay Area. Pine, grapefruit, and a firm malt backbone.', true, 2, 8.00, 'shaker_pint'),
(b_chi_03, 'ee000001-0006-0000-0000-000000000001', 'Big Hugs', 'Imperial Stout', 10.5, 50,
 'Annual release barrel-aged imperial stout. Chocolate, bourbon, vanilla, and warmth.', true, 3, 12.00, 'snifter'),
(b_chi_04, 'ee000001-0006-0000-0000-000000000001', 'Pony Pilsner', 'Pilsner', 5.0, 35,
 'Czech-style pilsner with Saaz hops. Clean, snappy, and the definition of refreshing.', true, 4, 6.00, 'pilsner'),
(b_chi_05, 'ee000001-0006-0000-0000-000000000001', 'Bodem', 'Belgian IPA', 7.5, 50,
 'Belgian IPA hybrid. Fruity yeast esters meet American hop character. Complex and compelling.', true, 5, 8.00, 'tulip'),
(b_chi_06, 'ee000001-0006-0000-0000-000000000001', 'Tuna', 'Extra Pale Ale', 4.5, 40,
 'Sessionable pale with Citra hops. Named after the neighborhood cat. Light, bright, and beloved.', true, 6, 6.00, 'shaker_pint'),

-- ── BROOKLYN — Other Half ───────────────────────────────────────────────────
(b_bk_01, 'ee000001-0007-0000-0000-000000000001', 'Green Diamonds', 'Double IPA', 8.5, 70,
 'Flagship DIPA. Galaxy, Citra, and Columbus. Tropical, dank, and endlessly complex.', true, 1, 10.00, 'shaker_pint'),
(b_bk_02, 'ee000001-0007-0000-0000-000000000001', 'All Citra Everything', 'IPA', 7.0, 65,
 'Single-hop showcase. Pure mango, passionfruit, and grapefruit from 100% Citra hops.', true, 2, 9.00, 'shaker_pint'),
(b_bk_03, 'ee000001-0007-0000-0000-000000000001', 'Broccoli', 'Imperial IPA', 10.5, 80,
 'Massive hop overload. Triple dry-hopped with Nelson and Motueka. Deceptively drinkable.', true, 3, 12.00, 'shaker_pint'),
(b_bk_04, 'ee000001-0007-0000-0000-000000000001', 'Cream Dream', 'Cream Ale', 5.0, 18,
 'Silky cream ale with flaked corn and honey malt. The approachable option in a hype lineup.', true, 4, 7.00, 'nonic_pint'),
(b_bk_05, 'ee000001-0007-0000-0000-000000000001', 'Maple Syrup Morning', 'Imperial Stout', 12.0, 55,
 'Barrel-aged imperial stout with Vermont maple syrup and Ceylon cinnamon. Brunch decadence.', true, 5, 14.00, 'snifter'),
(b_bk_06, 'ee000001-0007-0000-0000-000000000001', 'Small Green Diamonds', 'Session IPA', 4.5, 40,
 'The little sibling. Same hop bill as Green Diamonds, half the ABV. All-day crusher.', true, 6, 7.00, 'shaker_pint'),

-- ── NASHVILLE — Southern Grist ──────────────────────────────────────────────
(b_nas_01, 'ee000001-0008-0000-0000-000000000001', 'Mango Guava Hill', 'Fruited Sour', 5.8, 8,
 'Smoothie sour with mango, guava, and a hint of vanilla. Tropical explosion.', true, 1, 9.00, 'tulip'),
(b_nas_02, 'ee000001-0008-0000-0000-000000000001', 'Crowler King', 'Hazy IPA', 6.8, 50,
 'Pillowy haze with Citra, Galaxy, and Nelson Sauvin. The Nashville line-sitter.', true, 2, 8.00, 'shaker_pint'),
(b_nas_03, 'ee000001-0008-0000-0000-000000000001', 'Banana Pudding', 'Pastry Stout', 10.0, 40,
 'Imperial stout with banana, vanilla wafer, and lactose. The dessert special.', true, 3, 11.00, 'snifter'),
(b_nas_04, 'ee000001-0008-0000-0000-000000000001', 'Brut Rose', 'Fruited Saison', 6.5, 15,
 'Dry saison refermented with raspberries and rose hips. Pink, effervescent, elegant.', true, 4, 9.00, 'tulip'),
(b_nas_05, 'ee000001-0008-0000-0000-000000000001', 'Table Beer', 'Belgian Table Beer', 3.8, 20,
 'Low-ABV Belgian-style table beer. Biscuit, honey, and a dry finish. Lunchtime appropriate.', true, 5, 5.00, 'tulip'),
(b_nas_06, 'ee000001-0008-0000-0000-000000000001', 'Marathon', 'Lager', 4.6, 22,
 'Clean, crisp lager. No tricks, no gimmicks. Just a really well-made beer.', true, 6, 6.00, 'pilsner'),

-- ── SEATTLE — Cloudburst Brewing ────────────────────────────────────────────
(b_sea_01, 'ee000001-0009-0000-0000-000000000001', 'Good As It Gets', 'IPA', 6.2, 55,
 'West Coast meets modern. Simcoe, Mosaic, and Strata. Pine and tropical fruit in equal measure.', true, 1, 8.00, 'shaker_pint'),
(b_sea_02, 'ee000001-0009-0000-0000-000000000001', 'Lucid', 'Hazy IPA', 6.8, 45,
 'Pillowy haze with Citra and El Dorado. The Pacific Northwest in a glass.', true, 2, 8.00, 'shaker_pint'),
(b_sea_03, 'ee000001-0009-0000-0000-000000000001', 'Rain City Pils', 'Pilsner', 5.0, 30,
 'Czech-style pilsner with Saaz hops. Crisp, clean, and appropriately named.', true, 3, 6.00, 'pilsner'),
(b_sea_04, 'ee000001-0009-0000-0000-000000000001', 'Dark Star', 'Stout', 6.5, 40,
 'American stout with roasted barley and Chinook hops. Coffee and dark chocolate notes.', true, 4, 8.00, 'nonic_pint'),
(b_sea_05, 'ee000001-0009-0000-0000-000000000001', 'Squeeze', 'Fruited Pale Ale', 5.5, 30,
 'Pale ale with tangerine zest. Bright, citrusy, and perfect for a rare sunny Seattle day.', true, 5, 7.00, 'shaker_pint'),
(b_sea_06, 'ee000001-0009-0000-0000-000000000001', 'Forecast', 'Double IPA', 8.2, 75,
 'Pacific Northwest DIPA with Simcoe, Centennial, and Amarillo. Resinous and bold.', true, 6, 9.00, 'shaker_pint'),

-- ── BURLINGTON — Foam Brewers ───────────────────────────────────────────────
(b_bvt_01, 'ee000001-0010-0000-0000-000000000001', 'Refractions', 'Hazy IPA', 6.5, 45,
 'Rotating hazy IPA series. Always different hops, always crushable. The Foam signature.', true, 1, 8.00, 'shaker_pint'),
(b_bvt_02, 'ee000001-0010-0000-0000-000000000001', 'Even More Things', 'Double IPA', 8.0, 60,
 'Hazy DIPA with Citra, Mosaic, and Nelson. Rich, tropical, and dangerously smooth.', true, 2, 10.00, 'shaker_pint'),
(b_bvt_03, 'ee000001-0010-0000-0000-000000000001', 'Biere de Coupage', 'Wild Ale', 6.0, 10,
 'Mixed-culture wild ale aged in oak. Funky, tart, and deeply complex.', true, 3, 12.00, 'tulip'),
(b_bvt_04, 'ee000001-0010-0000-0000-000000000001', 'Lake Effect', 'Pilsner', 4.8, 30,
 'Crisp pilsner inspired by Lake Champlain winds. Saaz and Hallertau hops. Clean and dry.', true, 4, 6.00, 'pilsner'),
(b_bvt_05, 'ee000001-0010-0000-0000-000000000001', 'Night Shift', 'Stout', 5.5, 35,
 'Dry stout with oat and roasted barley. Coffee and dark chocolate. A Vermont fireplace beer.', true, 5, 7.00, 'nonic_pint'),
(b_bvt_06, 'ee000001-0010-0000-0000-000000000001', 'Saison de Foam', 'Saison', 6.2, 22,
 'Farmhouse saison with local honey and cracked pepper. Dry, spicy, and effervescent.', true, 6, 8.00, 'tulip')

ON CONFLICT (id) DO UPDATE SET
  brewery_id = EXCLUDED.brewery_id,
  name = EXCLUDED.name,
  style = EXCLUDED.style,
  abv = EXCLUDED.abv,
  ibu = EXCLUDED.ibu,
  description = EXCLUDED.description,
  is_on_tap = EXCLUDED.is_on_tap,
  display_order = EXCLUDED.display_order,
  price_per_pint = EXCLUDED.price_per_pint,
  glass_type = EXCLUDED.glass_type;

END $$;
