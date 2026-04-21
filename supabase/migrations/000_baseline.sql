-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 000: Baseline schema (generated from prod via pg_dump on 2026-04-21)
-- Captures all pre-migration tables that were created by hand in the Supabase UI
-- before the migration discipline started (March 2026).
--
-- Self-contained: resets public schema + enables required extensions.
--
-- SAFETY: This migration contains DROP SCHEMA public CASCADE. It is intended to
-- run ONLY against a fresh (empty) environment. Both current prod and staging
-- have this migration marked applied in their supabase_migrations tracker, so
-- `supabase db push` skips it. The guard below blocks execution if the schema
-- is already populated, preventing accidental data loss if someone forgets to
-- mark the migration applied first.
-- ─────────────────────────────────────────────────────────────────────────────

-- Safety guard: refuse to run against a populated schema
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'breweries') THEN
    RAISE EXCEPTION 'REFUSING TO RUN migration 000_baseline: public.breweries already exists. This migration would DROP SCHEMA public CASCADE and destroy data. If this environment is already at the baselined state, mark 000 as applied so `supabase db push` skips it: `supabase migration repair --status applied 000`';
  END IF;
END $$;

-- Reset public schema (safe: only runs in fresh envs — guard above blocks otherwise)
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO anon, authenticated, service_role;

-- pg_trgm installed in public schema (prod convention — see 3 GIN indexes below)
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;

-- ─────────────────────────────────────────────────────────────────────────────
-- Dumped schema follows
-- ─────────────────────────────────────────────────────────────────────────────


--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: hop_route_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.hop_route_status AS ENUM (
    'draft',
    'active',
    'completed'
);


--
-- Name: participant_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.participant_status AS ENUM (
    'pending',
    'accepted',
    'declined'
);


--
-- Name: check_api_key_limit(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_api_key_limit() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF (
    SELECT COUNT(*) FROM api_keys
    WHERE brewery_id = NEW.brewery_id AND revoked_at IS NULL
  ) >= 5 THEN
    RAISE EXCEPTION 'Maximum of 5 active API keys per brewery';
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: cleanup_old_rate_limits(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.cleanup_old_rate_limits() RETURNS void
    LANGUAGE sql SECURITY DEFINER
    AS $$
  DELETE FROM notification_rate_limits
  WHERE sent_at < now() - interval '48 hours';
$$;


--
-- Name: decrement_checkins(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.decrement_checkins(p_user_id uuid) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_new_count integer;
BEGIN
  UPDATE profiles
  SET total_checkins = GREATEST(0, total_checkins - 1)
  WHERE id = p_user_id
  RETURNING total_checkins INTO v_new_count;

  RETURN jsonb_build_object('total_checkins', COALESCE(v_new_count, 0));
END;
$$;


--
-- Name: expire_old_redemption_codes(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.expire_old_redemption_codes() RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  UPDATE redemption_codes
  SET status = 'expired'
  WHERE status = 'pending'
    AND expires_at < now();
END;
$$;


--
-- Name: generate_pos_reference(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_pos_reference() RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
  ref text;
BEGIN
  ref := 'HT-' || upper(substr(md5(random()::text), 1, 4));
  RETURN ref;
END;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;


--
-- Name: increment_ad_clicks(uuid, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.increment_ad_clicks(ad_id_param uuid, cost_per_click integer DEFAULT 0) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  UPDATE brewery_ads
  SET clicks = clicks + 1,
      spent_cents = spent_cents + cost_per_click
  WHERE id = ad_id_param;
END;
$$;


--
-- Name: increment_ad_impressions(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.increment_ad_impressions(ad_id_param uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  UPDATE brewery_ads SET impressions = impressions + 1 WHERE id = ad_id_param;
END;
$$;


--
-- Name: increment_challenge_discovery_joins(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.increment_challenge_discovery_joins(challenge_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  UPDATE challenges
  SET joins_from_discovery = joins_from_discovery + 1
  WHERE id = challenge_id
    AND is_sponsored = true;
END;
$$;


--
-- Name: increment_challenge_impressions(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.increment_challenge_impressions(challenge_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  UPDATE challenges
  SET impressions = impressions + 1
  WHERE id = challenge_id
    AND is_sponsored = true
    AND is_active = true;
END;
$$;


--
-- Name: increment_xp(uuid, integer, integer, boolean, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.increment_xp(p_user_id uuid, p_xp_amount integer, p_new_level integer, p_is_first_visit boolean DEFAULT false, p_streak_updates jsonb DEFAULT NULL::jsonb) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_result jsonb;
  v_new_xp integer;
  v_new_level integer;
BEGIN
  -- Atomic increment — no read-modify-write race condition
  UPDATE profiles
  SET
    xp = xp + p_xp_amount,
    level = GREATEST(level, p_new_level),
    unique_breweries = CASE
      WHEN p_is_first_visit THEN unique_breweries + 1
      ELSE unique_breweries
    END,
    current_streak = CASE
      WHEN p_streak_updates IS NOT NULL THEN (p_streak_updates->>'current_streak')::integer
      ELSE current_streak
    END,
    longest_streak = CASE
      WHEN p_streak_updates IS NOT NULL THEN GREATEST(longest_streak, (p_streak_updates->>'current_streak')::integer)
      ELSE longest_streak
    END,
    last_session_date = CASE
      WHEN p_streak_updates IS NOT NULL THEN (p_streak_updates->>'last_session_date')::date
      ELSE last_session_date
    END
  WHERE id = p_user_id
  RETURNING xp, level INTO v_new_xp, v_new_level;

  v_result := jsonb_build_object(
    'xp', v_new_xp,
    'level', v_new_level
  );

  RETURN v_result;
END;
$$;


--
-- Name: is_brand_manager_or_owner(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_brand_manager_or_owner(p_brand_id uuid, p_user_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM brand_accounts
    WHERE brand_id = p_brand_id
      AND user_id = p_user_id
      AND role IN ('owner', 'brand_manager')
  );
$$;


--
-- Name: search_all(text, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.search_all(query text, max_results integer DEFAULT 5) RETURNS json
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT json_build_object(
    'beers', COALESCE((
      SELECT json_agg(row_to_json(beer_row))
      FROM (
        SELECT
          b.id,
          b.name,
          b.style::text,
          b.abv,
          b.brewery_id,
          br.name AS brewery_name
        FROM beers b
        JOIN breweries br ON br.id = b.brewery_id
        WHERE
          similarity(b.name, query) > 0.15
          OR b.name ILIKE '%' || query || '%'
        ORDER BY similarity(b.name, query) DESC
        LIMIT max_results
      ) beer_row
    ), '[]'::json),
    'breweries', COALESCE((
      SELECT json_agg(row_to_json(brewery_row))
      FROM (
        SELECT
          br.id,
          br.name,
          br.city,
          br.state,
          br.brewery_type::text,
          br.latitude,
          br.longitude
        FROM breweries br
        WHERE
          similarity(br.name, query) > 0.15
          OR br.name ILIKE '%' || query || '%'
          OR br.city ILIKE '%' || query || '%'
          OR br.state ILIKE '%' || query || '%'
        ORDER BY similarity(br.name, query) DESC
        LIMIT max_results
      ) brewery_row
    ), '[]'::json)
  );
$$;


--
-- Name: search_beers_fuzzy(text, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.search_beers_fuzzy(query text, max_results integer DEFAULT 10) RETURNS TABLE(id uuid, name text, style text, abv real, brewery_id uuid, brewery_name text)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT
    b.id,
    b.name,
    b.style::text,
    b.abv,
    b.brewery_id,
    br.name AS brewery_name
  FROM beers b
  JOIN breweries br ON br.id = b.brewery_id
  WHERE
    similarity(b.name, query) > 0.15
    OR b.name ILIKE '%' || query || '%'
  ORDER BY similarity(b.name, query) DESC
  LIMIT max_results;
$$;


--
-- Name: search_breweries_fuzzy(text, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.search_breweries_fuzzy(query text, max_results integer DEFAULT 10) RETURNS TABLE(id uuid, name text, city text, state text, brewery_type text, latitude double precision, longitude double precision)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT
    br.id,
    br.name,
    br.city,
    br.state,
    br.brewery_type::text,
    br.latitude,
    br.longitude
  FROM breweries br
  WHERE
    similarity(br.name, query) > 0.15
    OR br.name ILIKE '%' || query || '%'
    OR br.city ILIKE '%' || query || '%'
    OR br.state ILIKE '%' || query || '%'
  ORDER BY similarity(br.name, query) DESC
  LIMIT max_results;
$$;


--
-- Name: set_pos_reference_on_confirm(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_pos_reference_on_confirm() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF NEW.status = 'confirmed' AND OLD.status = 'pending' AND NEW.pos_reference IS NULL THEN
    NEW.pos_reference := generate_pos_reference();
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: sync_brewery_visits_on_session(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sync_brewery_visits_on_session() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  -- Skip home sessions (context='home', brewery_id NULL)
  IF NEW.brewery_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Upsert the visit row. On conflict, increment total_visits and update last_visit_at.
  -- first_visit_at stays as the original insert timestamp (preserved by DO UPDATE clause).
  INSERT INTO public.brewery_visits (
    user_id,
    brewery_id,
    total_visits,
    unique_beers_tried,
    first_visit_at,
    last_visit_at
  )
  VALUES (
    NEW.user_id,
    NEW.brewery_id,
    1,
    0,
    NEW.started_at,
    NEW.started_at
  )
  ON CONFLICT (user_id, brewery_id) DO UPDATE
    SET total_visits = public.brewery_visits.total_visits + 1,
        last_visit_at = GREATEST(public.brewery_visits.last_visit_at, EXCLUDED.last_visit_at);

  RETURN NEW;
END;
$$;


--
-- Name: sync_brewery_visits_unique_beers_on_beer_log(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sync_brewery_visits_unique_beers_on_beer_log() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  -- Skip if we don't have both a brewery_id AND a beer_id (can't track uniqueness)
  IF NEW.brewery_id IS NULL OR NEW.beer_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Only increment if this is the user's FIRST log of this beer AT THIS BREWERY.
  -- Check all other beer_logs for user+brewery+beer (excluding the current row).
  IF NOT EXISTS (
    SELECT 1 FROM public.beer_logs
    WHERE user_id = NEW.user_id
      AND brewery_id = NEW.brewery_id
      AND beer_id = NEW.beer_id
      AND id <> NEW.id
  ) THEN
    -- Ensure a brewery_visits row exists (session trigger creates it, but this
    -- handles the edge case of a beer_log inserted before a session for the brewery).
    INSERT INTO public.brewery_visits (
      user_id,
      brewery_id,
      total_visits,
      unique_beers_tried,
      first_visit_at,
      last_visit_at
    )
    VALUES (
      NEW.user_id,
      NEW.brewery_id,
      0,
      1,
      NEW.logged_at,
      NEW.logged_at
    )
    ON CONFLICT (user_id, brewery_id) DO UPDATE
      SET unique_beers_tried = public.brewery_visits.unique_beers_tried + 1;
  END IF;

  RETURN NEW;
END;
$$;


--
-- Name: sync_profile_unique_beers_on_beer_log(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sync_profile_unique_beers_on_beer_log() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  -- Skip free-form entries (no beer_id means we can't track uniqueness)
  IF NEW.beer_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Only increment if this is the user's FIRST log of this beer.
  -- Check ALL other beer_logs (including those in other sessions) for this user+beer.
  IF NOT EXISTS (
    SELECT 1 FROM public.beer_logs
    WHERE user_id = NEW.user_id
      AND beer_id = NEW.beer_id
      AND id <> NEW.id
  ) THEN
    UPDATE public.profiles
    SET unique_beers = unique_beers + 1
    WHERE id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$;


--
-- Name: update_brand_catalog_beers_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_brand_catalog_beers_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_event_rsvp_count(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_event_rsvp_count() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE brewery_events SET rsvp_count = rsvp_count + 1 WHERE id = NEW.event_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE brewery_events SET rsvp_count = GREATEST(0, rsvp_count - 1) WHERE id = OLD.event_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;


--
-- Name: update_pos_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_pos_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _archive_checkins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._archive_checkins (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    archived_at timestamp with time zone DEFAULT now(),
    total_rows integer,
    data jsonb
);


--
-- Name: achievements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.achievements (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    key text NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    icon text NOT NULL,
    xp_reward integer DEFAULT 50 NOT NULL,
    badge_color text NOT NULL,
    tier text NOT NULL,
    category text NOT NULL,
    CONSTRAINT achievements_category_check CHECK ((category = ANY (ARRAY['explorer'::text, 'variety'::text, 'quantity'::text, 'social'::text, 'time'::text, 'quality'::text]))),
    CONSTRAINT achievements_tier_check CHECK ((tier = ANY (ARRAY['bronze'::text, 'silver'::text, 'gold'::text, 'platinum'::text])))
);


--
-- Name: admin_actions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_actions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    admin_user_id uuid NOT NULL,
    action_type text NOT NULL,
    target_type text NOT NULL,
    target_id uuid,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: admin_user_notes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_user_notes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    admin_user_id uuid NOT NULL,
    content text DEFAULT ''::text NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: admin_user_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_user_tags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    tag text NOT NULL,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ai_recommendations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_recommendations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    recommendations jsonb DEFAULT '[]'::jsonb NOT NULL,
    generated_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    model_used text DEFAULT 'claude-haiku-4-5-20251001'::text NOT NULL,
    tokens_used integer
);


--
-- Name: ai_suggestions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_suggestions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    brewery_id uuid NOT NULL,
    suggestions jsonb DEFAULT '[]'::jsonb NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    generated_at timestamp with time zone DEFAULT now() NOT NULL,
    accepted_at timestamp with time zone,
    dismissed_at timestamp with time zone,
    model_used text DEFAULT 'claude-haiku-4-5-20251001'::text NOT NULL,
    tokens_used integer,
    cost_usd numeric(10,6),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ai_suggestions_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'dismissed'::text])))
);


--
-- Name: api_keys; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.api_keys (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    brewery_id uuid NOT NULL,
    created_by uuid NOT NULL,
    name text DEFAULT 'Default'::text NOT NULL,
    key_hash text NOT NULL,
    key_prefix text NOT NULL,
    last_used_at timestamp with time zone,
    revoked_at timestamp with time zone,
    rate_limit integer DEFAULT 100 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE api_keys; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.api_keys IS 'API keys for brewery access to HopTrack Public API v1';


--
-- Name: beer_list_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.beer_list_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    list_id uuid NOT NULL,
    beer_id uuid NOT NULL,
    note text,
    "position" integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: beer_lists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.beer_lists (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    is_public boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: beer_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.beer_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id uuid NOT NULL,
    user_id uuid NOT NULL,
    beer_id uuid,
    brewery_id uuid,
    rating numeric(2,1),
    flavor_tags text[],
    serving_style text,
    comment text,
    photo_url text,
    logged_at timestamp with time zone DEFAULT now() NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    CONSTRAINT beer_logs_rating_check CHECK (((rating IS NULL) OR ((rating >= 0.5) AND (rating <= 5.0))))
);


--
-- Name: beer_pour_sizes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.beer_pour_sizes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    beer_id uuid NOT NULL,
    label text NOT NULL,
    oz numeric,
    price numeric(5,2) NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    is_default boolean DEFAULT false NOT NULL
);


--
-- Name: beer_reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.beer_reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    beer_id uuid NOT NULL,
    rating numeric(2,1) NOT NULL,
    comment text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    is_flagged boolean DEFAULT false,
    flag_reason text,
    flagged_by uuid,
    flagged_at timestamp with time zone,
    moderation_status text DEFAULT 'active'::text,
    moderation_note text,
    moderated_at timestamp with time zone,
    moderated_by uuid,
    flavor_tags text[],
    CONSTRAINT beer_reviews_moderation_status_check CHECK ((moderation_status = ANY (ARRAY['active'::text, 'flagged'::text, 'removed'::text, 'cleared'::text]))),
    CONSTRAINT beer_reviews_rating_check CHECK (((rating >= 0.5) AND (rating <= 5.0)))
);


--
-- Name: beers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.beers (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    brewery_id uuid NOT NULL,
    name text NOT NULL,
    style text,
    abv numeric,
    ibu integer,
    description text,
    seasonal boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    cover_image_url text,
    avg_rating numeric,
    total_ratings integer DEFAULT 0 NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    is_domestic boolean DEFAULT false NOT NULL,
    is_on_tap boolean DEFAULT true NOT NULL,
    is_featured boolean DEFAULT false NOT NULL,
    display_order integer DEFAULT 0,
    is_86d boolean DEFAULT false,
    price_per_pint numeric(5,2),
    promo_text text,
    glass_type text,
    source text DEFAULT 'manual'::text,
    source_url text,
    last_verified_at timestamp with time zone,
    item_type text DEFAULT 'beer'::text NOT NULL,
    category text,
    pos_item_id text,
    pos_price_cents integer,
    pos_last_seen_at timestamp with time zone,
    barcode text,
    brand_catalog_beer_id uuid,
    tapped_at timestamp with time zone DEFAULT now(),
    srm integer,
    aroma_notes text[] DEFAULT '{}'::text[] NOT NULL,
    taste_notes text[] DEFAULT '{}'::text[] NOT NULL,
    finish_notes text[] DEFAULT '{}'::text[] NOT NULL,
    CONSTRAINT beers_item_type_check CHECK ((item_type = ANY (ARRAY['beer'::text, 'cider'::text, 'wine'::text, 'cocktail'::text, 'na_beverage'::text, 'food'::text]))),
    CONSTRAINT beers_source_check CHECK ((source = ANY (ARRAY['manual'::text, 'seed'::text, 'crawled'::text, 'ai_managed'::text]))),
    CONSTRAINT beers_srm_check CHECK (((srm IS NULL) OR ((srm >= 1) AND (srm <= 40))))
);


--
-- Name: brand_accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brand_accounts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    brand_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    invited_at timestamp with time zone,
    invited_by uuid,
    location_scope uuid[],
    CONSTRAINT brand_accounts_role_check CHECK ((role = ANY (ARRAY['owner'::text, 'brand_manager'::text, 'regional_manager'::text])))
);


--
-- Name: brand_catalog_beers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brand_catalog_beers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    brand_id uuid NOT NULL,
    name text NOT NULL,
    style text,
    abv numeric(4,2),
    ibu integer,
    description text,
    item_type text DEFAULT 'beer'::text NOT NULL,
    category text,
    glass_type text,
    cover_image_url text,
    seasonal boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    srm integer,
    aroma_notes text[] DEFAULT '{}'::text[] NOT NULL,
    taste_notes text[] DEFAULT '{}'::text[] NOT NULL,
    finish_notes text[] DEFAULT '{}'::text[] NOT NULL,
    CONSTRAINT brand_catalog_beers_item_type_check CHECK ((item_type = ANY (ARRAY['beer'::text, 'cider'::text, 'wine'::text, 'cocktail'::text, 'na_beverage'::text]))),
    CONSTRAINT brand_catalog_beers_srm_check CHECK (((srm IS NULL) OR ((srm >= 1) AND (srm <= 40))))
);


--
-- Name: brand_loyalty_cards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brand_loyalty_cards (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    brand_id uuid NOT NULL,
    program_id uuid NOT NULL,
    stamps integer DEFAULT 0 NOT NULL,
    lifetime_stamps integer DEFAULT 0 NOT NULL,
    last_stamp_at timestamp with time zone,
    last_stamp_brewery_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: brand_loyalty_programs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brand_loyalty_programs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    brand_id uuid NOT NULL,
    name text DEFAULT 'Brand Loyalty'::text NOT NULL,
    description text,
    stamps_required integer DEFAULT 10 NOT NULL,
    reward_description text DEFAULT 'Free pint at any location'::text NOT NULL,
    earn_per_session integer DEFAULT 1 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: brand_loyalty_redemptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brand_loyalty_redemptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    card_id uuid NOT NULL,
    user_id uuid NOT NULL,
    brand_id uuid NOT NULL,
    brewery_id uuid NOT NULL,
    program_id uuid NOT NULL,
    redeemed_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: brand_team_activity; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brand_team_activity (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    brand_id uuid NOT NULL,
    actor_id uuid NOT NULL,
    target_user_id uuid NOT NULL,
    action text NOT NULL,
    old_value text,
    new_value text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT brand_team_activity_action_check CHECK ((action = ANY (ARRAY['added'::text, 'removed'::text, 'role_changed'::text, 'scope_changed'::text])))
);


--
-- Name: breweries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.breweries (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    external_id text,
    name text NOT NULL,
    brewery_type text,
    street text,
    city text,
    state text,
    postal_code text,
    country text,
    phone text,
    website_url text,
    latitude numeric,
    longitude numeric,
    description text,
    cover_image_url text,
    verified boolean DEFAULT false NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    hop_route_eligible boolean DEFAULT false NOT NULL,
    hop_route_offer text,
    vibe_tags text[] DEFAULT '{}'::text[],
    subscription_tier text DEFAULT 'free'::text NOT NULL,
    stripe_customer_id text,
    trial_ends_at timestamp with time zone,
    data_source text DEFAULT 'manual'::text,
    last_crawled_at timestamp with time zone,
    crawl_beer_count integer DEFAULT 0,
    pos_provider text,
    pos_connected boolean DEFAULT false NOT NULL,
    pos_last_sync_at timestamp with time zone,
    brand_id uuid,
    instagram_url text,
    facebook_url text,
    twitter_url text,
    untappd_url text,
    admin_notes text,
    trial_warning_sent_at timestamp with time zone,
    trial_expired_sent_at timestamp with time zone,
    brand_color text,
    brand_color_secondary text,
    board_theme_id text DEFAULT 'cream-classic'::text,
    board_font_id text DEFAULT 'classic'::text,
    board_background_url text,
    board_background_opacity integer DEFAULT 100,
    board_orientation text DEFAULT 'horizontal'::text,
    board_display_scale text DEFAULT 'auto'::text,
    short_slug text,
    qr_dark_color text DEFAULT '#1A1714'::text,
    qr_light_color text DEFAULT '#FBF7F0'::text,
    qr_logo_enabled boolean DEFAULT false NOT NULL,
    CONSTRAINT breweries_board_background_opacity_check CHECK (((board_background_opacity >= 0) AND (board_background_opacity <= 100))),
    CONSTRAINT breweries_board_display_scale_check CHECK ((board_display_scale = ANY (ARRAY['auto'::text, 'monitor'::text, 'large-tv'::text, 'cinema'::text]))),
    CONSTRAINT breweries_board_orientation_check CHECK ((board_orientation = ANY (ARRAY['horizontal'::text, 'vertical'::text]))),
    CONSTRAINT breweries_data_source_check CHECK ((data_source = ANY (ARRAY['manual'::text, 'seed'::text, 'crawled'::text, 'ai_managed'::text])))
);


--
-- Name: brewery_accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brewery_accounts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    brewery_id uuid NOT NULL,
    role text DEFAULT 'owner'::text NOT NULL,
    verified boolean DEFAULT false NOT NULL,
    verified_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    propagated_from_brand boolean DEFAULT false NOT NULL,
    CONSTRAINT brewery_accounts_role_check CHECK ((role = ANY (ARRAY['owner'::text, 'business'::text, 'marketing'::text, 'staff'::text])))
);


--
-- Name: brewery_ads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brewery_ads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    brewery_id uuid NOT NULL,
    title text NOT NULL,
    body text,
    image_url text,
    cta_url text,
    cta_label text DEFAULT 'Visit'::text,
    radius_km integer DEFAULT 25 NOT NULL,
    budget_cents integer DEFAULT 0 NOT NULL,
    spent_cents integer DEFAULT 0 NOT NULL,
    impressions integer DEFAULT 0 NOT NULL,
    clicks integer DEFAULT 0 NOT NULL,
    starts_at timestamp with time zone DEFAULT now() NOT NULL,
    ends_at timestamp with time zone,
    is_active boolean DEFAULT true NOT NULL,
    tier_required text DEFAULT 'cask'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT brewery_ads_body_check CHECK ((char_length(body) <= 500)),
    CONSTRAINT brewery_ads_budget_cents_check CHECK ((budget_cents >= 0)),
    CONSTRAINT brewery_ads_cta_label_check CHECK ((char_length(cta_label) <= 30)),
    CONSTRAINT brewery_ads_radius_km_check CHECK (((radius_km >= 1) AND (radius_km <= 200))),
    CONSTRAINT brewery_ads_spent_cents_check CHECK ((spent_cents >= 0)),
    CONSTRAINT brewery_ads_tier_required_check CHECK ((tier_required = ANY (ARRAY['cask'::text, 'barrel'::text]))),
    CONSTRAINT brewery_ads_title_check CHECK ((char_length(title) <= 100))
);


--
-- Name: brewery_brands; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brewery_brands (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    logo_url text,
    description text,
    website_url text,
    created_at timestamp with time zone DEFAULT now(),
    owner_id uuid,
    subscription_tier text DEFAULT 'free'::text NOT NULL,
    stripe_customer_id text,
    trial_ends_at timestamp with time zone,
    billing_email text
);


--
-- Name: brewery_claims; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brewery_claims (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    brewery_id uuid NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    business_email text,
    notes text,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT brewery_claims_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])))
);


--
-- Name: brewery_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brewery_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    brewery_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    event_date date NOT NULL,
    start_time time without time zone,
    end_time time without time zone,
    event_type text DEFAULT 'other'::text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    capacity integer,
    rsvp_count integer DEFAULT 0 NOT NULL,
    CONSTRAINT brewery_events_event_type_check CHECK ((event_type = ANY (ARRAY['tap_takeover'::text, 'release_party'::text, 'trivia'::text, 'live_music'::text, 'food_pairing'::text, 'other'::text])))
);


--
-- Name: brewery_follows; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brewery_follows (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    brewery_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: brewery_menus; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brewery_menus (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    brewery_id uuid NOT NULL,
    category text NOT NULL,
    title text,
    image_urls text[] DEFAULT '{}'::text[] NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT brewery_menus_category_check CHECK ((category = ANY (ARRAY['food'::text, 'happy_hour'::text, 'wine'::text, 'cocktail'::text, 'non_alcoholic'::text, 'seasonal'::text, 'kids'::text, 'brunch'::text])))
);


--
-- Name: brewery_percentile_buckets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brewery_percentile_buckets (
    brewery_id uuid NOT NULL,
    thresholds integer[] NOT NULL,
    sample_size integer DEFAULT 0 NOT NULL,
    computed_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: brewery_reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brewery_reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    brewery_id uuid NOT NULL,
    rating numeric(2,1) NOT NULL,
    comment text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    owner_response text,
    responded_at timestamp with time zone,
    is_flagged boolean DEFAULT false,
    flag_reason text,
    flagged_by uuid,
    flagged_at timestamp with time zone,
    moderation_status text DEFAULT 'active'::text,
    moderation_note text,
    moderated_at timestamp with time zone,
    moderated_by uuid,
    CONSTRAINT brewery_reviews_moderation_status_check CHECK ((moderation_status = ANY (ARRAY['active'::text, 'flagged'::text, 'removed'::text, 'cleared'::text]))),
    CONSTRAINT brewery_reviews_rating_check CHECK (((rating >= 0.5) AND (rating <= 5.0)))
);


--
-- Name: brewery_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brewery_submissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    website_url text,
    notes text,
    status text DEFAULT 'pending'::text NOT NULL,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT brewery_submissions_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])))
);


--
-- Name: brewery_visits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brewery_visits (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    brewery_id uuid NOT NULL,
    total_visits integer DEFAULT 1 NOT NULL,
    unique_beers_tried integer DEFAULT 1 NOT NULL,
    first_visit_at timestamp with time zone DEFAULT now() NOT NULL,
    last_visit_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: challenge_participants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.challenge_participants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    challenge_id uuid NOT NULL,
    user_id uuid NOT NULL,
    current_progress integer DEFAULT 0 NOT NULL,
    completed_at timestamp with time zone,
    joined_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: challenges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.challenges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    brewery_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    icon text DEFAULT '🍺'::text NOT NULL,
    challenge_type text NOT NULL,
    target_value integer NOT NULL,
    target_beer_ids uuid[] DEFAULT '{}'::uuid[],
    reward_description text,
    reward_xp integer DEFAULT 100 NOT NULL,
    reward_loyalty_stamps integer DEFAULT 0 NOT NULL,
    starts_at timestamp with time zone,
    ends_at timestamp with time zone,
    is_active boolean DEFAULT true NOT NULL,
    max_participants integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    is_sponsored boolean DEFAULT false NOT NULL,
    cover_image_url text,
    geo_radius_km integer DEFAULT 50,
    impressions integer DEFAULT 0 NOT NULL,
    joins_from_discovery integer DEFAULT 0 NOT NULL,
    CONSTRAINT challenges_challenge_type_check CHECK ((challenge_type = ANY (ARRAY['beer_count'::text, 'specific_beers'::text, 'visit_streak'::text, 'style_variety'::text]))),
    CONSTRAINT challenges_target_value_check CHECK ((target_value > 0)),
    CONSTRAINT valid_date_range CHECK (((ends_at IS NULL) OR (starts_at IS NULL) OR (ends_at > starts_at)))
);


--
-- Name: crawl_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.crawl_jobs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    brewery_id uuid NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    source_url text,
    http_status integer,
    raw_html_hash text,
    raw_html_size integer,
    tokens_used integer,
    cost_usd numeric(8,6),
    beers_found integer DEFAULT 0,
    beers_added integer DEFAULT 0,
    error_message text,
    retry_count integer DEFAULT 0,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT crawl_jobs_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'fetching'::text, 'parsing'::text, 'reviewing'::text, 'completed'::text, 'failed'::text, 'skipped'::text])))
);


--
-- Name: crawl_sources; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.crawl_sources (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    brewery_id uuid NOT NULL,
    crawl_url text,
    crawl_enabled boolean DEFAULT true NOT NULL,
    crawl_mode text DEFAULT 'unclaimed'::text NOT NULL,
    robots_allowed boolean DEFAULT true,
    last_crawled_at timestamp with time zone,
    last_html_hash text,
    next_crawl_at timestamp with time zone DEFAULT now(),
    crawl_interval interval DEFAULT '7 days'::interval NOT NULL,
    consecutive_failures integer DEFAULT 0,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT crawl_sources_crawl_mode_check CHECK ((crawl_mode = ANY (ARRAY['unclaimed'::text, 'ai_managed'::text, 'disabled'::text])))
);


--
-- Name: crawled_beers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.crawled_beers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    crawl_job_id uuid NOT NULL,
    brewery_id uuid NOT NULL,
    name text NOT NULL,
    style text,
    mapped_style text,
    abv numeric(4,2),
    ibu integer,
    description text,
    confidence numeric(3,2) DEFAULT 0.00 NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    matched_beer_id uuid,
    source_text text,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    rejection_reason text,
    promoted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT crawled_beers_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'promoted'::text, 'stale'::text])))
);


--
-- Name: event_rsvps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_rsvps (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid NOT NULL,
    user_id uuid NOT NULL,
    status text DEFAULT 'going'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT event_rsvps_status_check CHECK ((status = ANY (ARRAY['going'::text, 'interested'::text])))
);


--
-- Name: friendships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.friendships (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    requester_id uuid NOT NULL,
    addressee_id uuid NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT friendships_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'blocked'::text])))
);


--
-- Name: hop_route_stop_beers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hop_route_stop_beers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    stop_id uuid NOT NULL,
    beer_id uuid,
    beer_name text,
    reason_text text
);


--
-- Name: hop_route_stops; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hop_route_stops (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    route_id uuid NOT NULL,
    brewery_id uuid,
    stop_order smallint NOT NULL,
    arrival_time timestamp with time zone,
    departure_time timestamp with time zone,
    travel_to_next_minutes integer,
    reasoning_text text,
    social_context text,
    is_sponsored boolean DEFAULT false NOT NULL,
    checked_in boolean DEFAULT false NOT NULL,
    checked_in_at timestamp with time zone
);


--
-- Name: hop_routes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hop_routes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text,
    location_city text,
    location_lat double precision,
    location_lng double precision,
    stop_count smallint DEFAULT 3 NOT NULL,
    group_size text DEFAULT 'solo'::text NOT NULL,
    vibe text[] DEFAULT '{}'::text[],
    transport text DEFAULT 'walking'::text NOT NULL,
    status public.hop_route_status DEFAULT 'draft'::public.hop_route_status NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    started_at timestamp with time zone,
    completed_at timestamp with time zone
);


--
-- Name: loyalty_cards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.loyalty_cards (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    brewery_id uuid NOT NULL,
    program_id uuid,
    stamps integer DEFAULT 0 NOT NULL,
    lifetime_stamps integer DEFAULT 0 NOT NULL,
    last_stamp_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: loyalty_programs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.loyalty_programs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    brewery_id uuid NOT NULL,
    name text DEFAULT 'Loyalty Program'::text NOT NULL,
    description text,
    stamps_required integer DEFAULT 10 NOT NULL,
    reward_description text DEFAULT 'Free pint'::text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: loyalty_redemptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.loyalty_redemptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    card_id uuid NOT NULL,
    user_id uuid NOT NULL,
    brewery_id uuid NOT NULL,
    program_id uuid,
    redeemed_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: loyalty_rewards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.loyalty_rewards (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    program_id uuid NOT NULL,
    brewery_id uuid NOT NULL,
    user_id uuid NOT NULL,
    reward_type text DEFAULT 'free_pint'::text NOT NULL,
    redeemed boolean DEFAULT false NOT NULL,
    redeemed_at timestamp with time zone,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: mug_club_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mug_club_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    mug_club_id uuid NOT NULL,
    user_id uuid NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    joined_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone,
    notes text,
    CONSTRAINT mug_club_members_status_check CHECK ((status = ANY (ARRAY['active'::text, 'expired'::text, 'cancelled'::text])))
);


--
-- Name: mug_clubs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mug_clubs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    brewery_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    annual_fee numeric(10,2) NOT NULL,
    max_members integer,
    perks jsonb DEFAULT '[]'::jsonb NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: notification_rate_limits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_rate_limits (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    trigger_type text NOT NULL,
    trigger_key text NOT NULL,
    sent_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    data jsonb,
    read boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: overall_percentile_buckets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.overall_percentile_buckets (
    metric text NOT NULL,
    thresholds integer[] NOT NULL,
    sample_size integer DEFAULT 0 NOT NULL,
    computed_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: pos_connections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pos_connections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    brewery_id uuid NOT NULL,
    provider text NOT NULL,
    access_token_encrypted text,
    refresh_token_encrypted text,
    token_expires_at timestamp with time zone,
    provider_location_id text,
    provider_merchant_id text,
    status text DEFAULT 'active'::text NOT NULL,
    last_sync_at timestamp with time zone,
    last_sync_status text,
    last_sync_item_count integer DEFAULT 0,
    webhook_subscription_id text,
    connected_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT pos_connections_last_sync_status_check CHECK ((last_sync_status = ANY (ARRAY['success'::text, 'partial'::text, 'failed'::text]))),
    CONSTRAINT pos_connections_provider_check CHECK ((provider = ANY (ARRAY['toast'::text, 'square'::text]))),
    CONSTRAINT pos_connections_status_check CHECK ((status = ANY (ARRAY['active'::text, 'error'::text, 'disconnected'::text])))
);


--
-- Name: pos_item_mappings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pos_item_mappings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    pos_connection_id uuid NOT NULL,
    brewery_id uuid NOT NULL,
    pos_item_id text NOT NULL,
    pos_item_name text NOT NULL,
    beer_id uuid,
    mapping_type text DEFAULT 'unmapped'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT pos_item_mappings_mapping_type_check CHECK ((mapping_type = ANY (ARRAY['auto'::text, 'manual'::text, 'unmapped'::text])))
);


--
-- Name: pos_sync_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pos_sync_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    pos_connection_id uuid NOT NULL,
    brewery_id uuid NOT NULL,
    sync_type text NOT NULL,
    provider text NOT NULL,
    items_added integer DEFAULT 0 NOT NULL,
    items_updated integer DEFAULT 0 NOT NULL,
    items_removed integer DEFAULT 0 NOT NULL,
    items_unmapped integer DEFAULT 0 NOT NULL,
    status text NOT NULL,
    error text,
    duration_ms integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT pos_sync_logs_provider_check CHECK ((provider = ANY (ARRAY['toast'::text, 'square'::text]))),
    CONSTRAINT pos_sync_logs_status_check CHECK ((status = ANY (ARRAY['success'::text, 'partial'::text, 'failed'::text]))),
    CONSTRAINT pos_sync_logs_sync_type_check CHECK ((sync_type = ANY (ARRAY['webhook'::text, 'manual'::text, 'scheduled'::text])))
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    username text NOT NULL,
    display_name text NOT NULL,
    avatar_url text,
    bio text,
    home_city text,
    total_checkins integer DEFAULT 0 NOT NULL,
    unique_beers integer DEFAULT 0 NOT NULL,
    unique_breweries integer DEFAULT 0 NOT NULL,
    level integer DEFAULT 1 NOT NULL,
    xp integer DEFAULT 0 NOT NULL,
    is_public boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    is_superadmin boolean DEFAULT false NOT NULL,
    current_streak integer DEFAULT 0 NOT NULL,
    longest_streak integer DEFAULT 0 NOT NULL,
    last_session_date date,
    notification_preferences jsonb DEFAULT '{"achievements": true, "weekly_stats": true, "friend_activity": true}'::jsonb,
    streak_grace_used_at timestamp with time zone,
    referred_by uuid,
    date_of_birth date,
    location_consent boolean DEFAULT false,
    location_consent_at timestamp with time zone,
    streak_freezes_available integer DEFAULT 0 NOT NULL,
    streak_freeze_used_at timestamp with time zone,
    CONSTRAINT streak_freezes_max CHECK (((streak_freezes_available >= 0) AND (streak_freezes_available <= 3)))
);


--
-- Name: COLUMN profiles.notification_preferences; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.profiles.notification_preferences IS 'User notification preferences: friend_activity, achievements, weekly_stats';


--
-- Name: COLUMN profiles.streak_freezes_available; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.profiles.streak_freezes_available IS 'Number of streak freezes available (earned at 7-day milestones, max 3)';


--
-- Name: COLUMN profiles.streak_freeze_used_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.profiles.streak_freeze_used_at IS 'Last time a streak freeze was consumed';


--
-- Name: promotions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.promotions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    brewery_id uuid NOT NULL,
    beer_id uuid,
    title text NOT NULL,
    description text,
    discount_type text NOT NULL,
    discount_value numeric,
    starts_at timestamp with time zone DEFAULT now() NOT NULL,
    ends_at timestamp with time zone,
    redemption_limit integer,
    redemptions_count integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT promotions_discount_type_check CHECK ((discount_type = ANY (ARRAY['percent'::text, 'fixed'::text, 'bogo'::text, 'free_item'::text])))
);


--
-- Name: push_subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.push_subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    endpoint text NOT NULL,
    keys jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE push_subscriptions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.push_subscriptions IS 'Browser Web Push subscription endpoints per user';


--
-- Name: reactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reactions (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    type text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    session_id uuid NOT NULL,
    beer_log_id uuid,
    CONSTRAINT reactions_type_check CHECK ((type = ANY (ARRAY['thumbs_up'::text, 'flame'::text, 'beer'::text])))
);


--
-- Name: redemption_codes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.redemption_codes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(6) NOT NULL,
    type character varying(20) NOT NULL,
    user_id uuid NOT NULL,
    brewery_id uuid NOT NULL,
    program_id uuid,
    mug_club_id uuid,
    perk_index integer,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '00:05:00'::interval) NOT NULL,
    confirmed_at timestamp with time zone,
    confirmed_by uuid,
    pos_reference text,
    promo_description text,
    promotion_id uuid,
    brand_id uuid,
    CONSTRAINT redemption_codes_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'confirmed'::character varying, 'expired'::character varying, 'cancelled'::character varying])::text[]))),
    CONSTRAINT redemption_codes_type_check CHECK (((type)::text = ANY ((ARRAY['loyalty_reward'::character varying, 'mug_club_perk'::character varying, 'promotion'::character varying, 'brand_loyalty_reward'::character varying])::text[])))
);


--
-- Name: referral_codes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.referral_codes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    code text NOT NULL,
    use_count integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: referral_uses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.referral_uses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    referrer_id uuid NOT NULL,
    referred_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: session_comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.session_comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id uuid NOT NULL,
    user_id uuid NOT NULL,
    body text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT session_comments_body_check CHECK (((char_length(body) >= 1) AND (char_length(body) <= 500)))
);


--
-- Name: session_participants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.session_participants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id uuid NOT NULL,
    user_id uuid NOT NULL,
    invited_by uuid NOT NULL,
    status public.participant_status DEFAULT 'pending'::public.participant_status NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: session_photos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.session_photos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id uuid NOT NULL,
    user_id uuid NOT NULL,
    photo_url text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    brewery_id uuid,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    ended_at timestamp with time zone,
    is_active boolean DEFAULT true NOT NULL,
    share_to_feed boolean DEFAULT true NOT NULL,
    note text,
    xp_awarded integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    context text DEFAULT 'brewery'::text NOT NULL,
    session_latitude double precision,
    session_longitude double precision,
    xp_tier character varying(10) DEFAULT 'normal'::character varying,
    CONSTRAINT sessions_context_check CHECK ((context = ANY (ARRAY['brewery'::text, 'home'::text])))
);


--
-- Name: COLUMN sessions.session_latitude; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.sessions.session_latitude IS 'User latitude at session start (optional, for analytics)';


--
-- Name: COLUMN sessions.session_longitude; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.sessions.session_longitude IS 'User longitude at session start (optional, for analytics)';


--
-- Name: COLUMN sessions.xp_tier; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.sessions.xp_tier IS 'XP tier rolled at session end: normal (94%), lucky (5%, 2×), golden (1%, 5×). Sprint 161.';


--
-- Name: style_percentile_buckets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.style_percentile_buckets (
    style text NOT NULL,
    thresholds integer[] NOT NULL,
    sample_size integer DEFAULT 0 NOT NULL,
    computed_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: trending_scores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.trending_scores (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    content_type text NOT NULL,
    content_id uuid NOT NULL,
    city text NOT NULL,
    score numeric DEFAULT 0,
    checkin_count_24h integer DEFAULT 0,
    rating_count_24h integer DEFAULT 0,
    unique_users_24h integer DEFAULT 0,
    computed_at timestamp with time zone DEFAULT now(),
    CONSTRAINT trending_scores_content_type_check CHECK ((content_type = ANY (ARRAY['beer'::text, 'brewery'::text])))
);


--
-- Name: user_achievements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_achievements (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    achievement_id uuid NOT NULL,
    earned_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_pinned_beers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_pinned_beers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    beer_id uuid NOT NULL,
    "position" smallint NOT NULL,
    pinned_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT user_pinned_beers_position_check CHECK ((("position" >= 0) AND ("position" < 4)))
);


--
-- Name: user_stats_snapshots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_stats_snapshots (
    user_id uuid NOT NULL,
    total_beers integer DEFAULT 0 NOT NULL,
    total_beers_percentile integer,
    unique_beers integer DEFAULT 0 NOT NULL,
    unique_beers_percentile integer,
    unique_styles integer DEFAULT 0 NOT NULL,
    unique_styles_percentile integer,
    top_style text,
    top_style_count integer DEFAULT 0 NOT NULL,
    top_style_percentile integer,
    top_brewery_id uuid,
    top_brewery_visits integer DEFAULT 0 NOT NULL,
    top_brewery_percentile integer,
    style_breakdown jsonb DEFAULT '[]'::jsonb NOT NULL,
    computed_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: waitlist; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.waitlist (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    audience_type text NOT NULL,
    brewery_name text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT brewery_name_required CHECK (((audience_type <> 'brewery'::text) OR ((brewery_name IS NOT NULL) AND (length(TRIM(BOTH FROM brewery_name)) > 0)))),
    CONSTRAINT waitlist_audience_type_check CHECK ((audience_type = ANY (ARRAY['user'::text, 'brewery'::text]))),
    CONSTRAINT waitlist_city_check CHECK ((length(TRIM(BOTH FROM city)) > 0)),
    CONSTRAINT waitlist_name_check CHECK ((length(TRIM(BOTH FROM name)) > 0)),
    CONSTRAINT waitlist_state_check CHECK ((length(state) = 2))
);


--
-- Name: wishlist; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wishlist (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    beer_id uuid NOT NULL,
    note text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: _archive_checkins _archive_checkins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._archive_checkins
    ADD CONSTRAINT _archive_checkins_pkey PRIMARY KEY (id);


--
-- Name: achievements achievements_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT achievements_key_key UNIQUE (key);


--
-- Name: achievements achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT achievements_pkey PRIMARY KEY (id);


--
-- Name: admin_actions admin_actions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_actions
    ADD CONSTRAINT admin_actions_pkey PRIMARY KEY (id);


--
-- Name: admin_user_notes admin_user_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_user_notes
    ADD CONSTRAINT admin_user_notes_pkey PRIMARY KEY (id);


--
-- Name: admin_user_tags admin_user_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_user_tags
    ADD CONSTRAINT admin_user_tags_pkey PRIMARY KEY (id);


--
-- Name: ai_recommendations ai_recommendations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_recommendations
    ADD CONSTRAINT ai_recommendations_pkey PRIMARY KEY (id);


--
-- Name: ai_suggestions ai_suggestions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_suggestions
    ADD CONSTRAINT ai_suggestions_pkey PRIMARY KEY (id);


--
-- Name: api_keys api_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_pkey PRIMARY KEY (id);


--
-- Name: beer_list_items beer_list_items_list_id_beer_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beer_list_items
    ADD CONSTRAINT beer_list_items_list_id_beer_id_key UNIQUE (list_id, beer_id);


--
-- Name: beer_list_items beer_list_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beer_list_items
    ADD CONSTRAINT beer_list_items_pkey PRIMARY KEY (id);


--
-- Name: beer_lists beer_lists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beer_lists
    ADD CONSTRAINT beer_lists_pkey PRIMARY KEY (id);


--
-- Name: beer_logs beer_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beer_logs
    ADD CONSTRAINT beer_logs_pkey PRIMARY KEY (id);


--
-- Name: beer_pour_sizes beer_pour_sizes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beer_pour_sizes
    ADD CONSTRAINT beer_pour_sizes_pkey PRIMARY KEY (id);


--
-- Name: beer_reviews beer_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beer_reviews
    ADD CONSTRAINT beer_reviews_pkey PRIMARY KEY (id);


--
-- Name: beer_reviews beer_reviews_user_id_beer_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beer_reviews
    ADD CONSTRAINT beer_reviews_user_id_beer_id_key UNIQUE (user_id, beer_id);


--
-- Name: beers beers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beers
    ADD CONSTRAINT beers_pkey PRIMARY KEY (id);


--
-- Name: brand_accounts brand_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brand_accounts
    ADD CONSTRAINT brand_accounts_pkey PRIMARY KEY (id);


--
-- Name: brand_accounts brand_accounts_user_id_brand_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brand_accounts
    ADD CONSTRAINT brand_accounts_user_id_brand_id_key UNIQUE (user_id, brand_id);


--
-- Name: brand_catalog_beers brand_catalog_beers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brand_catalog_beers
    ADD CONSTRAINT brand_catalog_beers_pkey PRIMARY KEY (id);


--
-- Name: brand_loyalty_cards brand_loyalty_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brand_loyalty_cards
    ADD CONSTRAINT brand_loyalty_cards_pkey PRIMARY KEY (id);


--
-- Name: brand_loyalty_cards brand_loyalty_cards_user_id_brand_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brand_loyalty_cards
    ADD CONSTRAINT brand_loyalty_cards_user_id_brand_id_key UNIQUE (user_id, brand_id);


--
-- Name: brand_loyalty_programs brand_loyalty_programs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brand_loyalty_programs
    ADD CONSTRAINT brand_loyalty_programs_pkey PRIMARY KEY (id);


--
-- Name: brand_loyalty_redemptions brand_loyalty_redemptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brand_loyalty_redemptions
    ADD CONSTRAINT brand_loyalty_redemptions_pkey PRIMARY KEY (id);


--
-- Name: brand_team_activity brand_team_activity_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brand_team_activity
    ADD CONSTRAINT brand_team_activity_pkey PRIMARY KEY (id);


--
-- Name: breweries breweries_external_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.breweries
    ADD CONSTRAINT breweries_external_id_key UNIQUE (external_id);


--
-- Name: breweries breweries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.breweries
    ADD CONSTRAINT breweries_pkey PRIMARY KEY (id);


--
-- Name: breweries breweries_short_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.breweries
    ADD CONSTRAINT breweries_short_slug_key UNIQUE (short_slug);


--
-- Name: brewery_accounts brewery_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brewery_accounts
    ADD CONSTRAINT brewery_accounts_pkey PRIMARY KEY (id);


--
-- Name: brewery_accounts brewery_accounts_user_id_brewery_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brewery_accounts
    ADD CONSTRAINT brewery_accounts_user_id_brewery_id_key UNIQUE (user_id, brewery_id);


--
-- Name: brewery_ads brewery_ads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brewery_ads
    ADD CONSTRAINT brewery_ads_pkey PRIMARY KEY (id);


--
-- Name: brewery_brands brewery_brands_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brewery_brands
    ADD CONSTRAINT brewery_brands_pkey PRIMARY KEY (id);


--
-- Name: brewery_brands brewery_brands_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brewery_brands
    ADD CONSTRAINT brewery_brands_slug_key UNIQUE (slug);


--
-- Name: brewery_brands brewery_brands_stripe_customer_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brewery_brands
    ADD CONSTRAINT brewery_brands_stripe_customer_id_key UNIQUE (stripe_customer_id);


--
-- Name: brewery_claims brewery_claims_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brewery_claims
    ADD CONSTRAINT brewery_claims_pkey PRIMARY KEY (id);


--
-- Name: brewery_events brewery_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brewery_events
    ADD CONSTRAINT brewery_events_pkey PRIMARY KEY (id);


--
-- Name: brewery_follows brewery_follows_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brewery_follows
    ADD CONSTRAINT brewery_follows_pkey PRIMARY KEY (id);


--
-- Name: brewery_follows brewery_follows_user_id_brewery_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brewery_follows
    ADD CONSTRAINT brewery_follows_user_id_brewery_id_key UNIQUE (user_id, brewery_id);


--
-- Name: brewery_menus brewery_menus_brewery_id_category_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brewery_menus
    ADD CONSTRAINT brewery_menus_brewery_id_category_key UNIQUE (brewery_id, category);


--
-- Name: brewery_menus brewery_menus_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brewery_menus
    ADD CONSTRAINT brewery_menus_pkey PRIMARY KEY (id);


--
-- Name: brewery_percentile_buckets brewery_percentile_buckets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brewery_percentile_buckets
    ADD CONSTRAINT brewery_percentile_buckets_pkey PRIMARY KEY (brewery_id);


--
-- Name: brewery_reviews brewery_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brewery_reviews
    ADD CONSTRAINT brewery_reviews_pkey PRIMARY KEY (id);


--
-- Name: brewery_reviews brewery_reviews_user_id_brewery_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brewery_reviews
    ADD CONSTRAINT brewery_reviews_user_id_brewery_id_key UNIQUE (user_id, brewery_id);


--
-- Name: brewery_submissions brewery_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brewery_submissions
    ADD CONSTRAINT brewery_submissions_pkey PRIMARY KEY (id);


--
-- Name: brewery_visits brewery_visits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brewery_visits
    ADD CONSTRAINT brewery_visits_pkey PRIMARY KEY (id);


--
-- Name: brewery_visits brewery_visits_user_id_brewery_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brewery_visits
    ADD CONSTRAINT brewery_visits_user_id_brewery_id_key UNIQUE (user_id, brewery_id);


--
-- Name: challenge_participants challenge_participants_challenge_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challenge_participants
    ADD CONSTRAINT challenge_participants_challenge_id_user_id_key UNIQUE (challenge_id, user_id);


--
-- Name: challenge_participants challenge_participants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challenge_participants
    ADD CONSTRAINT challenge_participants_pkey PRIMARY KEY (id);


--
-- Name: challenges challenges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challenges
    ADD CONSTRAINT challenges_pkey PRIMARY KEY (id);


--
-- Name: crawl_jobs crawl_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crawl_jobs
    ADD CONSTRAINT crawl_jobs_pkey PRIMARY KEY (id);


--
-- Name: crawl_sources crawl_sources_brewery_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crawl_sources
    ADD CONSTRAINT crawl_sources_brewery_id_key UNIQUE (brewery_id);


--
-- Name: crawl_sources crawl_sources_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crawl_sources
    ADD CONSTRAINT crawl_sources_pkey PRIMARY KEY (id);


--
-- Name: crawled_beers crawled_beers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crawled_beers
    ADD CONSTRAINT crawled_beers_pkey PRIMARY KEY (id);


--
-- Name: event_rsvps event_rsvps_event_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_rsvps
    ADD CONSTRAINT event_rsvps_event_id_user_id_key UNIQUE (event_id, user_id);


--
-- Name: event_rsvps event_rsvps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_rsvps
    ADD CONSTRAINT event_rsvps_pkey PRIMARY KEY (id);


--
-- Name: friendships friendships_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.friendships
    ADD CONSTRAINT friendships_pkey PRIMARY KEY (id);


--
-- Name: friendships friendships_requester_id_addressee_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.friendships
    ADD CONSTRAINT friendships_requester_id_addressee_id_key UNIQUE (requester_id, addressee_id);


--
-- Name: hop_route_stop_beers hop_route_stop_beers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hop_route_stop_beers
    ADD CONSTRAINT hop_route_stop_beers_pkey PRIMARY KEY (id);


--
-- Name: hop_route_stops hop_route_stops_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hop_route_stops
    ADD CONSTRAINT hop_route_stops_pkey PRIMARY KEY (id);


--
-- Name: hop_routes hop_routes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hop_routes
    ADD CONSTRAINT hop_routes_pkey PRIMARY KEY (id);


--
-- Name: loyalty_cards loyalty_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loyalty_cards
    ADD CONSTRAINT loyalty_cards_pkey PRIMARY KEY (id);


--
-- Name: loyalty_cards loyalty_cards_user_id_brewery_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loyalty_cards
    ADD CONSTRAINT loyalty_cards_user_id_brewery_id_key UNIQUE (user_id, brewery_id);


--
-- Name: loyalty_programs loyalty_programs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loyalty_programs
    ADD CONSTRAINT loyalty_programs_pkey PRIMARY KEY (id);


--
-- Name: loyalty_redemptions loyalty_redemptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loyalty_redemptions
    ADD CONSTRAINT loyalty_redemptions_pkey PRIMARY KEY (id);


--
-- Name: loyalty_rewards loyalty_rewards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loyalty_rewards
    ADD CONSTRAINT loyalty_rewards_pkey PRIMARY KEY (id);


--
-- Name: mug_club_members mug_club_members_mug_club_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mug_club_members
    ADD CONSTRAINT mug_club_members_mug_club_id_user_id_key UNIQUE (mug_club_id, user_id);


--
-- Name: mug_club_members mug_club_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mug_club_members
    ADD CONSTRAINT mug_club_members_pkey PRIMARY KEY (id);


--
-- Name: mug_clubs mug_clubs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mug_clubs
    ADD CONSTRAINT mug_clubs_pkey PRIMARY KEY (id);


--
-- Name: notification_rate_limits notification_rate_limits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_rate_limits
    ADD CONSTRAINT notification_rate_limits_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: overall_percentile_buckets overall_percentile_buckets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.overall_percentile_buckets
    ADD CONSTRAINT overall_percentile_buckets_pkey PRIMARY KEY (metric);


--
-- Name: pos_connections pos_connections_brewery_id_provider_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pos_connections
    ADD CONSTRAINT pos_connections_brewery_id_provider_key UNIQUE (brewery_id, provider);


--
-- Name: pos_connections pos_connections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pos_connections
    ADD CONSTRAINT pos_connections_pkey PRIMARY KEY (id);


--
-- Name: pos_item_mappings pos_item_mappings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pos_item_mappings
    ADD CONSTRAINT pos_item_mappings_pkey PRIMARY KEY (id);


--
-- Name: pos_sync_logs pos_sync_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pos_sync_logs
    ADD CONSTRAINT pos_sync_logs_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_username_key UNIQUE (username);


--
-- Name: promotions promotions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT promotions_pkey PRIMARY KEY (id);


--
-- Name: push_subscriptions push_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT push_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: push_subscriptions push_subscriptions_user_id_endpoint_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT push_subscriptions_user_id_endpoint_key UNIQUE (user_id, endpoint);


--
-- Name: reactions reactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reactions
    ADD CONSTRAINT reactions_pkey PRIMARY KEY (id);


--
-- Name: reactions reactions_user_session_type_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reactions
    ADD CONSTRAINT reactions_user_session_type_unique UNIQUE (user_id, session_id, type);


--
-- Name: redemption_codes redemption_codes_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.redemption_codes
    ADD CONSTRAINT redemption_codes_code_key UNIQUE (code);


--
-- Name: redemption_codes redemption_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.redemption_codes
    ADD CONSTRAINT redemption_codes_pkey PRIMARY KEY (id);


--
-- Name: referral_codes referral_codes_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referral_codes
    ADD CONSTRAINT referral_codes_code_key UNIQUE (code);


--
-- Name: referral_codes referral_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referral_codes
    ADD CONSTRAINT referral_codes_pkey PRIMARY KEY (id);


--
-- Name: referral_uses referral_uses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referral_uses
    ADD CONSTRAINT referral_uses_pkey PRIMARY KEY (id);


--
-- Name: referral_uses referral_uses_referred_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referral_uses
    ADD CONSTRAINT referral_uses_referred_id_key UNIQUE (referred_id);


--
-- Name: session_comments session_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_comments
    ADD CONSTRAINT session_comments_pkey PRIMARY KEY (id);


--
-- Name: session_participants session_participants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_participants
    ADD CONSTRAINT session_participants_pkey PRIMARY KEY (id);


--
-- Name: session_participants session_participants_session_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_participants
    ADD CONSTRAINT session_participants_session_id_user_id_key UNIQUE (session_id, user_id);


--
-- Name: session_photos session_photos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_photos
    ADD CONSTRAINT session_photos_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: style_percentile_buckets style_percentile_buckets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.style_percentile_buckets
    ADD CONSTRAINT style_percentile_buckets_pkey PRIMARY KEY (style);


--
-- Name: trending_scores trending_scores_content_type_content_id_city_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trending_scores
    ADD CONSTRAINT trending_scores_content_type_content_id_city_key UNIQUE (content_type, content_id, city);


--
-- Name: trending_scores trending_scores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trending_scores
    ADD CONSTRAINT trending_scores_pkey PRIMARY KEY (id);


--
-- Name: user_achievements user_achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_pkey PRIMARY KEY (id);


--
-- Name: user_achievements user_achievements_user_id_achievement_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_user_id_achievement_id_key UNIQUE (user_id, achievement_id);


--
-- Name: user_pinned_beers user_pinned_beers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_pinned_beers
    ADD CONSTRAINT user_pinned_beers_pkey PRIMARY KEY (id);


--
-- Name: user_pinned_beers user_pinned_beers_user_id_beer_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_pinned_beers
    ADD CONSTRAINT user_pinned_beers_user_id_beer_id_key UNIQUE (user_id, beer_id);


--
-- Name: user_pinned_beers user_pinned_beers_user_id_position_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_pinned_beers
    ADD CONSTRAINT user_pinned_beers_user_id_position_key UNIQUE (user_id, "position");


--
-- Name: user_stats_snapshots user_stats_snapshots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_stats_snapshots
    ADD CONSTRAINT user_stats_snapshots_pkey PRIMARY KEY (user_id);


--
-- Name: waitlist waitlist_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waitlist
    ADD CONSTRAINT waitlist_pkey PRIMARY KEY (id);


--
-- Name: wishlist wishlist_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlist
    ADD CONSTRAINT wishlist_pkey PRIMARY KEY (id);


--
-- Name: wishlist wishlist_user_id_beer_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlist
    ADD CONSTRAINT wishlist_user_id_beer_id_key UNIQUE (user_id, beer_id);


--
-- Name: beer_logs_beer_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX beer_logs_beer_id_idx ON public.beer_logs USING btree (beer_id);


--
-- Name: beer_logs_brewery_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX beer_logs_brewery_id_idx ON public.beer_logs USING btree (brewery_id);


--
-- Name: beer_logs_logged_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX beer_logs_logged_at_idx ON public.beer_logs USING btree (logged_at DESC);


--
-- Name: beer_logs_session_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX beer_logs_session_id_idx ON public.beer_logs USING btree (session_id);


--
-- Name: beer_logs_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX beer_logs_user_id_idx ON public.beer_logs USING btree (user_id);


--
-- Name: beer_pour_sizes_beer_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX beer_pour_sizes_beer_id_idx ON public.beer_pour_sizes USING btree (beer_id);


--
-- Name: beers_brewery_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX beers_brewery_idx ON public.beers USING btree (brewery_id);


--
-- Name: beers_featured_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX beers_featured_idx ON public.beers USING btree (brewery_id) WHERE (is_featured = true);


--
-- Name: beers_name_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX beers_name_idx ON public.beers USING gin (name public.gin_trgm_ops);


--
-- Name: beers_style_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX beers_style_idx ON public.beers USING btree (style);


--
-- Name: breweries_city_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX breweries_city_idx ON public.breweries USING btree (city);


--
-- Name: breweries_location_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX breweries_location_idx ON public.breweries USING btree (latitude, longitude);


--
-- Name: breweries_name_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX breweries_name_idx ON public.breweries USING gin (name public.gin_trgm_ops);


--
-- Name: breweries_state_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX breweries_state_idx ON public.breweries USING btree (state);


--
-- Name: brewery_visits_brewery_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX brewery_visits_brewery_idx ON public.brewery_visits USING btree (brewery_id);


--
-- Name: brewery_visits_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX brewery_visits_user_idx ON public.brewery_visits USING btree (user_id);


--
-- Name: challenge_participants_challenge_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX challenge_participants_challenge_id_idx ON public.challenge_participants USING btree (challenge_id);


--
-- Name: challenge_participants_completed_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX challenge_participants_completed_at_idx ON public.challenge_participants USING btree (completed_at) WHERE (completed_at IS NOT NULL);


--
-- Name: challenge_participants_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX challenge_participants_user_id_idx ON public.challenge_participants USING btree (user_id);


--
-- Name: challenges_brewery_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX challenges_brewery_id_idx ON public.challenges USING btree (brewery_id);


--
-- Name: challenges_is_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX challenges_is_active_idx ON public.challenges USING btree (is_active) WHERE (is_active = true);


--
-- Name: challenges_sponsored_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX challenges_sponsored_active_idx ON public.challenges USING btree (is_sponsored, is_active) WHERE ((is_sponsored = true) AND (is_active = true));


--
-- Name: friendships_addressee_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX friendships_addressee_idx ON public.friendships USING btree (addressee_id);


--
-- Name: friendships_requester_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX friendships_requester_idx ON public.friendships USING btree (requester_id);


--
-- Name: hop_route_stop_beers_stop_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX hop_route_stop_beers_stop_idx ON public.hop_route_stop_beers USING btree (stop_id);


--
-- Name: hop_route_stops_route_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX hop_route_stops_route_idx ON public.hop_route_stops USING btree (route_id);


--
-- Name: hop_routes_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX hop_routes_status_idx ON public.hop_routes USING btree (status);


--
-- Name: hop_routes_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX hop_routes_user_idx ON public.hop_routes USING btree (user_id);


--
-- Name: idx_admin_actions_admin_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_actions_admin_user ON public.admin_actions USING btree (admin_user_id);


--
-- Name: idx_admin_actions_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_actions_created_at ON public.admin_actions USING btree (created_at DESC);


--
-- Name: idx_admin_actions_target; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_actions_target ON public.admin_actions USING btree (target_type, target_id);


--
-- Name: idx_admin_user_notes_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_admin_user_notes_unique ON public.admin_user_notes USING btree (user_id, admin_user_id);


--
-- Name: idx_admin_user_notes_updated; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_user_notes_updated ON public.admin_user_notes USING btree (user_id, updated_at DESC);


--
-- Name: idx_admin_user_notes_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_user_notes_user_id ON public.admin_user_notes USING btree (user_id);


--
-- Name: idx_admin_user_tags_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_admin_user_tags_unique ON public.admin_user_tags USING btree (user_id, tag);


--
-- Name: idx_admin_user_tags_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_user_tags_user_id ON public.admin_user_tags USING btree (user_id);


--
-- Name: idx_ai_recommendations_user_expires; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_recommendations_user_expires ON public.ai_recommendations USING btree (user_id, expires_at DESC);


--
-- Name: idx_ai_suggestions_brewery_generated; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_suggestions_brewery_generated ON public.ai_suggestions USING btree (brewery_id, generated_at DESC);


--
-- Name: idx_ai_suggestions_brewery_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_suggestions_brewery_status ON public.ai_suggestions USING btree (brewery_id, status);


--
-- Name: idx_api_keys_brewery; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_api_keys_brewery ON public.api_keys USING btree (brewery_id) WHERE (revoked_at IS NULL);


--
-- Name: idx_api_keys_hash; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_api_keys_hash ON public.api_keys USING btree (key_hash) WHERE (revoked_at IS NULL);


--
-- Name: idx_api_keys_prefix; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_api_keys_prefix ON public.api_keys USING btree (key_prefix);


--
-- Name: idx_beer_list_items_beer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_beer_list_items_beer ON public.beer_list_items USING btree (beer_id);


--
-- Name: idx_beer_list_items_list; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_beer_list_items_list ON public.beer_list_items USING btree (list_id);


--
-- Name: idx_beer_lists_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_beer_lists_user ON public.beer_lists USING btree (user_id);


--
-- Name: idx_beer_logs_brewery_logged; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_beer_logs_brewery_logged ON public.beer_logs USING btree (brewery_id, logged_at DESC);


--
-- Name: idx_beer_pour_sizes_one_default_per_beer; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_beer_pour_sizes_one_default_per_beer ON public.beer_pour_sizes USING btree (beer_id) WHERE (is_default = true);


--
-- Name: idx_beer_reviews_beer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_beer_reviews_beer ON public.beer_reviews USING btree (beer_id);


--
-- Name: idx_beer_reviews_flagged; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_beer_reviews_flagged ON public.beer_reviews USING btree (flagged_at DESC) WHERE (is_flagged = true);


--
-- Name: idx_beers_barcode; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_beers_barcode ON public.beers USING btree (barcode) WHERE (barcode IS NOT NULL);


--
-- Name: idx_beers_brand_catalog_beer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_beers_brand_catalog_beer_id ON public.beers USING btree (brand_catalog_beer_id) WHERE (brand_catalog_beer_id IS NOT NULL);


--
-- Name: idx_beers_item_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_beers_item_type ON public.beers USING btree (brewery_id, item_type);


--
-- Name: idx_beers_pos_item_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_beers_pos_item_id ON public.beers USING btree (pos_item_id) WHERE (pos_item_id IS NOT NULL);


--
-- Name: idx_beers_unique_name_per_brewery; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_beers_unique_name_per_brewery ON public.beers USING btree (brewery_id, lower(TRIM(BOTH FROM name))) WHERE (is_active = true);


--
-- Name: idx_brand_accounts_brand_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brand_accounts_brand_id ON public.brand_accounts USING btree (brand_id);


--
-- Name: idx_brand_accounts_location_scope; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brand_accounts_location_scope ON public.brand_accounts USING gin (location_scope) WHERE (location_scope IS NOT NULL);


--
-- Name: idx_brand_accounts_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brand_accounts_user_id ON public.brand_accounts USING btree (user_id);


--
-- Name: idx_brand_catalog_beers_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brand_catalog_beers_active ON public.brand_catalog_beers USING btree (brand_id) WHERE (is_active = true);


--
-- Name: idx_brand_catalog_beers_brand_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brand_catalog_beers_brand_id ON public.brand_catalog_beers USING btree (brand_id);


--
-- Name: idx_brand_catalog_beers_brand_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_brand_catalog_beers_brand_name ON public.brand_catalog_beers USING btree (brand_id, lower(name));


--
-- Name: idx_brand_loyalty_cards_brand; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brand_loyalty_cards_brand ON public.brand_loyalty_cards USING btree (brand_id);


--
-- Name: idx_brand_loyalty_cards_program; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brand_loyalty_cards_program ON public.brand_loyalty_cards USING btree (program_id);


--
-- Name: idx_brand_loyalty_cards_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brand_loyalty_cards_user ON public.brand_loyalty_cards USING btree (user_id);


--
-- Name: idx_brand_loyalty_programs_active; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_brand_loyalty_programs_active ON public.brand_loyalty_programs USING btree (brand_id) WHERE (is_active = true);


--
-- Name: idx_brand_loyalty_programs_brand; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brand_loyalty_programs_brand ON public.brand_loyalty_programs USING btree (brand_id);


--
-- Name: idx_brand_loyalty_redemptions_brand; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brand_loyalty_redemptions_brand ON public.brand_loyalty_redemptions USING btree (brand_id);


--
-- Name: idx_brand_loyalty_redemptions_card; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brand_loyalty_redemptions_card ON public.brand_loyalty_redemptions USING btree (card_id);


--
-- Name: idx_brand_team_activity_brand; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brand_team_activity_brand ON public.brand_team_activity USING btree (brand_id, created_at DESC);


--
-- Name: idx_breweries_brand_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_breweries_brand_id ON public.breweries USING btree (brand_id);


--
-- Name: idx_breweries_short_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_breweries_short_slug ON public.breweries USING btree (short_slug) WHERE (short_slug IS NOT NULL);


--
-- Name: idx_breweries_stripe_customer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_breweries_stripe_customer_id ON public.breweries USING btree (stripe_customer_id) WHERE (stripe_customer_id IS NOT NULL);


--
-- Name: idx_breweries_unique_name_location; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_breweries_unique_name_location ON public.breweries USING btree (lower(TRIM(BOTH FROM name)), lower(TRIM(BOTH FROM COALESCE(city, ''::text))), lower(TRIM(BOTH FROM COALESCE(state, ''::text))));


--
-- Name: idx_brewery_accounts_brewery; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brewery_accounts_brewery ON public.brewery_accounts USING btree (brewery_id);


--
-- Name: idx_brewery_accounts_propagated; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brewery_accounts_propagated ON public.brewery_accounts USING btree (brewery_id) WHERE (propagated_from_brand = true);


--
-- Name: idx_brewery_accounts_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brewery_accounts_user ON public.brewery_accounts USING btree (user_id);


--
-- Name: idx_brewery_ads_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brewery_ads_active ON public.brewery_ads USING btree (is_active, starts_at, ends_at) WHERE (is_active = true);


--
-- Name: idx_brewery_ads_brewery; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brewery_ads_brewery ON public.brewery_ads USING btree (brewery_id);


--
-- Name: idx_brewery_brands_owner_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brewery_brands_owner_id ON public.brewery_brands USING btree (owner_id);


--
-- Name: idx_brewery_brands_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brewery_brands_slug ON public.brewery_brands USING btree (slug);


--
-- Name: idx_brewery_brands_stripe_customer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brewery_brands_stripe_customer_id ON public.brewery_brands USING btree (stripe_customer_id) WHERE (stripe_customer_id IS NOT NULL);


--
-- Name: idx_brewery_events_brewery; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brewery_events_brewery ON public.brewery_events USING btree (brewery_id);


--
-- Name: idx_brewery_events_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brewery_events_date ON public.brewery_events USING btree (event_date);


--
-- Name: idx_brewery_follows_brewery; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brewery_follows_brewery ON public.brewery_follows USING btree (brewery_id);


--
-- Name: idx_brewery_follows_brewery_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brewery_follows_brewery_id ON public.brewery_follows USING btree (brewery_id);


--
-- Name: idx_brewery_follows_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brewery_follows_user ON public.brewery_follows USING btree (user_id);


--
-- Name: idx_brewery_menus_brewery_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brewery_menus_brewery_id ON public.brewery_menus USING btree (brewery_id);


--
-- Name: idx_brewery_reviews_brewery; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brewery_reviews_brewery ON public.brewery_reviews USING btree (brewery_id);


--
-- Name: idx_brewery_reviews_flagged; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brewery_reviews_flagged ON public.brewery_reviews USING btree (flagged_at DESC) WHERE (is_flagged = true);


--
-- Name: idx_brewery_reviews_responded; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brewery_reviews_responded ON public.brewery_reviews USING btree (brewery_id, responded_at DESC NULLS LAST) WHERE (responded_at IS NOT NULL);


--
-- Name: idx_brewery_submissions_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brewery_submissions_status ON public.brewery_submissions USING btree (status) WHERE (status = 'pending'::text);


--
-- Name: idx_brewery_submissions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brewery_submissions_user_id ON public.brewery_submissions USING btree (user_id);


--
-- Name: idx_brewery_visits_brewery_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_brewery_visits_brewery_id ON public.brewery_visits USING btree (brewery_id);


--
-- Name: idx_challenges_brewery_name_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_challenges_brewery_name_unique ON public.challenges USING btree (brewery_id, lower(name)) WHERE (is_active = true);


--
-- Name: idx_crawl_jobs_brewery; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_crawl_jobs_brewery ON public.crawl_jobs USING btree (brewery_id);


--
-- Name: idx_crawl_jobs_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_crawl_jobs_created ON public.crawl_jobs USING btree (created_at DESC);


--
-- Name: idx_crawl_jobs_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_crawl_jobs_status ON public.crawl_jobs USING btree (status);


--
-- Name: idx_crawl_sources_next; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_crawl_sources_next ON public.crawl_sources USING btree (next_crawl_at) WHERE (crawl_enabled = true);


--
-- Name: idx_crawled_beers_brewery; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_crawled_beers_brewery ON public.crawled_beers USING btree (brewery_id);


--
-- Name: idx_crawled_beers_job; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_crawled_beers_job ON public.crawled_beers USING btree (crawl_job_id);


--
-- Name: idx_crawled_beers_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_crawled_beers_status ON public.crawled_beers USING btree (status);


--
-- Name: idx_loyalty_cards_brewery; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_loyalty_cards_brewery ON public.loyalty_cards USING btree (brewery_id);


--
-- Name: idx_loyalty_cards_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_loyalty_cards_user ON public.loyalty_cards USING btree (user_id);


--
-- Name: idx_loyalty_rewards_brewery; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_loyalty_rewards_brewery ON public.loyalty_rewards USING btree (brewery_id);


--
-- Name: idx_loyalty_rewards_program; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_loyalty_rewards_program ON public.loyalty_rewards USING btree (program_id);


--
-- Name: idx_loyalty_rewards_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_loyalty_rewards_user ON public.loyalty_rewards USING btree (user_id);


--
-- Name: idx_mug_club_members_club_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mug_club_members_club_id ON public.mug_club_members USING btree (mug_club_id);


--
-- Name: idx_mug_club_members_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mug_club_members_user_id ON public.mug_club_members USING btree (user_id);


--
-- Name: idx_mug_clubs_brewery_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mug_clubs_brewery_id ON public.mug_clubs USING btree (brewery_id);


--
-- Name: idx_notification_rate_user_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notification_rate_user_type ON public.notification_rate_limits USING btree (user_id, trigger_type, sent_at DESC);


--
-- Name: idx_notifications_user_read; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_user_read ON public.notifications USING btree (user_id, read, created_at DESC);


--
-- Name: idx_pos_connections_brewery; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pos_connections_brewery ON public.pos_connections USING btree (brewery_id);


--
-- Name: idx_pos_item_mappings_beer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pos_item_mappings_beer ON public.pos_item_mappings USING btree (beer_id);


--
-- Name: idx_pos_item_mappings_brewery; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pos_item_mappings_brewery ON public.pos_item_mappings USING btree (brewery_id);


--
-- Name: idx_pos_item_mappings_connection; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pos_item_mappings_connection ON public.pos_item_mappings USING btree (pos_connection_id);


--
-- Name: idx_pos_sync_logs_brewery; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pos_sync_logs_brewery ON public.pos_sync_logs USING btree (brewery_id);


--
-- Name: idx_pos_sync_logs_connection; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pos_sync_logs_connection ON public.pos_sync_logs USING btree (pos_connection_id);


--
-- Name: idx_promotions_brewery; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_promotions_brewery ON public.promotions USING btree (brewery_id);


--
-- Name: idx_reactions_beer_log_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reactions_beer_log_id ON public.reactions USING btree (beer_log_id);


--
-- Name: idx_reactions_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reactions_session_id ON public.reactions USING btree (session_id);


--
-- Name: idx_redemption_codes_brewery; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_redemption_codes_brewery ON public.redemption_codes USING btree (brewery_id, status);


--
-- Name: idx_redemption_codes_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_redemption_codes_code ON public.redemption_codes USING btree (code) WHERE ((status)::text = 'pending'::text);


--
-- Name: idx_redemption_codes_code_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_redemption_codes_code_status ON public.redemption_codes USING btree (code, status);


--
-- Name: idx_redemption_codes_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_redemption_codes_user ON public.redemption_codes USING btree (user_id, status);


--
-- Name: idx_session_comments_session; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_session_comments_session ON public.session_comments USING btree (session_id, created_at);


--
-- Name: idx_session_comments_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_session_comments_user ON public.session_comments USING btree (user_id);


--
-- Name: idx_session_photos_session; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_session_photos_session ON public.session_photos USING btree (session_id);


--
-- Name: idx_sessions_brewery_active_started; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sessions_brewery_active_started ON public.sessions USING btree (brewery_id, is_active, started_at DESC);


--
-- Name: idx_sessions_geo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sessions_geo ON public.sessions USING btree (session_latitude, session_longitude) WHERE ((session_latitude IS NOT NULL) AND (session_longitude IS NOT NULL));


--
-- Name: idx_sessions_xp_tier; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sessions_xp_tier ON public.sessions USING btree (xp_tier) WHERE ((xp_tier)::text <> 'normal'::text);


--
-- Name: idx_trending_scores_city_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_trending_scores_city_type ON public.trending_scores USING btree (city, content_type, score DESC);


--
-- Name: idx_user_pinned_beers_beer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_pinned_beers_beer ON public.user_pinned_beers USING btree (beer_id);


--
-- Name: idx_user_pinned_beers_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_pinned_beers_user ON public.user_pinned_beers USING btree (user_id, "position");


--
-- Name: idx_user_stats_snapshots_computed_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_stats_snapshots_computed_at ON public.user_stats_snapshots USING btree (computed_at DESC);


--
-- Name: notifications_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notifications_user_idx ON public.notifications USING btree (user_id, read, created_at DESC);


--
-- Name: profiles_username_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX profiles_username_idx ON public.profiles USING gin (username public.gin_trgm_ops);


--
-- Name: referral_codes_code_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX referral_codes_code_idx ON public.referral_codes USING btree (code);


--
-- Name: referral_codes_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX referral_codes_user_idx ON public.referral_codes USING btree (user_id);


--
-- Name: referral_uses_referrer_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX referral_uses_referrer_idx ON public.referral_uses USING btree (referrer_id);


--
-- Name: session_participants_session_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX session_participants_session_idx ON public.session_participants USING btree (session_id);


--
-- Name: session_participants_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX session_participants_user_idx ON public.session_participants USING btree (user_id);


--
-- Name: sessions_brewery_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sessions_brewery_id_idx ON public.sessions USING btree (brewery_id);


--
-- Name: sessions_context_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sessions_context_idx ON public.sessions USING btree (context);


--
-- Name: sessions_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sessions_created_at_idx ON public.sessions USING btree (created_at DESC);


--
-- Name: sessions_is_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sessions_is_active_idx ON public.sessions USING btree (is_active);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sessions_user_id_idx ON public.sessions USING btree (user_id);


--
-- Name: user_achievements_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_achievements_user_idx ON public.user_achievements USING btree (user_id);


--
-- Name: waitlist_audience_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX waitlist_audience_idx ON public.waitlist USING btree (audience_type);


--
-- Name: waitlist_created_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX waitlist_created_idx ON public.waitlist USING btree (created_at DESC);


--
-- Name: waitlist_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX waitlist_email_key ON public.waitlist USING btree (lower(email));


--
-- Name: waitlist_state_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX waitlist_state_idx ON public.waitlist USING btree (state);


--
-- Name: wishlist_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX wishlist_user_idx ON public.wishlist USING btree (user_id);


--
-- Name: api_keys enforce_api_key_limit; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER enforce_api_key_limit BEFORE INSERT ON public.api_keys FOR EACH ROW EXECUTE FUNCTION public.check_api_key_limit();


--
-- Name: pos_connections pos_connections_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER pos_connections_updated_at BEFORE UPDATE ON public.pos_connections FOR EACH ROW EXECUTE FUNCTION public.update_pos_updated_at();


--
-- Name: pos_item_mappings pos_item_mappings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER pos_item_mappings_updated_at BEFORE UPDATE ON public.pos_item_mappings FOR EACH ROW EXECUTE FUNCTION public.update_pos_updated_at();


--
-- Name: brand_catalog_beers trg_brand_catalog_beers_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_brand_catalog_beers_updated_at BEFORE UPDATE ON public.brand_catalog_beers FOR EACH ROW EXECUTE FUNCTION public.update_brand_catalog_beers_updated_at();


--
-- Name: event_rsvps trg_event_rsvp_count; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_event_rsvp_count AFTER INSERT OR DELETE ON public.event_rsvps FOR EACH ROW EXECUTE FUNCTION public.update_event_rsvp_count();


--
-- Name: redemption_codes trg_pos_reference; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_pos_reference BEFORE UPDATE ON public.redemption_codes FOR EACH ROW EXECUTE FUNCTION public.set_pos_reference_on_confirm();


--
-- Name: sessions trg_sync_brewery_visits_on_session; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_sync_brewery_visits_on_session AFTER INSERT ON public.sessions FOR EACH ROW EXECUTE FUNCTION public.sync_brewery_visits_on_session();


--
-- Name: beer_logs trg_sync_brewery_visits_unique_beers; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_sync_brewery_visits_unique_beers AFTER INSERT ON public.beer_logs FOR EACH ROW EXECUTE FUNCTION public.sync_brewery_visits_unique_beers_on_beer_log();


--
-- Name: beer_logs trg_sync_profile_unique_beers; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_sync_profile_unique_beers AFTER INSERT ON public.beer_logs FOR EACH ROW EXECUTE FUNCTION public.sync_profile_unique_beers_on_beer_log();


--
-- Name: admin_actions admin_actions_admin_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_actions
    ADD CONSTRAINT admin_actions_admin_user_id_fkey FOREIGN KEY (admin_user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: admin_user_notes admin_user_notes_admin_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_user_notes
    ADD CONSTRAINT admin_user_notes_admin_user_id_fkey FOREIGN KEY (admin_user_id) REFERENCES public.profiles(id);


--
-- Name: admin_user_notes admin_user_notes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_user_notes
    ADD CONSTRAINT admin_user_notes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: admin_user_tags admin_user_tags_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_user_tags
    ADD CONSTRAINT admin_user_tags_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);


--
-- Name: admin_user_tags admin_user_tags_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_user_tags
    ADD CONSTRAINT admin_user_tags_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: ai_recommendations ai_recommendations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_recommendations
    ADD CONSTRAINT ai_recommendations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: ai_suggestions ai_suggestions_brewery_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_suggestions
    ADD CONSTRAINT ai_suggestions_brewery_id_fkey FOREIGN KEY (brewery_id) REFERENCES public.breweries(id) ON DELETE CASCADE;


--
-- Name: api_keys api_keys_brewery_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_brewery_id_fkey FOREIGN KEY (brewery_id) REFERENCES public.breweries(id) ON DELETE CASCADE;


--
-- Name: api_keys api_keys_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: beer_list_items beer_list_items_beer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beer_list_items
    ADD CONSTRAINT beer_list_items_beer_id_fkey FOREIGN KEY (beer_id) REFERENCES public.beers(id) ON DELETE CASCADE;


--
-- Name: beer_list_items beer_list_items_list_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beer_list_items
    ADD CONSTRAINT beer_list_items_list_id_fkey FOREIGN KEY (list_id) REFERENCES public.beer_lists(id) ON DELETE CASCADE;


--
-- Name: beer_lists beer_lists_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beer_lists
    ADD CONSTRAINT beer_lists_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: beer_logs beer_logs_beer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beer_logs
    ADD CONSTRAINT beer_logs_beer_id_fkey FOREIGN KEY (beer_id) REFERENCES public.beers(id) ON DELETE SET NULL;


--
-- Name: beer_logs beer_logs_brewery_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beer_logs
    ADD CONSTRAINT beer_logs_brewery_id_fkey FOREIGN KEY (brewery_id) REFERENCES public.breweries(id) ON DELETE SET NULL;


--
-- Name: beer_logs beer_logs_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beer_logs
    ADD CONSTRAINT beer_logs_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE CASCADE;


--
-- Name: beer_logs beer_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beer_logs
    ADD CONSTRAINT beer_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: beer_pour_sizes beer_pour_sizes_beer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beer_pour_sizes
    ADD CONSTRAINT beer_pour_sizes_beer_id_fkey FOREIGN KEY (beer_id) REFERENCES public.beers(id) ON DELETE CASCADE;


--
-- Name: beer_reviews beer_reviews_beer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beer_reviews
    ADD CONSTRAINT beer_reviews_beer_id_fkey FOREIGN KEY (beer_id) REFERENCES public.beers(id) ON DELETE CASCADE;


--
-- Name: beer_reviews beer_reviews_flagged_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beer_reviews
    ADD CONSTRAINT beer_reviews_flagged_by_fkey FOREIGN KEY (flagged_by) REFERENCES public.profiles(id);


--
-- Name: beer_reviews beer_reviews_moderated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beer_reviews
    ADD CONSTRAINT beer_reviews_moderated_by_fkey FOREIGN KEY (moderated_by) REFERENCES public.profiles(id);


--
-- Name: beer_reviews beer_reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beer_reviews
    ADD CONSTRAINT beer_reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: beers beers_brand_catalog_beer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beers
    ADD CONSTRAINT beers_brand_catalog_beer_id_fkey FOREIGN KEY (brand_catalog_beer_id) REFERENCES public.brand_catalog_beers(id) ON DELETE SET NULL;


--
-- Name: beers beers_brewery_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beers
    ADD CONSTRAINT beers_brewery_id_fkey FOREIGN KEY (brewery_id) REFERENCES public.breweries(id) ON DELETE CASCADE;


--
-- Name: beers beers_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beers
    ADD CONSTRAINT beers_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: brand_accounts brand_accounts_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brand_accounts
    ADD CONSTRAINT brand_accounts_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brewery_brands(id) ON DELETE CASCADE;


--
-- Name: brand_accounts brand_accounts_invited_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brand_accounts
    ADD CONSTRAINT brand_accounts_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: brand_accounts brand_accounts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brand_accounts
    ADD CONSTRAINT brand_accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: brand_catalog_beers brand_catalog_beers_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brand_catalog_beers
    ADD CONSTRAINT brand_catalog_beers_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brewery_brands(id) ON DELETE CASCADE;


--
-- Name: brand_catalog_beers brand_catalog_beers_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brand_catalog_beers
    ADD CONSTRAINT brand_catalog_beers_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: brand_loyalty_cards brand_loyalty_cards_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brand_loyalty_cards
    ADD CONSTRAINT brand_loyalty_cards_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brewery_brands(id) ON DELETE CASCADE;


--
-- Name: brand_loyalty_cards brand_loyalty_cards_last_stamp_brewery_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brand_loyalty_cards
    ADD CONSTRAINT brand_loyalty_cards_last_stamp_brewery_id_fkey FOREIGN KEY (last_stamp_brewery_id) REFERENCES public.breweries(id) ON DELETE SET NULL;


--
-- Name: brand_loyalty_cards brand_loyalty_cards_program_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brand_loyalty_cards
    ADD CONSTRAINT brand_loyalty_cards_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.brand_loyalty_programs(id) ON DELETE CASCADE;


--
-- Name: brand_loyalty_cards brand_loyalty_cards_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brand_loyalty_cards
    ADD CONSTRAINT brand_loyalty_cards_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: brand_loyalty_programs brand_loyalty_programs_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brand_loyalty_programs
    ADD CONSTRAINT brand_loyalty_programs_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brewery_brands(id) ON DELETE CASCADE;


--
-- Name: brand_loyalty_redemptions brand_loyalty_redemptions_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brand_loyalty_redemptions
    ADD CONSTRAINT brand_loyalty_redemptions_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brewery_brands(id) ON DELETE CASCADE;


--
-- Name: brand_loyalty_redemptions brand_loyalty_redemptions_brewery_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brand_loyalty_redemptions
    ADD CONSTRAINT brand_loyalty_redemptions_brewery_id_fkey FOREIGN KEY (brewery_id) REFERENCES public.breweries(id) ON DELETE CASCADE;


--
-- Name: brand_loyalty_redemptions brand_loyalty_redemptions_card_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brand_loyalty_redemptions
    ADD CONSTRAINT brand_loyalty_redemptions_card_id_fkey FOREIGN KEY (card_id) REFERENCES public.brand_loyalty_cards(id) ON DELETE CASCADE;


--
-- Name: brand_loyalty_redemptions brand_loyalty_redemptions_program_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brand_loyalty_redemptions
    ADD CONSTRAINT brand_loyalty_redemptions_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.brand_loyalty_programs(id) ON DELETE SET NULL;


--
-- Name: brand_loyalty_redemptions brand_loyalty_redemptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brand_loyalty_redemptions
    ADD CONSTRAINT brand_loyalty_redemptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: brand_team_activity brand_team_activity_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brand_team_activity
    ADD CONSTRAINT brand_team_activity_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: brand_team_activity brand_team_activity_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brand_team_activity
    ADD CONSTRAINT brand_team_activity_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brewery_brands(id) ON DELETE CASCADE;


--
-- Name: brand_team_activity brand_team_activity_target_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brand_team_activity
    ADD CONSTRAINT brand_team_activity_target_user_id_fkey FOREIGN KEY (target_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: breweries breweries_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.breweries
    ADD CONSTRAINT breweries_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brewery_brands(id) ON DELETE SET NULL;


--
-- Name: breweries breweries_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.breweries
    ADD CONSTRAINT breweries_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: brewery_accounts brewery_accounts_brewery_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brewery_accounts
    ADD CONSTRAINT brewery_accounts_brewery_id_fkey FOREIGN KEY (brewery_id) REFERENCES public.breweries(id) ON DELETE CASCADE;


--
-- Name: brewery_accounts brewery_accounts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brewery_accounts
    ADD CONSTRAINT brewery_accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: brewery_ads brewery_ads_brewery_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brewery_ads
    ADD CONSTRAINT brewery_ads_brewery_id_fkey FOREIGN KEY (brewery_id) REFERENCES public.breweries(id) ON DELETE CASCADE;


--
-- Name: brewery_brands brewery_brands_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brewery_brands
    ADD CONSTRAINT brewery_brands_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: brewery_claims brewery_claims_brewery_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brewery_claims
    ADD CONSTRAINT brewery_claims_brewery_id_fkey FOREIGN KEY (brewery_id) REFERENCES public.breweries(id) ON DELETE CASCADE;


--
-- Name: brewery_claims brewery_claims_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brewery_claims
    ADD CONSTRAINT brewery_claims_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES auth.users(id);


--
-- Name: brewery_claims brewery_claims_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brewery_claims
    ADD CONSTRAINT brewery_claims_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: brewery_events brewery_events_brewery_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brewery_events
    ADD CONSTRAINT brewery_events_brewery_id_fkey FOREIGN KEY (brewery_id) REFERENCES public.breweries(id) ON DELETE CASCADE;


--
-- Name: brewery_follows brewery_follows_brewery_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brewery_follows
    ADD CONSTRAINT brewery_follows_brewery_id_fkey FOREIGN KEY (brewery_id) REFERENCES public.breweries(id) ON DELETE CASCADE;


--
-- Name: brewery_follows brewery_follows_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brewery_follows
    ADD CONSTRAINT brewery_follows_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: brewery_menus brewery_menus_brewery_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brewery_menus
    ADD CONSTRAINT brewery_menus_brewery_id_fkey FOREIGN KEY (brewery_id) REFERENCES public.breweries(id) ON DELETE CASCADE;


--
-- Name: brewery_percentile_buckets brewery_percentile_buckets_brewery_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brewery_percentile_buckets
    ADD CONSTRAINT brewery_percentile_buckets_brewery_id_fkey FOREIGN KEY (brewery_id) REFERENCES public.breweries(id) ON DELETE CASCADE;


--
-- Name: brewery_reviews brewery_reviews_brewery_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brewery_reviews
    ADD CONSTRAINT brewery_reviews_brewery_id_fkey FOREIGN KEY (brewery_id) REFERENCES public.breweries(id) ON DELETE CASCADE;


--
-- Name: brewery_reviews brewery_reviews_flagged_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brewery_reviews
    ADD CONSTRAINT brewery_reviews_flagged_by_fkey FOREIGN KEY (flagged_by) REFERENCES public.profiles(id);


--
-- Name: brewery_reviews brewery_reviews_moderated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brewery_reviews
    ADD CONSTRAINT brewery_reviews_moderated_by_fkey FOREIGN KEY (moderated_by) REFERENCES public.profiles(id);


--
-- Name: brewery_reviews brewery_reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brewery_reviews
    ADD CONSTRAINT brewery_reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: brewery_submissions brewery_submissions_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brewery_submissions
    ADD CONSTRAINT brewery_submissions_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES auth.users(id);


--
-- Name: brewery_submissions brewery_submissions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brewery_submissions
    ADD CONSTRAINT brewery_submissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: brewery_visits brewery_visits_brewery_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brewery_visits
    ADD CONSTRAINT brewery_visits_brewery_id_fkey FOREIGN KEY (brewery_id) REFERENCES public.breweries(id) ON DELETE CASCADE;


--
-- Name: brewery_visits brewery_visits_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brewery_visits
    ADD CONSTRAINT brewery_visits_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: challenge_participants challenge_participants_challenge_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challenge_participants
    ADD CONSTRAINT challenge_participants_challenge_id_fkey FOREIGN KEY (challenge_id) REFERENCES public.challenges(id) ON DELETE CASCADE;


--
-- Name: challenge_participants challenge_participants_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challenge_participants
    ADD CONSTRAINT challenge_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: challenges challenges_brewery_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challenges
    ADD CONSTRAINT challenges_brewery_id_fkey FOREIGN KEY (brewery_id) REFERENCES public.breweries(id) ON DELETE CASCADE;


--
-- Name: crawl_jobs crawl_jobs_brewery_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crawl_jobs
    ADD CONSTRAINT crawl_jobs_brewery_id_fkey FOREIGN KEY (brewery_id) REFERENCES public.breweries(id) ON DELETE CASCADE;


--
-- Name: crawl_sources crawl_sources_brewery_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crawl_sources
    ADD CONSTRAINT crawl_sources_brewery_id_fkey FOREIGN KEY (brewery_id) REFERENCES public.breweries(id) ON DELETE CASCADE;


--
-- Name: crawled_beers crawled_beers_brewery_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crawled_beers
    ADD CONSTRAINT crawled_beers_brewery_id_fkey FOREIGN KEY (brewery_id) REFERENCES public.breweries(id) ON DELETE CASCADE;


--
-- Name: crawled_beers crawled_beers_crawl_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crawled_beers
    ADD CONSTRAINT crawled_beers_crawl_job_id_fkey FOREIGN KEY (crawl_job_id) REFERENCES public.crawl_jobs(id) ON DELETE CASCADE;


--
-- Name: crawled_beers crawled_beers_matched_beer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crawled_beers
    ADD CONSTRAINT crawled_beers_matched_beer_id_fkey FOREIGN KEY (matched_beer_id) REFERENCES public.beers(id);


--
-- Name: crawled_beers crawled_beers_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crawled_beers
    ADD CONSTRAINT crawled_beers_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id);


--
-- Name: event_rsvps event_rsvps_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_rsvps
    ADD CONSTRAINT event_rsvps_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.brewery_events(id) ON DELETE CASCADE;


--
-- Name: event_rsvps event_rsvps_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_rsvps
    ADD CONSTRAINT event_rsvps_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: friendships friendships_addressee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.friendships
    ADD CONSTRAINT friendships_addressee_id_fkey FOREIGN KEY (addressee_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: friendships friendships_requester_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.friendships
    ADD CONSTRAINT friendships_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: hop_route_stop_beers hop_route_stop_beers_beer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hop_route_stop_beers
    ADD CONSTRAINT hop_route_stop_beers_beer_id_fkey FOREIGN KEY (beer_id) REFERENCES public.beers(id) ON DELETE SET NULL;


--
-- Name: hop_route_stop_beers hop_route_stop_beers_stop_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hop_route_stop_beers
    ADD CONSTRAINT hop_route_stop_beers_stop_id_fkey FOREIGN KEY (stop_id) REFERENCES public.hop_route_stops(id) ON DELETE CASCADE;


--
-- Name: hop_route_stops hop_route_stops_brewery_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hop_route_stops
    ADD CONSTRAINT hop_route_stops_brewery_id_fkey FOREIGN KEY (brewery_id) REFERENCES public.breweries(id) ON DELETE SET NULL;


--
-- Name: hop_route_stops hop_route_stops_route_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hop_route_stops
    ADD CONSTRAINT hop_route_stops_route_id_fkey FOREIGN KEY (route_id) REFERENCES public.hop_routes(id) ON DELETE CASCADE;


--
-- Name: hop_routes hop_routes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hop_routes
    ADD CONSTRAINT hop_routes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: loyalty_cards loyalty_cards_brewery_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loyalty_cards
    ADD CONSTRAINT loyalty_cards_brewery_id_fkey FOREIGN KEY (brewery_id) REFERENCES public.breweries(id) ON DELETE CASCADE;


--
-- Name: loyalty_cards loyalty_cards_program_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loyalty_cards
    ADD CONSTRAINT loyalty_cards_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.loyalty_programs(id) ON DELETE SET NULL;


--
-- Name: loyalty_cards loyalty_cards_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loyalty_cards
    ADD CONSTRAINT loyalty_cards_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: loyalty_programs loyalty_programs_brewery_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loyalty_programs
    ADD CONSTRAINT loyalty_programs_brewery_id_fkey FOREIGN KEY (brewery_id) REFERENCES public.breweries(id) ON DELETE CASCADE;


--
-- Name: loyalty_redemptions loyalty_redemptions_brewery_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loyalty_redemptions
    ADD CONSTRAINT loyalty_redemptions_brewery_id_fkey FOREIGN KEY (brewery_id) REFERENCES public.breweries(id) ON DELETE CASCADE;


--
-- Name: loyalty_redemptions loyalty_redemptions_card_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loyalty_redemptions
    ADD CONSTRAINT loyalty_redemptions_card_id_fkey FOREIGN KEY (card_id) REFERENCES public.loyalty_cards(id) ON DELETE CASCADE;


--
-- Name: loyalty_redemptions loyalty_redemptions_program_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loyalty_redemptions
    ADD CONSTRAINT loyalty_redemptions_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.loyalty_programs(id) ON DELETE SET NULL;


--
-- Name: loyalty_redemptions loyalty_redemptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loyalty_redemptions
    ADD CONSTRAINT loyalty_redemptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: loyalty_rewards loyalty_rewards_brewery_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loyalty_rewards
    ADD CONSTRAINT loyalty_rewards_brewery_id_fkey FOREIGN KEY (brewery_id) REFERENCES public.breweries(id) ON DELETE CASCADE;


--
-- Name: loyalty_rewards loyalty_rewards_program_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loyalty_rewards
    ADD CONSTRAINT loyalty_rewards_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.loyalty_programs(id) ON DELETE CASCADE;


--
-- Name: loyalty_rewards loyalty_rewards_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loyalty_rewards
    ADD CONSTRAINT loyalty_rewards_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mug_club_members mug_club_members_mug_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mug_club_members
    ADD CONSTRAINT mug_club_members_mug_club_id_fkey FOREIGN KEY (mug_club_id) REFERENCES public.mug_clubs(id) ON DELETE CASCADE;


--
-- Name: mug_club_members mug_club_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mug_club_members
    ADD CONSTRAINT mug_club_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);


--
-- Name: mug_clubs mug_clubs_brewery_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mug_clubs
    ADD CONSTRAINT mug_clubs_brewery_id_fkey FOREIGN KEY (brewery_id) REFERENCES public.breweries(id) ON DELETE CASCADE;


--
-- Name: notification_rate_limits notification_rate_limits_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_rate_limits
    ADD CONSTRAINT notification_rate_limits_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: pos_connections pos_connections_brewery_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pos_connections
    ADD CONSTRAINT pos_connections_brewery_id_fkey FOREIGN KEY (brewery_id) REFERENCES public.breweries(id) ON DELETE CASCADE;


--
-- Name: pos_item_mappings pos_item_mappings_beer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pos_item_mappings
    ADD CONSTRAINT pos_item_mappings_beer_id_fkey FOREIGN KEY (beer_id) REFERENCES public.beers(id) ON DELETE SET NULL;


--
-- Name: pos_item_mappings pos_item_mappings_brewery_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pos_item_mappings
    ADD CONSTRAINT pos_item_mappings_brewery_id_fkey FOREIGN KEY (brewery_id) REFERENCES public.breweries(id) ON DELETE CASCADE;


--
-- Name: pos_item_mappings pos_item_mappings_pos_connection_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pos_item_mappings
    ADD CONSTRAINT pos_item_mappings_pos_connection_id_fkey FOREIGN KEY (pos_connection_id) REFERENCES public.pos_connections(id) ON DELETE CASCADE;


--
-- Name: pos_sync_logs pos_sync_logs_brewery_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pos_sync_logs
    ADD CONSTRAINT pos_sync_logs_brewery_id_fkey FOREIGN KEY (brewery_id) REFERENCES public.breweries(id) ON DELETE CASCADE;


--
-- Name: pos_sync_logs pos_sync_logs_pos_connection_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pos_sync_logs
    ADD CONSTRAINT pos_sync_logs_pos_connection_id_fkey FOREIGN KEY (pos_connection_id) REFERENCES public.pos_connections(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_referred_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_referred_by_fkey FOREIGN KEY (referred_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: promotions promotions_beer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT promotions_beer_id_fkey FOREIGN KEY (beer_id) REFERENCES public.beers(id) ON DELETE SET NULL;


--
-- Name: promotions promotions_brewery_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT promotions_brewery_id_fkey FOREIGN KEY (brewery_id) REFERENCES public.breweries(id) ON DELETE CASCADE;


--
-- Name: push_subscriptions push_subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT push_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: reactions reactions_beer_log_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reactions
    ADD CONSTRAINT reactions_beer_log_id_fkey FOREIGN KEY (beer_log_id) REFERENCES public.beer_logs(id) ON DELETE CASCADE;


--
-- Name: reactions reactions_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reactions
    ADD CONSTRAINT reactions_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE CASCADE;


--
-- Name: reactions reactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reactions
    ADD CONSTRAINT reactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: redemption_codes redemption_codes_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.redemption_codes
    ADD CONSTRAINT redemption_codes_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brewery_brands(id) ON DELETE SET NULL;


--
-- Name: redemption_codes redemption_codes_brewery_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.redemption_codes
    ADD CONSTRAINT redemption_codes_brewery_id_fkey FOREIGN KEY (brewery_id) REFERENCES public.breweries(id) ON DELETE CASCADE;


--
-- Name: redemption_codes redemption_codes_confirmed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.redemption_codes
    ADD CONSTRAINT redemption_codes_confirmed_by_fkey FOREIGN KEY (confirmed_by) REFERENCES auth.users(id);


--
-- Name: redemption_codes redemption_codes_mug_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.redemption_codes
    ADD CONSTRAINT redemption_codes_mug_club_id_fkey FOREIGN KEY (mug_club_id) REFERENCES public.mug_clubs(id) ON DELETE SET NULL;


--
-- Name: redemption_codes redemption_codes_program_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.redemption_codes
    ADD CONSTRAINT redemption_codes_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.loyalty_programs(id) ON DELETE SET NULL;


--
-- Name: redemption_codes redemption_codes_promotion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.redemption_codes
    ADD CONSTRAINT redemption_codes_promotion_id_fkey FOREIGN KEY (promotion_id) REFERENCES public.promotions(id) ON DELETE SET NULL;


--
-- Name: redemption_codes redemption_codes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.redemption_codes
    ADD CONSTRAINT redemption_codes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: referral_codes referral_codes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referral_codes
    ADD CONSTRAINT referral_codes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: referral_uses referral_uses_referred_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referral_uses
    ADD CONSTRAINT referral_uses_referred_id_fkey FOREIGN KEY (referred_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: referral_uses referral_uses_referrer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referral_uses
    ADD CONSTRAINT referral_uses_referrer_id_fkey FOREIGN KEY (referrer_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: session_comments session_comments_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_comments
    ADD CONSTRAINT session_comments_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE CASCADE;


--
-- Name: session_comments session_comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_comments
    ADD CONSTRAINT session_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: session_participants session_participants_invited_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_participants
    ADD CONSTRAINT session_participants_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: session_participants session_participants_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_participants
    ADD CONSTRAINT session_participants_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE CASCADE;


--
-- Name: session_participants session_participants_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_participants
    ADD CONSTRAINT session_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: session_photos session_photos_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_photos
    ADD CONSTRAINT session_photos_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE CASCADE;


--
-- Name: session_photos session_photos_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_photos
    ADD CONSTRAINT session_photos_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_brewery_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_brewery_id_fkey FOREIGN KEY (brewery_id) REFERENCES public.breweries(id) ON DELETE SET NULL;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: user_achievements user_achievements_achievement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_achievement_id_fkey FOREIGN KEY (achievement_id) REFERENCES public.achievements(id) ON DELETE CASCADE;


--
-- Name: user_achievements user_achievements_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: user_pinned_beers user_pinned_beers_beer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_pinned_beers
    ADD CONSTRAINT user_pinned_beers_beer_id_fkey FOREIGN KEY (beer_id) REFERENCES public.beers(id) ON DELETE CASCADE;


--
-- Name: user_pinned_beers user_pinned_beers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_pinned_beers
    ADD CONSTRAINT user_pinned_beers_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_stats_snapshots user_stats_snapshots_top_brewery_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_stats_snapshots
    ADD CONSTRAINT user_stats_snapshots_top_brewery_id_fkey FOREIGN KEY (top_brewery_id) REFERENCES public.breweries(id) ON DELETE SET NULL;


--
-- Name: user_stats_snapshots user_stats_snapshots_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_stats_snapshots
    ADD CONSTRAINT user_stats_snapshots_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: wishlist wishlist_beer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlist
    ADD CONSTRAINT wishlist_beer_id_fkey FOREIGN KEY (beer_id) REFERENCES public.beers(id) ON DELETE CASCADE;


--
-- Name: wishlist wishlist_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlist
    ADD CONSTRAINT wishlist_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: achievements Achievements are publicly readable; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Achievements are publicly readable" ON public.achievements FOR SELECT USING (true);


--
-- Name: referral_codes Anyone can look up referral codes by code; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can look up referral codes by code" ON public.referral_codes FOR SELECT USING (true);


--
-- Name: beer_list_items Anyone can read items of public lists; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can read items of public lists" ON public.beer_list_items FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.beer_lists
  WHERE ((beer_lists.id = beer_list_items.list_id) AND ((beer_lists.is_public = true) OR (beer_lists.user_id = auth.uid()))))));


--
-- Name: brand_loyalty_programs Anyone can view active brand loyalty programs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view active brand loyalty programs" ON public.brand_loyalty_programs FOR SELECT USING (true);


--
-- Name: beers Authenticated users can create beers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can create beers" ON public.beers FOR INSERT WITH CHECK ((auth.uid() IS NOT NULL));


--
-- Name: breweries Authenticated users can create breweries; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can create breweries" ON public.breweries FOR INSERT WITH CHECK ((auth.uid() IS NOT NULL));


--
-- Name: notifications Authenticated users can insert notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: user_achievements Authenticated users can read achievements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can read achievements" ON public.user_achievements FOR SELECT TO authenticated USING (true);


--
-- Name: beer_logs Authenticated users can view beer logs in shared sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view beer logs in shared sessions" ON public.beer_logs FOR SELECT USING (((auth.role() = 'authenticated'::text) AND (EXISTS ( SELECT 1
   FROM public.sessions s
  WHERE ((s.id = beer_logs.session_id) AND (s.share_to_feed = true))))));


--
-- Name: sessions Authenticated users can view shared sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view shared sessions" ON public.sessions FOR SELECT USING (((auth.role() = 'authenticated'::text) AND (share_to_feed = true)));


--
-- Name: beers Beers are publicly readable; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Beers are publicly readable" ON public.beers FOR SELECT USING (true);


--
-- Name: brand_loyalty_programs Brand owners/managers can delete programs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Brand owners/managers can delete programs" ON public.brand_loyalty_programs FOR DELETE USING (public.is_brand_manager_or_owner(brand_id, auth.uid()));


--
-- Name: brand_loyalty_programs Brand owners/managers can insert programs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Brand owners/managers can insert programs" ON public.brand_loyalty_programs FOR INSERT WITH CHECK (public.is_brand_manager_or_owner(brand_id, auth.uid()));


--
-- Name: brand_loyalty_cards Brand owners/managers can update cards; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Brand owners/managers can update cards" ON public.brand_loyalty_cards FOR UPDATE USING (public.is_brand_manager_or_owner(brand_id, auth.uid()));


--
-- Name: brand_loyalty_programs Brand owners/managers can update programs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Brand owners/managers can update programs" ON public.brand_loyalty_programs FOR UPDATE USING (public.is_brand_manager_or_owner(brand_id, auth.uid()));


--
-- Name: brand_loyalty_cards Brand owners/managers can view all cards; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Brand owners/managers can view all cards" ON public.brand_loyalty_cards FOR SELECT USING (public.is_brand_manager_or_owner(brand_id, auth.uid()));


--
-- Name: brand_loyalty_redemptions Brand owners/managers can view all redemptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Brand owners/managers can view all redemptions" ON public.brand_loyalty_redemptions FOR SELECT USING (public.is_brand_manager_or_owner(brand_id, auth.uid()));


--
-- Name: breweries Breweries are publicly readable; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Breweries are publicly readable" ON public.breweries FOR SELECT USING (true);


--
-- Name: api_keys Brewery admins can create API keys; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Brewery admins can create API keys" ON public.api_keys FOR INSERT WITH CHECK (((brewery_id IN ( SELECT ba.brewery_id
   FROM public.brewery_accounts ba
  WHERE ((ba.user_id = auth.uid()) AND (ba.role = ANY (ARRAY['owner'::text, 'manager'::text]))))) AND (created_by = auth.uid())));


--
-- Name: beers Brewery admins can delete beers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Brewery admins can delete beers" ON public.beers FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.brewery_accounts ba
  WHERE ((ba.brewery_id = beers.brewery_id) AND (ba.user_id = auth.uid())))));


--
-- Name: beer_pour_sizes Brewery admins can manage pour sizes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Brewery admins can manage pour sizes" ON public.beer_pour_sizes USING ((EXISTS ( SELECT 1
   FROM (public.beers b
     JOIN public.brewery_accounts ba ON ((ba.brewery_id = b.brewery_id)))
  WHERE ((b.id = beer_pour_sizes.beer_id) AND (ba.user_id = auth.uid())))));


--
-- Name: api_keys Brewery admins can revoke API keys; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Brewery admins can revoke API keys" ON public.api_keys FOR UPDATE USING ((brewery_id IN ( SELECT ba.brewery_id
   FROM public.brewery_accounts ba
  WHERE ((ba.user_id = auth.uid()) AND (ba.role = ANY (ARRAY['owner'::text, 'manager'::text]))))));


--
-- Name: beers Brewery admins can update beers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Brewery admins can update beers" ON public.beers FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.brewery_accounts ba
  WHERE ((ba.brewery_id = beers.brewery_id) AND (ba.user_id = auth.uid())))));


--
-- Name: redemption_codes Brewery admins can update brewery codes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Brewery admins can update brewery codes" ON public.redemption_codes FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.brewery_accounts
  WHERE ((brewery_accounts.brewery_id = redemption_codes.brewery_id) AND (brewery_accounts.user_id = auth.uid())))));


--
-- Name: ai_suggestions Brewery admins can update their suggestions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Brewery admins can update their suggestions" ON public.ai_suggestions FOR UPDATE USING ((brewery_id IN ( SELECT brewery_accounts.brewery_id
   FROM public.brewery_accounts
  WHERE ((brewery_accounts.user_id = auth.uid()) AND (brewery_accounts.role = ANY (ARRAY['owner'::text, 'manager'::text]))))));


--
-- Name: beer_logs Brewery admins can view beer logs at their brewery; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Brewery admins can view beer logs at their brewery" ON public.beer_logs FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.brewery_accounts ba
  WHERE ((ba.user_id = auth.uid()) AND (ba.brewery_id = beer_logs.brewery_id)))));


--
-- Name: redemption_codes Brewery admins can view brewery codes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Brewery admins can view brewery codes" ON public.redemption_codes FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.brewery_accounts
  WHERE ((brewery_accounts.brewery_id = redemption_codes.brewery_id) AND (brewery_accounts.user_id = auth.uid())))));


--
-- Name: loyalty_redemptions Brewery admins can view brewery redemptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Brewery admins can view brewery redemptions" ON public.loyalty_redemptions FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.brewery_accounts
  WHERE ((brewery_accounts.brewery_id = loyalty_redemptions.brewery_id) AND (brewery_accounts.user_id = auth.uid())))));


--
-- Name: sessions Brewery admins can view sessions at their brewery; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Brewery admins can view sessions at their brewery" ON public.sessions FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.brewery_accounts ba
  WHERE ((ba.user_id = auth.uid()) AND (ba.brewery_id = sessions.brewery_id)))));


--
-- Name: api_keys Brewery admins can view their own API keys; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Brewery admins can view their own API keys" ON public.api_keys FOR SELECT USING ((brewery_id IN ( SELECT ba.brewery_id
   FROM public.brewery_accounts ba
  WHERE ((ba.user_id = auth.uid()) AND (ba.role = ANY (ARRAY['owner'::text, 'manager'::text]))))));


--
-- Name: ai_suggestions Brewery admins can view their suggestions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Brewery admins can view their suggestions" ON public.ai_suggestions FOR SELECT USING ((brewery_id IN ( SELECT brewery_accounts.brewery_id
   FROM public.brewery_accounts
  WHERE ((brewery_accounts.user_id = auth.uid()) AND (brewery_accounts.role = ANY (ARRAY['owner'::text, 'manager'::text]))))));


--
-- Name: brewery_visits Brewery visits are publicly readable; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Brewery visits are publicly readable" ON public.brewery_visits FOR SELECT USING (true);


--
-- Name: breweries Creators can update their breweries; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Creators can update their breweries" ON public.breweries FOR UPDATE USING ((auth.uid() = created_by));


--
-- Name: hop_routes Friends can view active hop routes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Friends can view active hop routes" ON public.hop_routes FOR SELECT USING (((status = 'active'::public.hop_route_status) AND (EXISTS ( SELECT 1
   FROM public.friendships
  WHERE ((friendships.status = 'accepted'::text) AND (((friendships.requester_id = auth.uid()) AND (friendships.addressee_id = hop_routes.user_id)) OR ((friendships.addressee_id = auth.uid()) AND (friendships.requester_id = hop_routes.user_id))))))));


--
-- Name: session_participants Invited user can accept or decline; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Invited user can accept or decline" ON public.session_participants FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: beer_list_items List owners can delete items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "List owners can delete items" ON public.beer_list_items FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.beer_lists
  WHERE ((beer_lists.id = beer_list_items.list_id) AND (beer_lists.user_id = auth.uid())))));


--
-- Name: beer_list_items List owners can insert items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "List owners can insert items" ON public.beer_list_items FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.beer_lists
  WHERE ((beer_lists.id = beer_list_items.list_id) AND (beer_lists.user_id = auth.uid())))));


--
-- Name: beer_list_items List owners can update items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "List owners can update items" ON public.beer_list_items FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.beer_lists
  WHERE ((beer_lists.id = beer_list_items.list_id) AND (beer_lists.user_id = auth.uid())))));


--
-- Name: session_participants Participants can read their invites; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Participants can read their invites" ON public.session_participants FOR SELECT USING (((auth.uid() = user_id) OR (auth.uid() = invited_by) OR (auth.uid() IN ( SELECT sessions.user_id
   FROM public.sessions
  WHERE (sessions.id = session_participants.session_id)))));


--
-- Name: beer_pour_sizes Public can read pour sizes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can read pour sizes" ON public.beer_pour_sizes FOR SELECT USING (true);


--
-- Name: profiles Public profiles are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (((is_public = true) OR (auth.uid() = id)));


--
-- Name: reactions Reactions are publicly readable; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Reactions are publicly readable" ON public.reactions FOR SELECT USING (true);


--
-- Name: referral_uses Service can insert referral uses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service can insert referral uses" ON public.referral_uses FOR INSERT WITH CHECK (true);


--
-- Name: user_achievements Service role can insert achievements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can insert achievements" ON public.user_achievements FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: ai_suggestions Service role can insert suggestions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can insert suggestions" ON public.ai_suggestions FOR INSERT WITH CHECK (true);


--
-- Name: ai_recommendations Service role can manage recommendations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage recommendations" ON public.ai_recommendations WITH CHECK (true);


--
-- Name: session_participants Session owner can invite participants; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Session owner can invite participants" ON public.session_participants FOR INSERT WITH CHECK (((auth.uid() = invited_by) AND (auth.uid() IN ( SELECT sessions.user_id
   FROM public.sessions
  WHERE (sessions.id = session_participants.session_id)))));


--
-- Name: session_participants Session owner or participant can remove; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Session owner or participant can remove" ON public.session_participants FOR DELETE USING (((auth.uid() = user_id) OR (auth.uid() IN ( SELECT sessions.user_id
   FROM public.sessions
  WHERE (sessions.id = session_participants.session_id)))));


--
-- Name: crawl_jobs Superadmin full access on crawl_jobs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Superadmin full access on crawl_jobs" ON public.crawl_jobs USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_superadmin = true)))));


--
-- Name: crawl_sources Superadmin full access on crawl_sources; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Superadmin full access on crawl_sources" ON public.crawl_sources USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_superadmin = true)))));


--
-- Name: crawled_beers Superadmin full access on crawled_beers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Superadmin full access on crawled_beers" ON public.crawled_beers USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_superadmin = true)))));


--
-- Name: brewery_submissions Superadmins can read all submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Superadmins can read all submissions" ON public.brewery_submissions FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_superadmin = true)))));


--
-- Name: brewery_submissions Superadmins can update submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Superadmins can update submissions" ON public.brewery_submissions FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_superadmin = true)))));


--
-- Name: api_keys Superadmins can view all API keys; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Superadmins can view all API keys" ON public.api_keys FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_superadmin = true)))));


--
-- Name: brand_loyalty_cards System can insert brand loyalty cards; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can insert brand loyalty cards" ON public.brand_loyalty_cards FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: brand_loyalty_cards System can update own brand loyalty cards; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can update own brand loyalty cards" ON public.brand_loyalty_cards FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: trending_scores Trending scores are publicly readable; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Trending scores are publicly readable" ON public.trending_scores FOR SELECT USING (true);


--
-- Name: friendships Users can create friendship requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create friendship requests" ON public.friendships FOR INSERT WITH CHECK ((auth.uid() = requester_id));


--
-- Name: redemption_codes Users can create own codes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create own codes" ON public.redemption_codes FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: loyalty_redemptions Users can create own redemptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create own redemptions" ON public.loyalty_redemptions FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: beer_lists Users can create their own lists; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own lists" ON public.beer_lists FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: event_rsvps Users can delete own RSVPs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own RSVPs" ON public.event_rsvps FOR DELETE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: beer_logs Users can delete own beer logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own beer logs" ON public.beer_logs FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: sessions Users can delete own sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own sessions" ON public.sessions FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: push_subscriptions Users can delete own subscriptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own subscriptions" ON public.push_subscriptions FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: friendships Users can delete their friendships; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their friendships" ON public.friendships FOR DELETE USING (((auth.uid() = requester_id) OR (auth.uid() = addressee_id)));


--
-- Name: beer_lists Users can delete their own lists; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own lists" ON public.beer_lists FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: event_rsvps Users can insert own RSVPs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own RSVPs" ON public.event_rsvps FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: beer_logs Users can insert own beer logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own beer logs" ON public.beer_logs FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: brand_loyalty_redemptions Users can insert own brand redemptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own brand redemptions" ON public.brand_loyalty_redemptions FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: referral_codes Users can insert own referral code; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own referral code" ON public.referral_codes FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: sessions Users can insert own sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own sessions" ON public.sessions FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: brewery_submissions Users can insert own submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own submissions" ON public.brewery_submissions FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: push_subscriptions Users can insert own subscriptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own subscriptions" ON public.push_subscriptions FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: hop_route_stop_beers Users can manage beers on own route stops; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage beers on own route stops" ON public.hop_route_stop_beers USING ((auth.uid() IN ( SELECT hr.user_id
   FROM (public.hop_routes hr
     JOIN public.hop_route_stops hrs ON ((hrs.route_id = hr.id)))
  WHERE (hrs.id = hop_route_stop_beers.stop_id)))) WITH CHECK ((auth.uid() IN ( SELECT hr.user_id
   FROM (public.hop_routes hr
     JOIN public.hop_route_stops hrs ON ((hrs.route_id = hr.id)))
  WHERE (hrs.id = hop_route_stop_beers.stop_id))));


--
-- Name: hop_routes Users can manage own hop routes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage own hop routes" ON public.hop_routes USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: reactions Users can manage own reactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage own reactions" ON public.reactions USING ((auth.uid() = user_id));


--
-- Name: brewery_visits Users can manage own visits; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage own visits" ON public.brewery_visits USING ((auth.uid() = user_id));


--
-- Name: wishlist Users can manage own wishlist; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage own wishlist" ON public.wishlist USING ((auth.uid() = user_id));


--
-- Name: hop_route_stops Users can manage stops on own routes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage stops on own routes" ON public.hop_route_stops USING ((auth.uid() IN ( SELECT hop_routes.user_id
   FROM public.hop_routes
  WHERE (hop_routes.id = hop_route_stops.route_id)))) WITH CHECK ((auth.uid() IN ( SELECT hop_routes.user_id
   FROM public.hop_routes
  WHERE (hop_routes.id = hop_route_stops.route_id))));


--
-- Name: event_rsvps Users can read event RSVPs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read event RSVPs" ON public.event_rsvps FOR SELECT TO authenticated USING (true);


--
-- Name: user_achievements Users can read own achievements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read own achievements" ON public.user_achievements FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: friendships Users can read own friendships; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read own friendships" ON public.friendships FOR SELECT USING (((auth.uid() = requester_id) OR (auth.uid() = addressee_id)));


--
-- Name: notifications Users can read own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read own notifications" ON public.notifications FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: notification_rate_limits Users can read own rate limits; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read own rate limits" ON public.notification_rate_limits FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: referral_codes Users can read own referral code; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read own referral code" ON public.referral_codes FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: brewery_submissions Users can read own submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read own submissions" ON public.brewery_submissions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: push_subscriptions Users can read own subscriptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read own subscriptions" ON public.push_subscriptions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: beer_lists Users can read public lists; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read public lists" ON public.beer_lists FOR SELECT USING (((is_public = true) OR (auth.uid() = user_id)));


--
-- Name: referral_uses Users can read referrals they made or received; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read referrals they made or received" ON public.referral_uses FOR SELECT USING (((auth.uid() = referrer_id) OR (auth.uid() = referred_id)));


--
-- Name: event_rsvps Users can update own RSVPs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own RSVPs" ON public.event_rsvps FOR UPDATE TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: beer_logs Users can update own beer logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own beer logs" ON public.beer_logs FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: notifications Users can update own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: push_subscriptions Users can update own push subscriptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own push subscriptions" ON public.push_subscriptions FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: referral_codes Users can update own referral code use_count; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own referral code use_count" ON public.referral_codes FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: sessions Users can update own sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own sessions" ON public.sessions FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: friendships Users can update their friendships; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their friendships" ON public.friendships FOR UPDATE USING (((auth.uid() = addressee_id) OR (auth.uid() = requester_id)));


--
-- Name: beer_lists Users can update their own lists; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own lists" ON public.beer_lists FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: beer_logs Users can view own beer logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own beer logs" ON public.beer_logs FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: brand_loyalty_cards Users can view own brand loyalty cards; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own brand loyalty cards" ON public.brand_loyalty_cards FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: brand_loyalty_redemptions Users can view own brand redemptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own brand redemptions" ON public.brand_loyalty_redemptions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: redemption_codes Users can view own codes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own codes" ON public.redemption_codes FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: loyalty_redemptions Users can view own redemptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own redemptions" ON public.loyalty_redemptions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: sessions Users can view own sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own sessions" ON public.sessions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: ai_recommendations Users can view their own recommendations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own recommendations" ON public.ai_recommendations FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: _archive_checkins; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public._archive_checkins ENABLE ROW LEVEL SECURITY;

--
-- Name: achievements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

--
-- Name: admin_actions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

--
-- Name: admin_actions admin_actions_superadmin_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY admin_actions_superadmin_insert ON public.admin_actions FOR INSERT WITH CHECK (((admin_user_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_superadmin = true))))));


--
-- Name: admin_actions admin_actions_superadmin_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY admin_actions_superadmin_select ON public.admin_actions FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_superadmin = true)))));


--
-- Name: admin_user_notes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.admin_user_notes ENABLE ROW LEVEL SECURITY;

--
-- Name: admin_user_tags; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.admin_user_tags ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_recommendations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_suggestions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;

--
-- Name: api_keys; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

--
-- Name: beer_list_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.beer_list_items ENABLE ROW LEVEL SECURITY;

--
-- Name: beer_lists; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.beer_lists ENABLE ROW LEVEL SECURITY;

--
-- Name: beer_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.beer_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: beer_pour_sizes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.beer_pour_sizes ENABLE ROW LEVEL SECURITY;

--
-- Name: beer_reviews; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.beer_reviews ENABLE ROW LEVEL SECURITY;

--
-- Name: beer_reviews beer_reviews_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY beer_reviews_delete ON public.beer_reviews FOR DELETE TO authenticated USING ((user_id = auth.uid()));


--
-- Name: beer_reviews beer_reviews_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY beer_reviews_insert ON public.beer_reviews FOR INSERT TO authenticated WITH CHECK ((user_id = auth.uid()));


--
-- Name: beer_reviews beer_reviews_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY beer_reviews_read ON public.beer_reviews FOR SELECT USING (true);


--
-- Name: beer_reviews beer_reviews_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY beer_reviews_update ON public.beer_reviews FOR UPDATE TO authenticated USING ((user_id = auth.uid()));


--
-- Name: beers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.beers ENABLE ROW LEVEL SECURITY;

--
-- Name: brand_accounts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.brand_accounts ENABLE ROW LEVEL SECURITY;

--
-- Name: brand_accounts brand_accounts_manager_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brand_accounts_manager_delete ON public.brand_accounts FOR DELETE USING (((role <> 'owner'::text) AND public.is_brand_manager_or_owner(brand_id, auth.uid())));


--
-- Name: brand_accounts brand_accounts_manager_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brand_accounts_manager_insert ON public.brand_accounts FOR INSERT WITH CHECK (((role <> 'owner'::text) AND public.is_brand_manager_or_owner(brand_id, auth.uid())));


--
-- Name: brand_accounts brand_accounts_manager_read_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brand_accounts_manager_read_all ON public.brand_accounts FOR SELECT USING (public.is_brand_manager_or_owner(brand_id, auth.uid()));


--
-- Name: brand_accounts brand_accounts_manager_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brand_accounts_manager_update ON public.brand_accounts FOR UPDATE USING (((role <> 'owner'::text) AND public.is_brand_manager_or_owner(brand_id, auth.uid())));


--
-- Name: brand_accounts brand_accounts_owner_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brand_accounts_owner_delete ON public.brand_accounts FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.brewery_brands
  WHERE ((brewery_brands.id = brand_accounts.brand_id) AND (brewery_brands.owner_id = auth.uid())))));


--
-- Name: brand_accounts brand_accounts_owner_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brand_accounts_owner_insert ON public.brand_accounts FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.brewery_brands
  WHERE ((brewery_brands.id = brand_accounts.brand_id) AND (brewery_brands.owner_id = auth.uid())))));


--
-- Name: brand_accounts brand_accounts_owner_read_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brand_accounts_owner_read_all ON public.brand_accounts FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.brewery_brands
  WHERE ((brewery_brands.id = brand_accounts.brand_id) AND (brewery_brands.owner_id = auth.uid())))));


--
-- Name: brand_accounts brand_accounts_owner_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brand_accounts_owner_update ON public.brand_accounts FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.brewery_brands
  WHERE ((brewery_brands.id = brand_accounts.brand_id) AND (brewery_brands.owner_id = auth.uid())))));


--
-- Name: brand_accounts brand_accounts_read_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brand_accounts_read_own ON public.brand_accounts FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: brand_catalog_beers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.brand_catalog_beers ENABLE ROW LEVEL SECURITY;

--
-- Name: brand_catalog_beers brand_catalog_beers_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brand_catalog_beers_delete ON public.brand_catalog_beers FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.brand_accounts
  WHERE ((brand_accounts.brand_id = brand_catalog_beers.brand_id) AND (brand_accounts.user_id = auth.uid()) AND (brand_accounts.role = 'owner'::text)))));


--
-- Name: brand_catalog_beers brand_catalog_beers_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brand_catalog_beers_insert ON public.brand_catalog_beers FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.brand_accounts
  WHERE ((brand_accounts.brand_id = brand_catalog_beers.brand_id) AND (brand_accounts.user_id = auth.uid()) AND (brand_accounts.role = ANY (ARRAY['owner'::text, 'regional_manager'::text]))))));


--
-- Name: brand_catalog_beers brand_catalog_beers_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brand_catalog_beers_select ON public.brand_catalog_beers FOR SELECT USING (true);


--
-- Name: brand_catalog_beers brand_catalog_beers_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brand_catalog_beers_update ON public.brand_catalog_beers FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.brand_accounts
  WHERE ((brand_accounts.brand_id = brand_catalog_beers.brand_id) AND (brand_accounts.user_id = auth.uid()) AND (brand_accounts.role = ANY (ARRAY['owner'::text, 'regional_manager'::text]))))));


--
-- Name: brand_loyalty_cards; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.brand_loyalty_cards ENABLE ROW LEVEL SECURITY;

--
-- Name: brand_loyalty_programs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.brand_loyalty_programs ENABLE ROW LEVEL SECURITY;

--
-- Name: brand_loyalty_redemptions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.brand_loyalty_redemptions ENABLE ROW LEVEL SECURITY;

--
-- Name: brand_team_activity; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.brand_team_activity ENABLE ROW LEVEL SECURITY;

--
-- Name: brand_team_activity brand_team_activity_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brand_team_activity_insert ON public.brand_team_activity FOR INSERT WITH CHECK (public.is_brand_manager_or_owner(brand_id, auth.uid()));


--
-- Name: brand_team_activity brand_team_activity_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brand_team_activity_read ON public.brand_team_activity FOR SELECT USING (public.is_brand_manager_or_owner(brand_id, auth.uid()));


--
-- Name: breweries; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.breweries ENABLE ROW LEVEL SECURITY;

--
-- Name: brewery_accounts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.brewery_accounts ENABLE ROW LEVEL SECURITY;

--
-- Name: brewery_accounts brewery_accounts_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brewery_accounts_insert ON public.brewery_accounts FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: brewery_accounts brewery_accounts_manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brewery_accounts_manage ON public.brewery_accounts USING ((auth.uid() = user_id));


--
-- Name: brewery_accounts brewery_accounts_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brewery_accounts_select ON public.brewery_accounts FOR SELECT USING (true);


--
-- Name: brewery_accounts brewery_accounts_superadmin_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brewery_accounts_superadmin_update ON public.brewery_accounts FOR UPDATE USING (((auth.uid() = user_id) OR (EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_superadmin = true))))));


--
-- Name: brewery_accounts brewery_accounts_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brewery_accounts_update ON public.brewery_accounts FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: pos_connections brewery_admin_pos_connections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brewery_admin_pos_connections ON public.pos_connections USING ((brewery_id IN ( SELECT ba.brewery_id
   FROM public.brewery_accounts ba
  WHERE ((ba.user_id = auth.uid()) AND (ba.role = ANY (ARRAY['owner'::text, 'manager'::text]))))));


--
-- Name: pos_item_mappings brewery_admin_pos_item_mappings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brewery_admin_pos_item_mappings ON public.pos_item_mappings USING ((brewery_id IN ( SELECT ba.brewery_id
   FROM public.brewery_accounts ba
  WHERE ((ba.user_id = auth.uid()) AND (ba.role = ANY (ARRAY['owner'::text, 'manager'::text]))))));


--
-- Name: pos_sync_logs brewery_admin_read_pos_sync_logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brewery_admin_read_pos_sync_logs ON public.pos_sync_logs FOR SELECT USING ((brewery_id IN ( SELECT ba.brewery_id
   FROM public.brewery_accounts ba
  WHERE ((ba.user_id = auth.uid()) AND (ba.role = ANY (ARRAY['owner'::text, 'manager'::text]))))));


--
-- Name: brewery_ads brewery_admins_manage_ads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brewery_admins_manage_ads ON public.brewery_ads USING ((brewery_id IN ( SELECT ba.brewery_id
   FROM public.brewery_accounts ba
  WHERE ((ba.user_id = auth.uid()) AND (ba.role = ANY (ARRAY['owner'::text, 'manager'::text]))))));


--
-- Name: mug_club_members brewery_admins_manage_members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brewery_admins_manage_members ON public.mug_club_members USING ((mug_club_id IN ( SELECT mc.id
   FROM (public.mug_clubs mc
     JOIN public.brewery_accounts ba ON ((ba.brewery_id = mc.brewery_id)))
  WHERE ((ba.user_id = auth.uid()) AND (ba.role = ANY (ARRAY['owner'::text, 'manager'::text]))))));


--
-- Name: mug_clubs brewery_admins_manage_mug_clubs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brewery_admins_manage_mug_clubs ON public.mug_clubs USING ((brewery_id IN ( SELECT ba.brewery_id
   FROM public.brewery_accounts ba
  WHERE ((ba.user_id = auth.uid()) AND (ba.role = ANY (ARRAY['owner'::text, 'manager'::text]))))));


--
-- Name: mug_club_members brewery_admins_read_members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brewery_admins_read_members ON public.mug_club_members FOR SELECT USING ((mug_club_id IN ( SELECT mc.id
   FROM (public.mug_clubs mc
     JOIN public.brewery_accounts ba ON ((ba.brewery_id = mc.brewery_id)))
  WHERE ((ba.user_id = auth.uid()) AND (ba.role = ANY (ARRAY['owner'::text, 'manager'::text]))))));


--
-- Name: brewery_ads; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.brewery_ads ENABLE ROW LEVEL SECURITY;

--
-- Name: brewery_brands; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.brewery_brands ENABLE ROW LEVEL SECURITY;

--
-- Name: brewery_brands brewery_brands_member_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brewery_brands_member_update ON public.brewery_brands FOR UPDATE USING (((auth.uid() = owner_id) OR (EXISTS ( SELECT 1
   FROM public.brand_accounts
  WHERE ((brand_accounts.brand_id = brewery_brands.id) AND (brand_accounts.user_id = auth.uid()) AND (brand_accounts.role = ANY (ARRAY['owner'::text, 'brand_manager'::text, 'regional_manager'::text])))))));


--
-- Name: brewery_brands brewery_brands_owner_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brewery_brands_owner_delete ON public.brewery_brands FOR DELETE USING ((auth.uid() = owner_id));


--
-- Name: brewery_brands brewery_brands_owner_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brewery_brands_owner_insert ON public.brewery_brands FOR INSERT WITH CHECK ((auth.uid() = owner_id));


--
-- Name: brewery_brands brewery_brands_public_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brewery_brands_public_read ON public.brewery_brands FOR SELECT USING (true);


--
-- Name: brewery_claims; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.brewery_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: brewery_claims brewery_claims_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brewery_claims_insert ON public.brewery_claims FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: brewery_claims brewery_claims_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brewery_claims_select ON public.brewery_claims FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: brewery_claims brewery_claims_superadmin_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brewery_claims_superadmin_select ON public.brewery_claims FOR SELECT USING (((auth.uid() = user_id) OR (EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_superadmin = true))))));


--
-- Name: brewery_claims brewery_claims_superadmin_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brewery_claims_superadmin_update ON public.brewery_claims FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_superadmin = true)))));


--
-- Name: brewery_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.brewery_events ENABLE ROW LEVEL SECURITY;

--
-- Name: brewery_events brewery_events_admin_manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brewery_events_admin_manage ON public.brewery_events USING ((EXISTS ( SELECT 1
   FROM public.brewery_accounts
  WHERE ((brewery_accounts.brewery_id = brewery_events.brewery_id) AND (brewery_accounts.user_id = auth.uid())))));


--
-- Name: brewery_events brewery_events_public_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brewery_events_public_select ON public.brewery_events FOR SELECT USING ((is_active = true));


--
-- Name: brewery_follows; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.brewery_follows ENABLE ROW LEVEL SECURITY;

--
-- Name: brewery_follows brewery_follows_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brewery_follows_delete ON public.brewery_follows FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: brewery_follows brewery_follows_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brewery_follows_insert ON public.brewery_follows FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: brewery_follows brewery_follows_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brewery_follows_select ON public.brewery_follows FOR SELECT USING (true);


--
-- Name: brewery_menus; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.brewery_menus ENABLE ROW LEVEL SECURITY;

--
-- Name: brewery_menus brewery_menus_public_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brewery_menus_public_read ON public.brewery_menus FOR SELECT USING ((is_active = true));


--
-- Name: brewery_menus brewery_menus_staff_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brewery_menus_staff_delete ON public.brewery_menus FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.brewery_accounts
  WHERE ((brewery_accounts.brewery_id = brewery_menus.brewery_id) AND (brewery_accounts.user_id = auth.uid())))));


--
-- Name: brewery_menus brewery_menus_staff_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brewery_menus_staff_insert ON public.brewery_menus FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.brewery_accounts
  WHERE ((brewery_accounts.brewery_id = brewery_menus.brewery_id) AND (brewery_accounts.user_id = auth.uid())))));


--
-- Name: brewery_menus brewery_menus_staff_read_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brewery_menus_staff_read_all ON public.brewery_menus FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.brewery_accounts
  WHERE ((brewery_accounts.brewery_id = brewery_menus.brewery_id) AND (brewery_accounts.user_id = auth.uid())))));


--
-- Name: brewery_menus brewery_menus_staff_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brewery_menus_staff_update ON public.brewery_menus FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.brewery_accounts
  WHERE ((brewery_accounts.brewery_id = brewery_menus.brewery_id) AND (brewery_accounts.user_id = auth.uid())))));


--
-- Name: brewery_percentile_buckets; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.brewery_percentile_buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: brewery_percentile_buckets brewery_percentile_buckets_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brewery_percentile_buckets_read ON public.brewery_percentile_buckets FOR SELECT USING (true);


--
-- Name: brewery_reviews; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.brewery_reviews ENABLE ROW LEVEL SECURITY;

--
-- Name: brewery_reviews brewery_reviews_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brewery_reviews_delete ON public.brewery_reviews FOR DELETE TO authenticated USING ((user_id = auth.uid()));


--
-- Name: brewery_reviews brewery_reviews_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brewery_reviews_insert ON public.brewery_reviews FOR INSERT TO authenticated WITH CHECK ((user_id = auth.uid()));


--
-- Name: brewery_reviews brewery_reviews_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brewery_reviews_read ON public.brewery_reviews FOR SELECT USING (true);


--
-- Name: brewery_reviews brewery_reviews_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY brewery_reviews_update ON public.brewery_reviews FOR UPDATE TO authenticated USING ((user_id = auth.uid()));


--
-- Name: brewery_submissions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.brewery_submissions ENABLE ROW LEVEL SECURITY;

--
-- Name: brewery_visits; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.brewery_visits ENABLE ROW LEVEL SECURITY;

--
-- Name: challenge_participants; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;

--
-- Name: challenge_participants challenge_participants_insert_auth; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY challenge_participants_insert_auth ON public.challenge_participants FOR INSERT WITH CHECK ((user_id = auth.uid()));


--
-- Name: challenge_participants challenge_participants_select_brewery_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY challenge_participants_select_brewery_admin ON public.challenge_participants FOR SELECT USING ((EXISTS ( SELECT 1
   FROM (public.challenges
     JOIN public.brewery_accounts ON ((brewery_accounts.brewery_id = challenges.brewery_id)))
  WHERE ((challenges.id = challenge_participants.challenge_id) AND (brewery_accounts.user_id = auth.uid()) AND (brewery_accounts.role = ANY (ARRAY['owner'::text, 'manager'::text]))))));


--
-- Name: challenge_participants challenge_participants_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY challenge_participants_select_own ON public.challenge_participants FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: challenge_participants challenge_participants_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY challenge_participants_update_own ON public.challenge_participants FOR UPDATE USING ((user_id = auth.uid()));


--
-- Name: challenges; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: challenges challenges_delete_brewery_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY challenges_delete_brewery_admin ON public.challenges FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.brewery_accounts
  WHERE ((brewery_accounts.brewery_id = challenges.brewery_id) AND (brewery_accounts.user_id = auth.uid()) AND (brewery_accounts.role = ANY (ARRAY['owner'::text, 'manager'::text]))))));


--
-- Name: challenges challenges_insert_brewery_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY challenges_insert_brewery_admin ON public.challenges FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.brewery_accounts
  WHERE ((brewery_accounts.brewery_id = challenges.brewery_id) AND (brewery_accounts.user_id = auth.uid()) AND (brewery_accounts.role = ANY (ARRAY['owner'::text, 'manager'::text]))))));


--
-- Name: challenges challenges_select_brewery_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY challenges_select_brewery_admin ON public.challenges FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.brewery_accounts
  WHERE ((brewery_accounts.brewery_id = challenges.brewery_id) AND (brewery_accounts.user_id = auth.uid()) AND (brewery_accounts.role = ANY (ARRAY['owner'::text, 'manager'::text]))))));


--
-- Name: challenges challenges_select_public; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY challenges_select_public ON public.challenges FOR SELECT USING ((is_active = true));


--
-- Name: challenges challenges_select_sponsored_public; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY challenges_select_sponsored_public ON public.challenges FOR SELECT USING (((is_sponsored = true) AND (is_active = true)));


--
-- Name: challenges challenges_update_brewery_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY challenges_update_brewery_admin ON public.challenges FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.brewery_accounts
  WHERE ((brewery_accounts.brewery_id = challenges.brewery_id) AND (brewery_accounts.user_id = auth.uid()) AND (brewery_accounts.role = ANY (ARRAY['owner'::text, 'manager'::text]))))));


--
-- Name: crawl_jobs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.crawl_jobs ENABLE ROW LEVEL SECURITY;

--
-- Name: crawl_sources; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.crawl_sources ENABLE ROW LEVEL SECURITY;

--
-- Name: crawled_beers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.crawled_beers ENABLE ROW LEVEL SECURITY;

--
-- Name: event_rsvps; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

--
-- Name: friendships; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

--
-- Name: hop_route_stop_beers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.hop_route_stop_beers ENABLE ROW LEVEL SECURITY;

--
-- Name: hop_route_stops; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.hop_route_stops ENABLE ROW LEVEL SECURITY;

--
-- Name: hop_routes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.hop_routes ENABLE ROW LEVEL SECURITY;

--
-- Name: loyalty_cards; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.loyalty_cards ENABLE ROW LEVEL SECURITY;

--
-- Name: loyalty_cards loyalty_cards_brewery_admin_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY loyalty_cards_brewery_admin_select ON public.loyalty_cards FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.brewery_accounts
  WHERE ((brewery_accounts.brewery_id = loyalty_cards.brewery_id) AND (brewery_accounts.user_id = auth.uid())))));


--
-- Name: loyalty_cards loyalty_cards_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY loyalty_cards_insert ON public.loyalty_cards FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: loyalty_cards loyalty_cards_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY loyalty_cards_select ON public.loyalty_cards FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: loyalty_cards loyalty_cards_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY loyalty_cards_update ON public.loyalty_cards FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: loyalty_programs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.loyalty_programs ENABLE ROW LEVEL SECURITY;

--
-- Name: loyalty_programs loyalty_programs_manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY loyalty_programs_manage ON public.loyalty_programs USING ((EXISTS ( SELECT 1
   FROM public.brewery_accounts
  WHERE ((brewery_accounts.brewery_id = loyalty_programs.brewery_id) AND (brewery_accounts.user_id = auth.uid())))));


--
-- Name: loyalty_programs loyalty_programs_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY loyalty_programs_select ON public.loyalty_programs FOR SELECT USING (true);


--
-- Name: loyalty_redemptions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.loyalty_redemptions ENABLE ROW LEVEL SECURITY;

--
-- Name: loyalty_rewards; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.loyalty_rewards ENABLE ROW LEVEL SECURITY;

--
-- Name: loyalty_rewards loyalty_rewards_brewery_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY loyalty_rewards_brewery_select ON public.loyalty_rewards FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.brewery_accounts
  WHERE ((brewery_accounts.brewery_id = loyalty_rewards.brewery_id) AND (brewery_accounts.user_id = auth.uid())))));


--
-- Name: loyalty_rewards loyalty_rewards_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY loyalty_rewards_insert ON public.loyalty_rewards FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: loyalty_rewards loyalty_rewards_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY loyalty_rewards_update ON public.loyalty_rewards FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.brewery_accounts
  WHERE ((brewery_accounts.brewery_id = loyalty_rewards.brewery_id) AND (brewery_accounts.user_id = auth.uid())))));


--
-- Name: loyalty_rewards loyalty_rewards_user_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY loyalty_rewards_user_select ON public.loyalty_rewards FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: mug_club_members members_read_own_membership; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY members_read_own_membership ON public.mug_club_members FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: mug_club_members; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.mug_club_members ENABLE ROW LEVEL SECURITY;

--
-- Name: mug_clubs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.mug_clubs ENABLE ROW LEVEL SECURITY;

--
-- Name: notification_rate_limits; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notification_rate_limits ENABLE ROW LEVEL SECURITY;

--
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: overall_percentile_buckets; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.overall_percentile_buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: overall_percentile_buckets overall_percentile_buckets_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY overall_percentile_buckets_read ON public.overall_percentile_buckets FOR SELECT USING (true);


--
-- Name: pos_connections; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pos_connections ENABLE ROW LEVEL SECURITY;

--
-- Name: pos_item_mappings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pos_item_mappings ENABLE ROW LEVEL SECURITY;

--
-- Name: pos_sync_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pos_sync_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: promotions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

--
-- Name: promotions promotions_manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY promotions_manage ON public.promotions USING ((EXISTS ( SELECT 1
   FROM public.brewery_accounts
  WHERE ((brewery_accounts.brewery_id = promotions.brewery_id) AND (brewery_accounts.user_id = auth.uid())))));


--
-- Name: promotions promotions_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY promotions_select ON public.promotions FOR SELECT USING (true);


--
-- Name: push_subscriptions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

--
-- Name: reactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

--
-- Name: redemption_codes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.redemption_codes ENABLE ROW LEVEL SECURITY;

--
-- Name: redemption_codes redemption_codes_select_staff; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY redemption_codes_select_staff ON public.redemption_codes FOR SELECT USING (((user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.brewery_accounts
  WHERE ((brewery_accounts.brewery_id = redemption_codes.brewery_id) AND (brewery_accounts.user_id = auth.uid()) AND (brewery_accounts.role = ANY (ARRAY['owner'::text, 'business'::text, 'marketing'::text, 'staff'::text])))))));


--
-- Name: redemption_codes redemption_codes_update_staff; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY redemption_codes_update_staff ON public.redemption_codes FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.brewery_accounts
  WHERE ((brewery_accounts.brewery_id = redemption_codes.brewery_id) AND (brewery_accounts.user_id = auth.uid()) AND (brewery_accounts.role = ANY (ARRAY['owner'::text, 'business'::text, 'marketing'::text, 'staff'::text]))))));


--
-- Name: referral_codes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

--
-- Name: referral_uses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.referral_uses ENABLE ROW LEVEL SECURITY;

--
-- Name: session_comments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.session_comments ENABLE ROW LEVEL SECURITY;

--
-- Name: session_comments session_comments_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY session_comments_delete ON public.session_comments FOR DELETE TO authenticated USING (((user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.sessions s
  WHERE ((s.id = session_comments.session_id) AND (s.user_id = auth.uid()))))));


--
-- Name: session_comments session_comments_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY session_comments_insert ON public.session_comments FOR INSERT TO authenticated WITH CHECK ((user_id = auth.uid()));


--
-- Name: session_comments session_comments_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY session_comments_select ON public.session_comments FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.sessions s
  WHERE ((s.id = session_comments.session_id) AND (s.share_to_feed = true)))));


--
-- Name: session_participants; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.session_participants ENABLE ROW LEVEL SECURITY;

--
-- Name: session_photos; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.session_photos ENABLE ROW LEVEL SECURITY;

--
-- Name: session_photos session_photos_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY session_photos_delete ON public.session_photos FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: session_photos session_photos_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY session_photos_insert ON public.session_photos FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: session_photos session_photos_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY session_photos_select ON public.session_photos FOR SELECT USING (true);


--
-- Name: sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: style_percentile_buckets; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.style_percentile_buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: style_percentile_buckets style_percentile_buckets_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY style_percentile_buckets_read ON public.style_percentile_buckets FOR SELECT USING (true);


--
-- Name: admin_user_tags superadmin_delete_user_tags; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY superadmin_delete_user_tags ON public.admin_user_tags FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_superadmin = true)))));


--
-- Name: brewery_ads superadmin_manage_ads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY superadmin_manage_ads ON public.brewery_ads USING ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.is_superadmin = true)))));


--
-- Name: mug_club_members superadmin_manage_members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY superadmin_manage_members ON public.mug_club_members USING ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.is_superadmin = true)))));


--
-- Name: mug_clubs superadmin_manage_mug_clubs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY superadmin_manage_mug_clubs ON public.mug_clubs USING ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.is_superadmin = true)))));


--
-- Name: pos_connections superadmin_read_pos_connections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY superadmin_read_pos_connections ON public.pos_connections FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_superadmin = true)))));


--
-- Name: pos_sync_logs superadmin_read_pos_sync_logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY superadmin_read_pos_sync_logs ON public.pos_sync_logs FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_superadmin = true)))));


--
-- Name: admin_user_notes superadmin_read_user_notes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY superadmin_read_user_notes ON public.admin_user_notes FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_superadmin = true)))));


--
-- Name: admin_user_tags superadmin_read_user_tags; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY superadmin_read_user_tags ON public.admin_user_tags FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_superadmin = true)))));


--
-- Name: admin_user_notes superadmin_update_user_notes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY superadmin_update_user_notes ON public.admin_user_notes FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_superadmin = true)))));


--
-- Name: admin_user_notes superadmin_write_user_notes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY superadmin_write_user_notes ON public.admin_user_notes FOR INSERT WITH CHECK (((admin_user_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_superadmin = true))))));


--
-- Name: admin_user_tags superadmin_write_user_tags; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY superadmin_write_user_tags ON public.admin_user_tags FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_superadmin = true)))));


--
-- Name: trending_scores; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.trending_scores ENABLE ROW LEVEL SECURITY;

--
-- Name: user_achievements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

--
-- Name: user_pinned_beers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_pinned_beers ENABLE ROW LEVEL SECURITY;

--
-- Name: user_pinned_beers user_pinned_beers_delete_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY user_pinned_beers_delete_own ON public.user_pinned_beers FOR DELETE TO authenticated USING ((user_id = auth.uid()));


--
-- Name: user_pinned_beers user_pinned_beers_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY user_pinned_beers_insert_own ON public.user_pinned_beers FOR INSERT TO authenticated WITH CHECK ((user_id = auth.uid()));


--
-- Name: user_pinned_beers user_pinned_beers_read_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY user_pinned_beers_read_all ON public.user_pinned_beers FOR SELECT USING (true);


--
-- Name: user_pinned_beers user_pinned_beers_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY user_pinned_beers_update_own ON public.user_pinned_beers FOR UPDATE TO authenticated USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));


--
-- Name: user_stats_snapshots; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_stats_snapshots ENABLE ROW LEVEL SECURITY;

--
-- Name: user_stats_snapshots user_stats_snapshots_read_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY user_stats_snapshots_read_all ON public.user_stats_snapshots FOR SELECT USING (true);


--
-- Name: brewery_ads users_read_active_ads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY users_read_active_ads ON public.brewery_ads FOR SELECT USING (((is_active = true) AND (starts_at <= now()) AND ((ends_at IS NULL) OR (ends_at > now()))));


--
-- Name: mug_clubs users_read_mug_clubs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY users_read_mug_clubs ON public.mug_clubs FOR SELECT USING ((auth.uid() IS NOT NULL));


--
-- Name: waitlist; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

--
-- Name: wishlist; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


