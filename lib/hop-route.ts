/**
 * lib/hop-route.ts
 * HopRoute AI prompt builder, context assembly, and output parser.
 * Sprint 39 — HopRoute Phase 1
 */

export interface HopRouteInput {
  location: { lat: number; lng: number; city: string };
  time_window: { start: string; end: string };
  stop_count: number; // 2–5
  group_size: "solo" | "couple" | "small" | "large";
  vibe: string[];
  transport: "walking" | "rideshare" | "driving";
  taste_dna?: Array<{ style: string; avg_rating: number }>;
  social_context?: Array<{ brewery_id: string; brewery_name: string; friend_name: string; visit_count: number }>;
  breweries: Array<{
    id: string;
    name: string;
    city: string | null;
    state: string | null;
    latitude: number | null;
    longitude: number | null;
    brewery_type: string | null;
    is_sponsored?: boolean;
    vibe_tags?: string[];
    top_beers?: Array<{ id: string; name: string; style: string | null }>;
  }>;
}

export interface HopRouteStop {
  brewery_id: string;
  stop_order: number;
  arrival_time: string;
  departure_time: string;
  travel_to_next_minutes: number;
  recommended_beers: Array<{ beer_id: string | null; name: string; reason: string }>;
  reasoning_text: string;
  social_context: string | null;
  is_sponsored: boolean;
}

export interface HopRouteOutput {
  title: string;
  stops: HopRouteStop[];
}

/** Build the system + user messages for Claude */
export function buildHopRoutePrompt(input: HopRouteInput): { system: string; user: string } {
  const system = `You are HopRoute, an expert craft beer crawl planner for HopTrack.
You create personalized brewery routes that feel like they were planned by a local who knows every taproom.

Rules:
- Return ONLY valid JSON matching the schema exactly — no markdown, no explanation
- Select exactly ${input.stop_count} breweries from the provided list
- Order stops geographically to minimize travel time given the transport mode
- Times must fit within the provided time window
- Each stop should be 45–90 minutes (beer + atmosphere)
- Prefer sponsored breweries slightly (max 1 per route, marked is_sponsored: true)
- reasoning_text should be 1–2 sentences, personal, referencing the user's taste or vibe
- social_context is null unless a friend has visited recently

JSON schema:
{
  "title": "string (catchy route name, 3-6 words)",
  "stops": [
    {
      "brewery_id": "uuid",
      "stop_order": 1,
      "arrival_time": "ISO 8601",
      "departure_time": "ISO 8601",
      "travel_to_next_minutes": 0,
      "recommended_beers": [{"beer_id": "uuid or null", "name": "string", "reason": "string"}],
      "reasoning_text": "string",
      "social_context": "string or null",
      "is_sponsored": false
    }
  ]
}`;

  const tasteSummary = input.taste_dna?.length
    ? `User's top styles: ${input.taste_dna.slice(0, 5).map(t => `${t.style} (${t.avg_rating.toFixed(1)}★)`).join(", ")}`
    : "No taste history yet — suggest approachable crowd-pleasers";

  const socialSummary = input.social_context?.length
    ? `Friend activity: ${input.social_context.map(s => `${s.friend_name} visited ${s.brewery_name} ${s.visit_count}× recently`).join("; ")}`
    : "No recent friend activity";

  const groupDesc = {
    solo: "solo drinker",
    couple: "couple",
    small: "small group (3–5)",
    large: "large group (6+)",
  }[input.group_size];

  const vibeDesc = input.vibe.length ? input.vibe.join(", ") : "any vibe";

  const breweryList = input.breweries.map(b => ({
    id: b.id,
    name: b.name,
    type: b.brewery_type,
    lat: b.latitude,
    lng: b.longitude,
    vibe_tags: b.vibe_tags ?? [],
    is_sponsored: b.is_sponsored ?? false,
    top_beers: b.top_beers ?? [],
  }));

  const user = `Plan a HopRoute for a ${groupDesc} in ${input.location.city}.

Time window: ${input.time_window.start} to ${input.time_window.end}
Transport: ${input.transport}
Vibe: ${vibeDesc}
Stops requested: ${input.stop_count}

${tasteSummary}
${socialSummary}

Available breweries (${breweryList.length}):
${JSON.stringify(breweryList, null, 2)}

Return exactly ${input.stop_count} stops as valid JSON.`;

  return { system, user };
}

/** Max 1 sponsored stop per route — enforced here */
export function enforceMaxOneSponsoredStop(stops: HopRouteStop[]): HopRouteStop[] {
  let sponsoredSeen = false;
  return stops.map(stop => {
    if (stop.is_sponsored) {
      if (sponsoredSeen) return { ...stop, is_sponsored: false };
      sponsoredSeen = true;
    }
    return stop;
  });
}
