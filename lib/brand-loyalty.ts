import { SupabaseClient } from '@supabase/supabase-js'

export interface BrandLoyaltyProgram {
  id: string
  brand_id: string
  name: string
  description: string | null
  stamps_required: number
  reward_description: string
  earn_per_session: number
  is_active: boolean
  created_at: string
}

export interface BrandLoyaltyCard {
  id: string
  user_id: string
  brand_id: string
  program_id: string
  stamps: number
  lifetime_stamps: number
  last_stamp_at: string | null
  last_stamp_brewery_id: string | null
  created_at: string
}

export interface BrandLoyaltyRedemption {
  id: string
  card_id: string
  user_id: string
  brand_id: string
  brewery_id: string
  program_id: string
  redeemed_at: string
}

/**
 * Fetch the active brand loyalty program for a brand
 */
export async function getBrandLoyaltyProgram(
  supabase: SupabaseClient,
  brandId: string
): Promise<BrandLoyaltyProgram | null> {
  const { data } = await (supabase
    .from('brand_loyalty_programs')
    .select('*')
    .eq('brand_id', brandId)
    .eq('is_active', true)
    .single() as any)
  return data ?? null
}

/**
 * Fetch a user's brand loyalty card (or null if none)
 */
export async function getBrandLoyaltyCard(
  supabase: SupabaseClient,
  userId: string,
  brandId: string
): Promise<BrandLoyaltyCard | null> {
  const { data } = await (supabase
    .from('brand_loyalty_cards')
    .select('*')
    .eq('user_id', userId)
    .eq('brand_id', brandId)
    .single() as any)
  return data ?? null
}

/**
 * Award a brand loyalty stamp for a session at a brand location.
 * Creates the card if it doesn't exist yet.
 * Returns the updated card and whether the reward threshold was reached.
 */
export async function awardBrandStamp(
  supabase: SupabaseClient,
  userId: string,
  brandId: string,
  breweryId: string
): Promise<{ card: BrandLoyaltyCard; isRewardReady: boolean } | null> {
  // Get active program
  const program = await getBrandLoyaltyProgram(supabase, brandId)
  if (!program) return null

  const earnAmount = program.earn_per_session

  // Try to get existing card
  let card = await getBrandLoyaltyCard(supabase, userId, brandId)

  if (!card) {
    // Create new card
    const { data: newCard, error } = await (supabase
      .from('brand_loyalty_cards')
      .insert({
        user_id: userId,
        brand_id: brandId,
        program_id: program.id,
        stamps: earnAmount,
        lifetime_stamps: earnAmount,
        last_stamp_at: new Date().toISOString(),
        last_stamp_brewery_id: breweryId,
      })
      .select()
      .single() as any)

    if (error || !newCard) return null
    card = newCard as BrandLoyaltyCard
  } else {
    // Update existing card
    const newStamps = card.stamps + earnAmount
    const newLifetime = card.lifetime_stamps + earnAmount

    const { data: updated, error } = await (supabase
      .from('brand_loyalty_cards')
      .update({
        stamps: newStamps,
        lifetime_stamps: newLifetime,
        last_stamp_at: new Date().toISOString(),
        last_stamp_brewery_id: breweryId,
      })
      .eq('id', card.id)
      .select()
      .single() as any)

    if (error || !updated) return null
    card = updated as BrandLoyaltyCard
  }

  return {
    card,
    isRewardReady: card.stamps >= program.stamps_required,
  }
}

/**
 * Redeem a brand loyalty reward. Decrements stamps and records redemption.
 */
export async function redeemBrandReward(
  supabase: SupabaseClient,
  cardId: string,
  breweryId: string
): Promise<BrandLoyaltyRedemption | null> {
  // Fetch card + program
  const { data: card } = await (supabase
    .from('brand_loyalty_cards')
    .select('*, program:brand_loyalty_programs(*)')
    .eq('id', cardId)
    .single() as any)

  if (!card) return null

  const program = card.program as BrandLoyaltyProgram
  if (!program || card.stamps < program.stamps_required) return null

  // Decrement stamps
  const newStamps = card.stamps - program.stamps_required
  const { error: updateError } = await (supabase
    .from('brand_loyalty_cards')
    .update({ stamps: newStamps })
    .eq('id', cardId) as any)

  if (updateError) return null

  // Record redemption
  const { data: redemption } = await (supabase
    .from('brand_loyalty_redemptions')
    .insert({
      card_id: cardId,
      user_id: card.user_id,
      brand_id: card.brand_id,
      brewery_id: breweryId,
      program_id: program.id,
    })
    .select()
    .single() as any)

  return redemption ?? null
}

/**
 * Migrate existing per-location loyalty stamps into a brand card.
 * Sums all location stamps for the user across brand breweries.
 * One-time operation — idempotent (creates card if missing, adds stamps).
 */
export async function migrateLoyaltyToBrand(
  supabase: SupabaseClient,
  brandId: string
): Promise<{ migratedUsers: number; totalStamps: number }> {
  // Get brand program
  const program = await getBrandLoyaltyProgram(supabase, brandId)
  if (!program) return { migratedUsers: 0, totalStamps: 0 }

  // Get all brand brewery IDs
  const { data: breweries } = await (supabase
    .from('breweries')
    .select('id')
    .eq('brand_id', brandId) as any)

  if (!breweries?.length) return { migratedUsers: 0, totalStamps: 0 }

  const breweryIds = breweries.map((b: any) => b.id)

  // Get all loyalty cards at brand locations
  const { data: locationCards } = await (supabase
    .from('loyalty_cards')
    .select('user_id, stamps, lifetime_stamps')
    .in('brewery_id', breweryIds) as any)

  if (!locationCards?.length) return { migratedUsers: 0, totalStamps: 0 }

  // Aggregate per user
  const userTotals = new Map<string, { stamps: number; lifetime: number }>()
  for (const card of locationCards) {
    const existing = userTotals.get(card.user_id) || { stamps: 0, lifetime: 0 }
    existing.stamps += card.stamps || 0
    existing.lifetime += card.lifetime_stamps || 0
    userTotals.set(card.user_id, existing)
  }

  let migratedUsers = 0
  let totalStamps = 0

  for (const [userId, totals] of userTotals) {
    // Check if brand card already exists
    const existing = await getBrandLoyaltyCard(supabase, userId, brandId)

    if (existing) {
      // Add stamps to existing card
      await (supabase
        .from('brand_loyalty_cards')
        .update({
          stamps: existing.stamps + totals.stamps,
          lifetime_stamps: existing.lifetime_stamps + totals.lifetime,
        })
        .eq('id', existing.id) as any)
    } else {
      // Create new brand card with aggregated stamps
      await (supabase
        .from('brand_loyalty_cards')
        .insert({
          user_id: userId,
          brand_id: brandId,
          program_id: program.id,
          stamps: totals.stamps,
          lifetime_stamps: totals.lifetime,
          last_stamp_at: new Date().toISOString(),
        }) as any)
    }

    migratedUsers++
    totalStamps += totals.stamps
  }

  return { migratedUsers, totalStamps }
}
