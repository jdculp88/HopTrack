// Brewery data formatting & validation utilities (Sprint 132)

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
