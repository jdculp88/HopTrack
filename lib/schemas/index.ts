/**
 * Zod validation utilities — Sprint 157 (The Engagement Engine)
 *
 * Type-safe request parsing at every API boundary.
 * Replaces manual if/else validation with structured schemas.
 */

import { z } from "zod";
import { apiBadRequest } from "@/lib/api-response";

// ─── Request Parsing ─────────────────────────────────────────────────────────

/**
 * Parse and validate a JSON request body against a Zod schema.
 * Returns typed data on success, or an apiBadRequest response on failure.
 *
 * @example
 * const result = await parseRequestBody(request, sessionCreateSchema);
 * if (result.error) return result.error;
 * const { brewery_id, context } = result.data;
 */
export async function parseRequestBody<T>(
  request: Request,
  schema: z.ZodType<T>
): Promise<{ data: T; error: null } | { data: null; error: ReturnType<typeof apiBadRequest> }> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { data: null, error: apiBadRequest("Invalid JSON body") };
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    const firstIssue = result.error.issues[0];
    const field = firstIssue?.path?.join(".") || undefined;
    const message = firstIssue?.message || "Validation failed";
    return { data: null, error: apiBadRequest(message, field) };
  }

  return { data: result.data, error: null };
}

/**
 * Parse and validate URL search params against a Zod schema.
 *
 * @example
 * const params = parseSearchParams(request, leaderboardQuerySchema);
 * if (params.error) return params.error;
 * const { category, scope, timeRange } = params.data;
 */
export function parseSearchParams<T>(
  request: Request,
  schema: z.ZodType<T>
): { data: T; error: null } | { data: null; error: ReturnType<typeof apiBadRequest> } {
  const { searchParams } = new URL(request.url);
  const raw = Object.fromEntries(searchParams.entries());

  const result = schema.safeParse(raw);
  if (!result.success) {
    const firstIssue = result.error.issues[0];
    const field = firstIssue?.path?.join(".") || undefined;
    const message = firstIssue?.message || "Invalid query parameters";
    return { data: null, error: apiBadRequest(message, field) };
  }

  return { data: result.data, error: null };
}
