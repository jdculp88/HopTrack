// Brewery data formatting & validation utilities (Sprint 132, extended Sprint 135)

// ─── US States ──────────────────────────────────────────────────────────────────

const STATE_NAME_TO_ABBR: Record<string, string> = {
  alabama: "AL", alaska: "AK", arizona: "AZ", arkansas: "AR",
  california: "CA", colorado: "CO", connecticut: "CT", delaware: "DE",
  florida: "FL", georgia: "GA", hawaii: "HI", idaho: "ID",
  illinois: "IL", indiana: "IN", iowa: "IA", kansas: "KS",
  kentucky: "KY", louisiana: "LA", maine: "ME", maryland: "MD",
  massachusetts: "MA", michigan: "MI", minnesota: "MN", mississippi: "MS",
  missouri: "MO", montana: "MT", nebraska: "NE", nevada: "NV",
  "new hampshire": "NH", "new jersey": "NJ", "new mexico": "NM",
  "new york": "NY", "north carolina": "NC", "north dakota": "ND",
  ohio: "OH", oklahoma: "OK", oregon: "OR", pennsylvania: "PA",
  "rhode island": "RI", "south carolina": "SC", "south dakota": "SD",
  tennessee: "TN", texas: "TX", utah: "UT", vermont: "VT",
  virginia: "VA", washington: "WA", "west virginia": "WV",
  wisconsin: "WI", wyoming: "WY", "district of columbia": "DC",
};

/** All 50 US states + DC, sorted alphabetically by label. For dropdown use. */
export const US_STATES: { value: string; label: string }[] = [
  { value: "AL", label: "Alabama" }, { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" }, { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" }, { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" }, { value: "DE", label: "Delaware" },
  { value: "DC", label: "District of Columbia" },
  { value: "FL", label: "Florida" }, { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" }, { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" }, { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" }, { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" }, { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" }, { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" }, { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" }, { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" }, { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" }, { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" }, { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" }, { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" }, { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" }, { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" }, { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" }, { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" }, { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" }, { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" }, { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" }, { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" }, { value: "WY", label: "Wyoming" },
];

// ─── City / State / Address Formatting (Sprint 135) ─────────────────────────────

/**
 * Format a city name to Title Case with special-case handling.
 * "CHARLOTTE" → "Charlotte", "mcallen" → "McAllen", "o'fallon" → "O'Fallon"
 */
export function formatCity(city: string | null): string | null {
  if (!city?.trim()) return null;
  const cleaned = city.trim().replace(/\s+/g, " ");

  return cleaned
    .split(/([\s-])/) // split on spaces/hyphens, keep delimiters
    .map((segment) => {
      if (segment === " " || segment === "-") return segment;
      if (!segment) return segment;

      // Title Case the segment
      let word = segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase();

      // Mc-prefix: "Mcallen" → "McAllen"
      if (word.length > 2 && word.startsWith("Mc")) {
        word = "Mc" + word.charAt(2).toUpperCase() + word.slice(3);
      }

      // Apostrophe: "O'fallon" → "O'Fallon"
      const apoIdx = word.indexOf("'");
      if (apoIdx >= 0 && apoIdx < word.length - 1) {
        word = word.slice(0, apoIdx + 1) + word.charAt(apoIdx + 1).toUpperCase() + word.slice(apoIdx + 2);
      }

      return word;
    })
    .join("");
}

/**
 * Convert a state name or abbreviation to 2-letter uppercase abbreviation.
 * "Texas" → "TX", "nc" → "NC", "New Hampshire" → "NH"
 */
export function formatState(state: string | null): string | null {
  if (!state?.trim()) return null;
  const trimmed = state.trim();
  if (trimmed.length === 2) return trimmed.toUpperCase();
  const abbr = STATE_NAME_TO_ABBR[trimmed.toLowerCase()];
  return abbr ?? trimmed;
}

/**
 * Normalize a street address for storage. Trims and collapses whitespace.
 */
export function normalizeAddress(street: string | null): string | null {
  if (!street?.trim()) return null;
  return street.trim().replace(/\s+/g, " ");
}

// ─── Phone / URL / Postal Code ──────────────────────────────────────────────────

/**
 * Format a raw phone string for display.
 * 10-digit US → (XXX) XXX-XXXX. Everything else passes through.
 */
export function formatPhone(raw: string | null): string {
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");
  const normalized = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  if (normalized.length === 10) {
    return `(${normalized.slice(0, 3)}) ${normalized.slice(3, 6)}-${normalized.slice(6)}`;
  }
  return raw;
}

/**
 * Normalize phone to digits-only for storage.
 * Strips non-digits, drops leading US country code "1" from 11-digit numbers.
 */
export function normalizePhone(raw: string | null): string | null {
  if (!raw?.trim()) return null;
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length === 11 && digits.startsWith("1")) return digits.slice(1);
  return digits;
}

/**
 * Normalize a website URL for storage. Ensures https:// protocol.
 */
export function normalizeWebsiteUrl(url: string | null): string | null {
  if (!url?.trim()) return null;
  const trimmed = url.trim();
  if (trimmed.startsWith("http://")) return "https://" + trimmed.slice(7);
  if (!trimmed.startsWith("https://")) return "https://" + trimmed;
  return trimmed;
}

/**
 * Normalize US postal codes to 5-digit format.
 * "73069-8224" → "73069". Non-US codes pass through.
 */
export function normalizePostalCode(code: string | null): string | null {
  if (!code?.trim()) return null;
  const trimmed = code.trim();
  if (/^\d{5}-\d{4}$/.test(trimmed)) return trimmed.slice(0, 5);
  return trimmed;
}

/** Validate 2-letter US state abbreviation */
export function isValidState(state: string): boolean {
  return /^[A-Z]{2}$/i.test(state.trim());
}

/** Validate 5-digit US postal code */
export function isValidPostalCode(zip: string): boolean {
  return /^\d{5}$/.test(zip.trim());
}

/** Validate a URL (http or https protocol) */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

const SOCIAL_DOMAINS: Record<string, string[]> = {
  instagram: ["instagram.com"],
  facebook: ["facebook.com", "fb.com"],
  twitter: ["twitter.com", "x.com"],
  untappd: ["untappd.com"],
};

/** Validate a social media URL matches its expected platform domain */
export function isValidSocialUrl(
  url: string,
  platform: "instagram" | "facebook" | "twitter" | "untappd"
): boolean {
  if (!isValidUrl(url)) return false;
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return SOCIAL_DOMAINS[platform].some((d) => hostname === d || hostname.endsWith("." + d));
  } catch {
    return false;
  }
}
