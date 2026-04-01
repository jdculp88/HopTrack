-- Sprint 114: Role hierarchy + promotion code redemption
-- Roles: admin (owner), business (analytics/billing), marketing (content/promos), staff (punch codes only)
-- Adds "promotion" redemption type for ad/promo codes
-- Adds POS reference code for brewery POS tracking

-- 1. Expand brewery_accounts role to new hierarchy
-- admin = owner (full access)
-- business = analytics, billing, staff management (no danger zone)
-- marketing = tap list, promos, events, messages, ads (no billing/settings)
-- staff = code confirmation only (bar staff)
ALTER TABLE brewery_accounts DROP CONSTRAINT IF EXISTS brewery_accounts_role_check;
ALTER TABLE brewery_accounts ADD CONSTRAINT brewery_accounts_role_check
  CHECK (role IN ('owner', 'business', 'marketing', 'staff'));

-- 2. Expand redemption_codes type to include 'promotion'
ALTER TABLE redemption_codes DROP CONSTRAINT IF EXISTS redemption_codes_type_check;
ALTER TABLE redemption_codes ADD CONSTRAINT redemption_codes_type_check
  CHECK (type IN ('loyalty_reward', 'mug_club_perk', 'promotion'));

-- 3. Add POS reference code to redemption_codes (shown after confirmation)
ALTER TABLE redemption_codes
  ADD COLUMN IF NOT EXISTS pos_reference text,
  ADD COLUMN IF NOT EXISTS promo_description text,
  ADD COLUMN IF NOT EXISTS promotion_id uuid REFERENCES promotions(id) ON DELETE SET NULL;

-- 4. Update RLS: all brewery roles can confirm redemption codes
DROP POLICY IF EXISTS "redemption_codes_update_staff" ON redemption_codes;
CREATE POLICY "redemption_codes_update_staff" ON redemption_codes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM brewery_accounts
      WHERE brewery_accounts.brewery_id = redemption_codes.brewery_id
        AND brewery_accounts.user_id = auth.uid()
        AND brewery_accounts.role IN ('owner', 'business', 'marketing', 'staff')
    )
  );

-- 5. All brewery roles can view pending codes for their brewery
DROP POLICY IF EXISTS "redemption_codes_select_staff" ON redemption_codes;
CREATE POLICY "redemption_codes_select_staff" ON redemption_codes
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM brewery_accounts
      WHERE brewery_accounts.brewery_id = redemption_codes.brewery_id
        AND brewery_accounts.user_id = auth.uid()
        AND brewery_accounts.role IN ('owner', 'business', 'marketing', 'staff')
    )
  );

-- 6. Brewery_accounts management: admin (owner) and business can manage staff
DROP POLICY IF EXISTS "brewery_accounts_manage" ON brewery_accounts;
CREATE POLICY "brewery_accounts_manage" ON brewery_accounts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM brewery_accounts ba
      WHERE ba.brewery_id = brewery_accounts.brewery_id
        AND ba.user_id = auth.uid()
        AND ba.role IN ('owner', 'business')
    )
    OR auth.uid() = user_id
  );

-- 7. Generate a POS reference code function (HT-XXXX format)
CREATE OR REPLACE FUNCTION generate_pos_reference()
RETURNS text
LANGUAGE plpgsql AS $$
DECLARE
  ref text;
BEGIN
  ref := 'HT-' || upper(substr(md5(random()::text), 1, 4));
  RETURN ref;
END;
$$;

-- 8. Set pos_reference on confirmation via trigger
CREATE OR REPLACE FUNCTION set_pos_reference_on_confirm()
RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status = 'confirmed' AND OLD.status = 'pending' AND NEW.pos_reference IS NULL THEN
    NEW.pos_reference := generate_pos_reference();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_pos_reference ON redemption_codes;
CREATE TRIGGER trg_pos_reference
  BEFORE UPDATE ON redemption_codes
  FOR EACH ROW
  EXECUTE FUNCTION set_pos_reference_on_confirm();

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
