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
  current_streak: number;
  longest_streak: number;
  last_session_date: string | null;
  created_at: string;
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
  verified: boolean;
  created_by: string | null;
  created_at: string;
}
export type BreweryInsert = Omit<Brewery, "id" | "created_at"> & { id?: string };
export type BreweryUpdate = Partial<Brewery>;

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
  | "nudge";

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
    city: string
    state: string
  }
  beer_logs?: BeerLog[]
  profile?: {
    id: string
    username: string
    display_name: string | null
    avatar_url: string | null
  }
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
  }
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
