export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      friendships: {
        Row: Friendship;
        Insert: FriendshipInsert;
        Update: FriendshipUpdate;
      };
      breweries: {
        Row: Brewery;
        Insert: BreweryInsert;
        Update: BreweryUpdate;
      };
      beers: {
        Row: Beer;
        Insert: BeerInsert;
        Update: BeerUpdate;
      };
      achievements: {
        Row: Achievement;
        Insert: AchievementInsert;
        Update: AchievementUpdate;
      };
      user_achievements: {
        Row: UserAchievement;
        Insert: UserAchievementInsert;
        Update: UserAchievementUpdate;
      };
      wishlist: {
        Row: WishlistItem;
        Insert: WishlistInsert;
        Update: WishlistUpdate;
      };
      brewery_visits: {
        Row: BreweryVisit;
        Insert: BreweryVisitInsert;
        Update: BreweryVisitUpdate;
      };
      notifications: {
        Row: Notification;
        Insert: NotificationInsert;
        Update: NotificationUpdate;
      };
      reactions: {
        Row: Reaction;
        Insert: ReactionInsert;
        Update: ReactionUpdate;
      };
      sessions: {
        Row: Session;
        Insert: SessionInsert;
        Update: SessionUpdate;
      };
      beer_logs: {
        Row: BeerLog;
        Insert: BeerLogInsert;
        Update: BeerLogUpdate;
      };
      session_comments: {
        Row: SessionComment;
        Insert: SessionCommentInsert;
        Update: Partial<SessionComment>;
      };
      session_participants: {
        Row: SessionParticipant;
        Insert: SessionParticipantInsert;
        Update: Partial<SessionParticipant>;
      };
      session_photos: {
        Row: SessionPhoto;
        Insert: SessionPhotoInsert;
        Update: Partial<SessionPhoto>;
      };
      beer_lists: {
        Row: BeerList;
        Insert: BeerListInsert;
        Update: BeerListUpdate;
      };
      beer_list_items: {
        Row: BeerListItem;
        Insert: BeerListItemInsert;
        Update: Partial<BeerListItem>;
      };
      brewery_follows: {
        Row: BreweryFollow;
        Insert: BreweryFollowInsert;
        Update: Partial<BreweryFollow>;
      };
      referral_codes: {
        Row: ReferralCode;
        Insert: Omit<ReferralCode, "id" | "created_at"> & { id?: string };
        Update: Partial<ReferralCode>;
      };
      referral_uses: {
        Row: ReferralUse;
        Insert: Omit<ReferralUse, "id" | "created_at"> & { id?: string };
        Update: Partial<ReferralUse>;
      };
      beer_reviews: {
        Row: BeerReview;
        Insert: BeerReviewInsert;
        Update: BeerReviewUpdate;
      };
      brewery_reviews: {
        Row: BreweryReview;
        Insert: BreweryReviewInsert;
        Update: BreweryReviewUpdate;
      };
      push_subscriptions: {
        Row: PushSubscription;
        Insert: PushSubscriptionInsert;
        Update: Partial<PushSubscription>;
      };
      brewery_accounts: {
        Row: BreweryAccount;
        Insert: Omit<BreweryAccount, "id" | "created_at"> & { id?: string };
        Update: Partial<BreweryAccount>;
      };
      brewery_claims: {
        Row: BreweryClaim;
        Insert: Omit<BreweryClaim, "id" | "created_at"> & { id?: string };
        Update: Partial<BreweryClaim>;
      };
      brewery_events: {
        Row: BreweryEvent;
        Insert: Omit<BreweryEvent, "id" | "created_at"> & { id?: string };
        Update: Partial<BreweryEvent>;
      };
      pour_sizes: {
        Row: PourSize;
        Insert: Omit<PourSize, "id"> & { id?: string };
        Update: Partial<PourSize>;
      };
      hop_routes: {
        Row: HopRoute;
        Insert: Omit<HopRoute, "id" | "created_at"> & { id?: string };
        Update: Partial<HopRoute>;
      };
      hop_route_stops: {
        Row: HopRouteStop;
        Insert: Omit<HopRouteStop, "id"> & { id?: string };
        Update: Partial<HopRouteStop>;
      };
      hop_route_stop_beers: {
        Row: HopRouteStopBeer;
        Insert: Omit<HopRouteStopBeer, "id"> & { id?: string };
        Update: Partial<HopRouteStopBeer>;
      };
      loyalty_programs: {
        Row: LoyaltyProgram;
        Insert: Omit<LoyaltyProgram, "id" | "created_at"> & { id?: string };
        Update: Partial<LoyaltyProgram>;
      };
      loyalty_redemptions: {
        Row: LoyaltyRedemption;
        Insert: Omit<LoyaltyRedemption, "id" | "created_at"> & { id?: string };
        Update: Partial<LoyaltyRedemption>;
      };
      api_keys: {
        Row: ApiKey;
        Insert: Omit<ApiKey, "id" | "created_at"> & { id?: string };
        Update: Partial<ApiKey>;
      };
      pos_connections: {
        Row: PosConnection;
        Insert: Omit<PosConnection, "id" | "created_at" | "updated_at" | "connected_at"> & { id?: string };
        Update: Partial<PosConnection>;
      };
      pos_item_mappings: {
        Row: PosItemMapping;
        Insert: Omit<PosItemMapping, "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<PosItemMapping>;
      };
      pos_sync_logs: {
        Row: PosSyncLog;
        Insert: Omit<PosSyncLog, "id" | "created_at"> & { id?: string };
        Update: Partial<PosSyncLog>;
      };
      challenges: {
        Row: Challenge;
        Insert: Omit<Challenge, "id" | "created_at"> & { id?: string };
        Update: Partial<Challenge>;
      };
      challenge_participants: {
        Row: ChallengeParticipant;
        Insert: Omit<ChallengeParticipant, "id" | "joined_at"> & { id?: string };
        Update: Partial<ChallengeParticipant>;
      };
      brewery_ads: {
        Row: BreweryAd;
        Insert: Omit<BreweryAd, "id" | "created_at" | "updated_at" | "impressions" | "clicks" | "spent_cents"> & { id?: string };
        Update: Partial<BreweryAd>;
      };
      mug_clubs: {
        Row: MugClub;
        Insert: Omit<MugClub, "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<MugClub>;
      };
      mug_club_members: {
        Row: MugClubMember;
        Insert: Omit<MugClubMember, "id" | "joined_at"> & { id?: string };
        Update: Partial<MugClubMember>;
      };
      redemption_codes: {
        Row: RedemptionCode;
        Insert: Omit<RedemptionCode, "id" | "created_at" | "expires_at" | "confirmed_at" | "confirmed_by" | "status"> & { id?: string; status?: string };
        Update: Partial<RedemptionCode>;
      };
      event_rsvps: {
        Row: EventRsvp;
        Insert: Omit<EventRsvp, "id" | "created_at"> & { id?: string };
        Update: Partial<EventRsvp>;
      };
      brewery_brands: {
        Row: BreweryBrand;
        Insert: Omit<BreweryBrand, "id" | "created_at"> & { id?: string };
        Update: Partial<BreweryBrand>;
      };
      brand_accounts: {
        Row: BrandAccount;
        Insert: Omit<BrandAccount, "id" | "created_at"> & { id?: string };
        Update: Partial<BrandAccount>;
      };
    };
  };
}

// ─── Profiles ────────────────────────────────────────────────────────────────
export interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  home_city: string | null;
  total_checkins: number;
  unique_beers: number;
  unique_breweries: number;
  level: number;
  xp: number;
  is_public: boolean;
  is_superadmin?: boolean;
  current_streak: number;
  longest_streak: number;
  last_session_date: string | null;
  created_at: string;
  banner_url?: string | null;
  referred_by?: string | null;
  email?: string | null;
  // Preference fields stored as JSONB on the profiles row
  notification_preferences?: Record<string, boolean> | null;
  share_live?: boolean | null;
  streak_grace_used_at?: string | null;
}
export type ProfileInsert = Partial<Profile> & { id: string; username: string; display_name: string };
export type ProfileUpdate = Partial<Profile>;

// ─── Friendships ─────────────────────────────────────────────────────────────
export type FriendshipStatus = "pending" | "accepted" | "blocked";
export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
  created_at: string;
}
export type FriendshipInsert = Omit<Friendship, "id" | "created_at"> & { id?: string };
export type FriendshipUpdate = Partial<Friendship>;

// ─── Breweries ────────────────────────────────────────────────────────────────
export type BreweryType =
  | "micro"
  | "nano"
  | "regional"
  | "brewpub"
  | "large"
  | "planning"
  | "bar"
  | "contract"
  | "proprietor"
  | "taproom"
  | "closed";

export interface Brewery {
  id: string;
  external_id: string | null;
  name: string;
  brewery_type: BreweryType | null;
  street: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  phone: string | null;
  website_url: string | null;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  cover_image_url: string | null;
  menu_image_url: string | null;
  verified: boolean;
  created_by: string | null;
  created_at: string;
  logo_url: string | null;
  subscription_tier?: "free" | "tap" | "cask" | "barrel";
  hop_route_eligible?: boolean;
  stripe_customer_id?: string | null;
  trial_ends_at?: string | null;
  // Barback crawl (Sprint 79)
  data_source?: string | null;
  last_crawled_at?: string | null;
  crawl_beer_count?: number;
  // POS integration (Sprint 86)
  pos_provider: PosProvider | null;
  pos_connected: boolean;
  pos_last_sync_at: string | null;
  // Multi-location (Sprint 114)
  brand_id: string | null;
}
export type BreweryInsert = Omit<Brewery, "id" | "created_at"> & { id?: string };
export type BreweryUpdate = Partial<Brewery>;

// ─── Menu Item Types ─────────────────────────────────────────────────────────
export type ItemType = "beer" | "cider" | "wine" | "cocktail" | "na_beverage" | "food";

export const ITEM_TYPE_LABELS: Record<ItemType, string> = {
  beer: "Beer",
  cider: "Cider",
  wine: "Wine",
  cocktail: "Cocktail",
  na_beverage: "Non-Alcoholic",
  food: "Food & Snacks",
};

export const ITEM_TYPE_EMOJI: Record<ItemType, string> = {
  beer: "🍺",
  cider: "🍏",
  wine: "🍷",
  cocktail: "🍹",
  na_beverage: "🥤",
  food: "🍽️",
};

// ─── Beers ────────────────────────────────────────────────────────────────────
export type BeerStyle =
  | "IPA"
  | "Double IPA"
  | "Hazy IPA"
  | "Session IPA"
  | "Stout"
  | "Imperial Stout"
  | "Porter"
  | "Lager"
  | "Pilsner"
  | "Sour"
  | "Gose"
  | "Berliner Weisse"
  | "Wheat"
  | "Hefeweizen"
  | "Belgian"
  | "Saison"
  | "Amber"
  | "Red Ale"
  | "Pale Ale"
  | "Blonde Ale"
  | "Cream Ale"
  | "Barleywine"
  | "Kolsch"
  | "Cider"
  | "Mead"
  | "Other";

export interface Beer {
  id: string;
  brewery_id: string;
  name: string;
  style: BeerStyle | null;
  abv: number | null;
  ibu: number | null;
  description: string | null;
  seasonal: boolean;
  is_active: boolean;
  is_featured: boolean;
  cover_image_url: string | null;
  avg_rating: number | null;
  total_ratings: number;
  created_by: string | null;
  created_at: string;
  item_type: ItemType;
  category: string | null;
  // POS integration (Sprint 86)
  pos_item_id: string | null;
  pos_price_cents: number | null;
  pos_last_seen_at: string | null;
  is_on_tap?: boolean;
  // Barcode scanning (Sprint 89)
  barcode: string | null;
}
export type BeerInsert = Omit<Beer, "id" | "created_at"> & { id?: string };
export type BeerUpdate = Partial<Beer>;

// ─── Serving & Flavor Types ───────────────────────────────────────────────────
export type ServingStyle = "draft" | "bottle" | "can" | "cask";
export type FlavorTag =
  | "Hoppy"
  | "Citrusy"
  | "Malty"
  | "Smooth"
  | "Bitter"
  | "Roasty"
  | "Fruity"
  | "Sour"
  | "Sweet"
  | "Dry"
  | "Spicy"
  | "Earthy"
  | "Piney"
  | "Tropical"
  | "Coffee"
  | "Chocolate"
  | "Caramel"
  | "Floral"
  | "Grassy"
  | "Crisp";

// ─── Achievements ─────────────────────────────────────────────────────────────
export type AchievementTier = "bronze" | "silver" | "gold" | "platinum";
export type AchievementCategory =
  | "explorer"
  | "variety"
  | "quantity"
  | "social"
  | "time"
  | "quality";

export interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  xp_reward: number;
  badge_color: string;
  tier: AchievementTier;
  category: AchievementCategory;
}
export type AchievementInsert = Omit<Achievement, "id"> & { id?: string };
export type AchievementUpdate = Partial<Achievement>;

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
}
export type UserAchievementInsert = Omit<UserAchievement, "id" | "earned_at"> & {
  id?: string;
};
export type UserAchievementUpdate = Partial<UserAchievement>;

// ─── Wishlist ─────────────────────────────────────────────────────────────────
export interface WishlistItem {
  id: string;
  user_id: string;
  beer_id: string;
  note: string | null;
  created_at: string;
}
export type WishlistInsert = Omit<WishlistItem, "id" | "created_at"> & { id?: string };
export type WishlistUpdate = Partial<WishlistItem>;

// ─── Brewery Visits ───────────────────────────────────────────────────────────
export interface BreweryVisit {
  id: string;
  user_id: string;
  brewery_id: string;
  total_visits: number;
  unique_beers_tried: number;
  first_visit_at: string;
  last_visit_at: string;
}
export type BreweryVisitInsert = Omit<BreweryVisit, "id"> & { id?: string };
export type BreweryVisitUpdate = Partial<BreweryVisit>;

// ─── Notifications ────────────────────────────────────────────────────────────
export type NotificationType =
  | "friend_request"
  | "friend_checkin"
  | "tagged_checkin"
  | "achievement_unlocked"
  | "reaction"
  | "session_cheers"
  | "session_comment"
  | "weekly_stats"
  | "nudge"
  | "brewery_follow"
  | "new_tap"
  | "new_event"
  | "first_referral"
  | "group_invite";

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Json | null;
  read: boolean;
  created_at: string;
}
export type NotificationInsert = Omit<Notification, "id" | "created_at"> & { id?: string };
export type NotificationUpdate = Partial<Notification>;

// ─── Reactions ────────────────────────────────────────────────────────────────
export type ReactionType = "thumbs_up" | "flame" | "beer";
export interface Reaction {
  id: string;
  user_id: string;
  session_id: string;
  beer_log_id: string | null;
  type: ReactionType;
  created_at: string;
}
export type ReactionInsert = Omit<Reaction, "id" | "created_at"> & { id?: string };
export type ReactionUpdate = Partial<Reaction>;

// ─── Session Comments ────────────────────────────────────────────────────────
export interface SessionComment {
  id: string;
  session_id: string;
  user_id: string;
  body: string;
  created_at: string;
  // joined fields
  profile?: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}
export type SessionCommentInsert = Omit<SessionComment, "id" | "created_at" | "profile"> & { id?: string };

// ─── Sessions ─────────────────────────────────────────────────────────────────
export interface Session {
  id: string
  user_id: string
  brewery_id: string | null
  context: 'brewery' | 'home'
  started_at: string
  ended_at: string | null
  is_active: boolean
  share_to_feed: boolean
  note: string | null
  xp_awarded: number
  created_at: string
  // joined fields
  brewery?: {
    id: string
    name: string
    city: string | null
    state: string | null
  }
  beer_logs?: BeerLog[]
  profile?: {
    id: string
    username: string
    display_name: string | null
    avatar_url: string | null
    current_streak?: number
    level?: number
  }
  session_photos?: {
    id: string
    url: string
    created_at: string
  }[]
}

export interface BeerLog {
  id: string
  session_id: string
  user_id: string
  beer_id: string | null
  brewery_id: string | null
  quantity: number
  rating: number | null
  flavor_tags: string[] | null
  serving_style: string | null
  comment: string | null
  photo_url: string | null
  logged_at: string
  // joined fields
  beer?: {
    id: string
    name: string
    style: string | null
    abv: number | null
    avg_rating: number | null
    glass_type?: string | null
  }
}

// ─── Enriched / Joined Types ──────────────────────────────────────────────────
export type SessionInsert = Omit<Session, "id" | "created_at" | "started_at" | "brewery" | "beer_logs" | "profile" | "session_photos"> & { id?: string };
export type SessionUpdate = Partial<Omit<Session, "brewery" | "beer_logs" | "profile" | "session_photos">>;

export type BeerLogInsert = Omit<BeerLog, "id" | "logged_at" | "beer"> & { id?: string };
export type BeerLogUpdate = Partial<Omit<BeerLog, "beer">>;

// ─── Beer Reviews ───────────────────────────────────────────────────────────
export interface BeerReview {
  id: string;
  user_id: string;
  beer_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  // joined fields
  profile?: { id: string; username: string; display_name: string | null; avatar_url: string | null };
}
export type BeerReviewInsert = Omit<BeerReview, "id" | "created_at" | "updated_at" | "profile"> & { id?: string };
export type BeerReviewUpdate = Partial<BeerReviewInsert>;

// ─── Brewery Reviews ────────────────────────────────────────────────────────
export interface BreweryReview {
  id: string;
  user_id: string;
  brewery_id: string;
  rating: number;
  comment: string | null;
  owner_response: string | null;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
  // joined fields
  profile?: { id: string; username: string; display_name: string | null; avatar_url: string | null };
}
export type BreweryReviewInsert = Omit<BreweryReview, "id" | "created_at" | "updated_at" | "profile" | "owner_response" | "responded_at"> & { id?: string };
export type BreweryReviewUpdate = Partial<BreweryReviewInsert>;

// ─── Push Subscriptions ─────────────────────────────────────────────────────
export interface PushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  keys: Json;
  created_at: string;
}
export type PushSubscriptionInsert = Omit<PushSubscription, "id" | "created_at"> & { id?: string };

// ─── Brewery Accounts ───────────────────────────────────────────────────────
export interface BreweryAccount {
  id: string;
  user_id: string;
  brewery_id: string;
  role: "owner" | "business" | "marketing" | "staff";
  stripe_customer_id: string | null;
  subscription_tier: "free" | "tap" | "cask" | "barrel";
  subscription_status: "active" | "trialing" | "past_due" | "canceled" | null;
  trial_ends_at: string | null;
  propagated_from_brand: boolean;
  created_at: string;
}

// ─── Brewery Claims ─────────────────────────────────────────────────────────
export interface BreweryClaim {
  id: string;
  user_id: string;
  brewery_id: string;
  status: "pending" | "approved" | "rejected";
  proof_url: string | null;
  notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

// ─── Enriched / Joined Types ──────────────────────────────────────────────────
export interface BeerWithBrewery extends Beer {
  brewery: Brewery;
  on_wishlist?: boolean;
}

export interface BreweryWithStats extends Brewery {
  visit_count?: number;
  user_visit?: BreweryVisit;
  friend_visits?: number;
  beer_count?: number;
  has_upcoming_events?: boolean;
}

export interface ProfileWithAchievements extends Profile {
  achievements: (UserAchievement & { achievement: Achievement })[];
}

export interface LeaderboardEntry {
  rank: number;
  profile: Profile;
  value: number;
  change?: number; // position change
}

// ─── Brewery Follows ─────────────────────────────────────────────────────────
export interface BreweryFollow {
  id: string;
  user_id: string;
  brewery_id: string;
  created_at: string;
}
export type BreweryFollowInsert = Omit<BreweryFollow, "id" | "created_at"> & { id?: string };

// ─── Beer Lists ──────────────────────────────────────────────────────────────
export interface BeerList {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  // joined fields
  items?: BeerListItem[];
  profile?: { username: string; display_name: string | null; avatar_url: string | null };
}
export type BeerListInsert = Omit<BeerList, "id" | "created_at" | "updated_at" | "items" | "profile"> & { id?: string };
export type BeerListUpdate = Partial<BeerListInsert>;

export interface BeerListItem {
  id: string;
  list_id: string;
  beer_id: string;
  note: string | null;
  position: number;
  created_at: string;
  // joined fields
  beer?: { id: string; name: string; style: string | null; abv: number | null; avg_rating: number | null };
}
export type BeerListItemInsert = Omit<BeerListItem, "id" | "created_at" | "beer"> & { id?: string };

// ─── Referrals ────────────────────────────────────────────────────────────────
export interface ReferralCode {
  id: string;
  user_id: string;
  code: string;
  use_count: number;
  created_at: string;
}

export interface ReferralUse {
  id: string;
  referrer_id: string;
  referred_id: string;
  created_at: string;
}

// ─── Session Participants ─────────────────────────────────────────────────────
export type ParticipantStatus = "pending" | "accepted" | "declined";

export interface SessionParticipant {
  id: string;
  session_id: string;
  user_id: string;
  invited_by: string;
  status: ParticipantStatus;
  created_at: string;
  updated_at?: string;
  // joined
  profile?: { id: string; username: string; display_name: string | null; avatar_url: string | null };
}
export type SessionParticipantInsert = Omit<SessionParticipant, "id" | "created_at" | "profile"> & { id?: string };

// ─── Session Photos ──────────────────────────────────────────────────────────
export interface SessionPhoto {
  id: string;
  session_id: string;
  user_id: string;
  photo_url: string;
  created_at: string;
}
export type SessionPhotoInsert = Omit<SessionPhoto, "id" | "created_at"> & { id?: string };

// ─── Brewery Events ─────────────────────────────────────────────────────────
export interface BreweryEvent {
  id: string;
  brewery_id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  event_type: string | null;
  is_active: boolean;
  created_at: string;
}

// ─── Pour Sizes ─────────────────────────────────────────────────────────────
export interface PourSize {
  id: string;
  beer_id: string;
  brewery_id: string;
  size_name: string;
  size_oz: number;
  price: number;
}

// ─── HopRoute ───────────────────────────────────────────────────────────────
export type HopRouteStatus = "draft" | "active" | "completed" | "cancelled";

export interface HopRoute {
  id: string;
  user_id: string;
  name: string;
  city: string;
  state: string | null;
  vibe_tags: string[] | null;
  status: HopRouteStatus;
  total_stops: number;
  completed_stops: number;
  created_at: string;
}

export interface HopRouteStop {
  id: string;
  route_id: string;
  brewery_id: string;
  stop_order: number;
  reason: string | null;
  is_completed: boolean;
  // joined fields
  brewery?: BrewerySummaryJoin;
  hop_route_stop_beers?: HopRouteStopBeer[];
}

interface BrewerySummaryJoin {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface HopRouteStopBeer {
  id: string;
  stop_id: string;
  beer_id: string;
  recommendation_reason: string | null;
  // joined fields
  beer?: { id: string; name: string; style: string | null; abv: number | null };
}

// ─── Loyalty ────────────────────────────────────────────────────────────────
export interface LoyaltyProgram {
  id: string;
  brewery_id: string;
  name: string;
  description: string | null;
  reward_type: string;
  visits_required: number;
  reward_description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface LoyaltyRedemption {
  id: string;
  program_id: string;
  user_id: string;
  redeemed_at: string;
  created_at: string;
}

// ─── API Keys ──────────────────────────────────────────────────────────────
export interface ApiKey {
  id: string;
  brewery_id: string;
  created_by: string;
  name: string;
  key_hash: string;
  key_prefix: string;
  last_used_at: string | null;
  revoked_at: string | null;
  rate_limit: number;
  created_at: string;
}

// ─── POS Integration ──────────────────────────────────────────────────────────
export type PosProvider = "toast" | "square";
export type PosConnectionStatus = "active" | "error" | "disconnected";
export type PosSyncStatus = "success" | "partial" | "failed";
export type PosSyncType = "webhook" | "manual" | "scheduled";
export type PosMappingType = "auto" | "manual" | "unmapped";

export interface PosConnection {
  id: string;
  brewery_id: string;
  provider: PosProvider;
  access_token_encrypted: string | null;
  refresh_token_encrypted: string | null;
  token_expires_at: string | null;
  provider_location_id: string | null;
  provider_merchant_id: string | null;
  status: PosConnectionStatus;
  last_sync_at: string | null;
  last_sync_status: PosSyncStatus | null;
  last_sync_item_count: number;
  webhook_subscription_id: string | null;
  connected_at: string;
  created_at: string;
  updated_at: string;
}

export interface PosItemMapping {
  id: string;
  pos_connection_id: string;
  brewery_id: string;
  pos_item_id: string;
  pos_item_name: string;
  beer_id: string | null;
  mapping_type: PosMappingType;
  created_at: string;
  updated_at: string;
  // joined fields
  beer?: { id: string; name: string; style: string | null; abv: number | null };
}

export interface PosSyncLog {
  id: string;
  pos_connection_id: string;
  brewery_id: string;
  sync_type: PosSyncType;
  provider: PosProvider;
  items_added: number;
  items_updated: number;
  items_removed: number;
  items_unmapped: number;
  status: PosSyncStatus;
  error: string | null;
  duration_ms: number | null;
  created_at: string;
}

// ─── Challenges ──────────────────────────────────────────────────────────────
export type ChallengeType = "beer_count" | "specific_beers" | "visit_streak" | "style_variety";

export interface Challenge {
  id: string;
  brewery_id: string;
  name: string;
  description: string | null;
  icon: string;
  challenge_type: ChallengeType;
  target_value: number;
  target_beer_ids: string[];
  reward_description: string | null;
  reward_xp: number;
  reward_loyalty_stamps: number;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  max_participants: number | null;
  created_at: string;
  // Sponsored challenge fields (Sprint 91)
  is_sponsored: boolean;
  cover_image_url: string | null;
  geo_radius_km: number | null;
  impressions: number;
  joins_from_discovery: number;
}

export interface ChallengeParticipant {
  id: string;
  challenge_id: string;
  user_id: string;
  current_progress: number;
  completed_at: string | null;
  joined_at: string;
}

export interface BreweryAd {
  id: string;
  brewery_id: string;
  title: string;
  body: string | null;
  image_url: string | null;
  cta_url: string | null;
  cta_label: string;
  radius_km: number;
  budget_cents: number;
  spent_cents: number;
  impressions: number;
  clicks: number;
  starts_at: string;
  ends_at: string | null;
  is_active: boolean;
  tier_required: "cask" | "barrel";
  created_at: string;
  updated_at: string;
}

// ─── Mug Clubs ──────────────────────────────────────────────────────────────
export type MugClubMemberStatus = "active" | "expired" | "cancelled";

export interface MugClub {
  id: string;
  brewery_id: string;
  name: string;
  description: string | null;
  annual_fee: number;
  max_members: number | null;
  perks: Json;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MugClubMember {
  id: string;
  mug_club_id: string;
  user_id: string;
  status: MugClubMemberStatus;
  joined_at: string;
  expires_at: string | null;
  notes: string | null;
  // joined fields
  profile?: { id: string; username: string; display_name: string | null; avatar_url: string | null };
  mug_club?: MugClub;
}

export type EventRsvpStatus = "going" | "interested";

export interface EventRsvp {
  id: string;
  event_id: string;
  user_id: string;
  status: EventRsvpStatus;
  created_at: string;
}

export interface RedemptionCode {
  id: string;
  code: string;
  type: 'loyalty_reward' | 'mug_club_perk' | 'promotion';
  user_id: string;
  brewery_id: string;
  program_id: string | null;
  mug_club_id: string | null;
  perk_index: number | null;
  promotion_id: string | null;
  promo_description: string | null;
  pos_reference: string | null;
  status: 'pending' | 'confirmed' | 'expired' | 'cancelled';
  created_at: string;
  expires_at: string;
  confirmed_at: string | null;
  confirmed_by: string | null;
}

// ─── Brewery Brands (Multi-Location) ────────────────────────────────────────
export interface BreweryBrand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  website_url: string | null;
  created_at: string;
  owner_id: string | null;
}

export type BrandAccountRole = "owner" | "regional_manager";

export interface BrandAccount {
  id: string;
  brand_id: string;
  user_id: string;
  role: BrandAccountRole;
  created_at: string;
}
