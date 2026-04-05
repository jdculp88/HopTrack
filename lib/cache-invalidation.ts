import { revalidateTag } from "next/cache";

/**
 * Cache invalidation helpers for "use cache" tagged data.
 * Call these from mutation API routes after writes.
 * Sprint 158 — The Cache
 *
 * revalidateTag requires 2 args in Next.js 16: (tag, profile).
 * Using "default" profile which immediately marks data as stale.
 */

export function invalidateBrewery(breweryId: string) {
  revalidateTag(`brewery-${breweryId}`, "default");
}

export function invalidateBrand(brandId: string) {
  revalidateTag(`brand-${brandId}`, "default");
}

export function invalidateCommandCenter() {
  revalidateTag("command-center", "default");
}

export function invalidateDemo() {
  revalidateTag("demo", "default");
}
