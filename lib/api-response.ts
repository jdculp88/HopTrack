/**
 * Standard API response envelope — Sprint 107 (The Standard)
 *
 * Every API route should use these helpers to return consistent, typed responses.
 * Format: { data: T | null, meta: object, error: ErrorShape | null }
 *
 * This replaces ad-hoc NextResponse.json({ error: "..." }) patterns.
 */

import { NextResponse } from "next/server";

// ─── Response Types ───────────────────────────────────────────────────────────

export interface ApiMeta {
  page?: number;
  perPage?: number;
  total?: number;
  hasMore?: boolean;
  [key: string]: unknown;
}

export interface ApiErrorShape {
  message: string;
  code: string;
  status: number;
  field?: string; // For validation errors — which field failed
}

export interface ApiEnvelope<T> {
  data: T | null;
  meta: ApiMeta;
  error: ApiErrorShape | null;
}

// ─── Success Responses ────────────────────────────────────────────────────────

/**
 * Return a successful API response.
 *
 * @example
 * return apiSuccess(session, 201)
 * return apiSuccess(sessions, 200, { page: 1, hasMore: true })
 */
export function apiSuccess<T>(
  data: T,
  status: 200 | 201 | 204 = 200,
  meta: ApiMeta = {},
  headers?: Record<string, string>
): NextResponse<ApiEnvelope<T>> {
  return NextResponse.json(
    { data, meta, error: null },
    { status, headers }
  );
}

/**
 * Return a paginated list response with consistent meta shape.
 */
export function apiList<T>(
  items: T[],
  opts: {
    page?: number;
    perPage?: number;
    total?: number;
    hasMore?: boolean;
    cacheSeconds?: number;
  } = {}
): NextResponse<ApiEnvelope<T[]>> {
  const { page = 1, perPage = 20, total, hasMore = false, cacheSeconds } = opts;
  const headers: Record<string, string> = {};
  if (cacheSeconds) {
    headers["Cache-Control"] = `public, max-age=${cacheSeconds}, stale-while-revalidate=${cacheSeconds * 2}`;
  }
  return NextResponse.json(
    { data: items, meta: { page, perPage, total, hasMore }, error: null },
    { status: 200, headers }
  );
}

// ─── Error Responses ──────────────────────────────────────────────────────────

/**
 * Return a standardized error response. Never leaks internal details.
 *
 * @example
 * return apiError("Not found", "NOT_FOUND", 404)
 * return apiError("Unauthorized", "UNAUTHORIZED", 401)
 */
export function apiError(
  message: string,
  code: string = "ERROR",
  status: 400 | 401 | 403 | 404 | 409 | 422 | 429 | 500 | 503 = 500
): NextResponse<ApiEnvelope<null>> {
  return NextResponse.json(
    { data: null, meta: {}, error: { message, code, status } },
    { status }
  );
}

/** 401 Unauthorized — not authenticated */
export const apiUnauthorized = () =>
  apiError("Authentication required", "UNAUTHORIZED", 401);

/** 403 Forbidden — authenticated but not allowed */
export const apiForbidden = () =>
  apiError("You don't have permission to do that", "FORBIDDEN", 403);

/** 404 Not Found */
export const apiNotFound = (resource = "Resource") =>
  apiError(`${resource} not found`, "NOT_FOUND", 404);

/** 400 Bad Request — missing or invalid input */
export const apiBadRequest = (message: string, field?: string) =>
  NextResponse.json(
    {
      data: null,
      meta: {},
      error: { message, code: "VALIDATION_ERROR", status: 400, field },
    },
    { status: 400 }
  );

/** 500 Internal Server Error — sanitized, never leaks DB/stack details */
export const apiServerError = (context?: string) => {
  // Log context server-side (never sent to client)
  if (context && process.env.NODE_ENV !== "test") {
    process.stdout.write(
      JSON.stringify({ level: "error", message: `Server error: ${context}`, timestamp: new Date().toISOString() }) + "\n"
    );
  }
  return apiError("Something went wrong. Please try again.", "INTERNAL_ERROR", 500);
};

/** 409 Conflict — resource already exists */
export const apiConflict = (message: string) =>
  apiError(message, "CONFLICT", 409);

/** 429 Too Many Requests — with retry info */
export function apiRateLimited(retryAfterSeconds: number): NextResponse<ApiEnvelope<null>> {
  return NextResponse.json(
    { data: null, meta: {}, error: { message: "Too many requests. Please try again later.", code: "RATE_LIMITED", status: 429 } },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSeconds),
        "X-RateLimit-Remaining": "0",
      },
    }
  );
}
