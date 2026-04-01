/**
 * Tests for lib/api-response.ts — Sprint 107 (The Standard)
 */
import { describe, it, expect } from "vitest";
import {
  apiSuccess,
  apiList,
  apiError,
  apiUnauthorized,
  apiForbidden,
  apiNotFound,
  apiBadRequest,
  apiServerError,
  apiConflict,
  apiRateLimited,
} from "@/lib/api-response";

// Helper to parse NextResponse to JSON
async function parseResponse(res: Response) {
  const json = await res.json();
  return { status: res.status, body: json, headers: res.headers };
}

describe("apiSuccess", () => {
  it("returns 200 with data, empty meta, null error by default", async () => {
    const res = apiSuccess({ id: "123", name: "Test" });
    const { status, body } = await parseResponse(res);
    expect(status).toBe(200);
    expect(body.data).toEqual({ id: "123", name: "Test" });
    expect(body.meta).toEqual({});
    expect(body.error).toBeNull();
  });

  it("returns custom status code (201)", async () => {
    const res = apiSuccess({ id: "new" }, 201);
    const { status } = await parseResponse(res);
    expect(status).toBe(201);
  });

  it("includes custom meta", async () => {
    const res = apiSuccess([], 200, { page: 2, hasMore: true });
    const { body } = await parseResponse(res);
    expect(body.meta.page).toBe(2);
    expect(body.meta.hasMore).toBe(true);
  });

  it("envelope has exactly data, meta, error keys", async () => {
    const res = apiSuccess("hello");
    const { body } = await parseResponse(res);
    expect(Object.keys(body)).toEqual(["data", "meta", "error"]);
  });
});

describe("apiList", () => {
  it("returns items array with pagination meta", async () => {
    const items = [{ id: "1" }, { id: "2" }];
    const res = apiList(items, { page: 1, perPage: 20, hasMore: false });
    const { status, body } = await parseResponse(res);
    expect(status).toBe(200);
    expect(body.data).toEqual(items);
    expect(body.meta.page).toBe(1);
    expect(body.meta.hasMore).toBe(false);
  });

  it("adds Cache-Control header when cacheSeconds is set", async () => {
    const res = apiList([], { cacheSeconds: 60 });
    expect(res.headers.get("Cache-Control")).toContain("max-age=60");
  });

  it("has no Cache-Control header by default", async () => {
    const res = apiList([]);
    expect(res.headers.get("Cache-Control")).toBeNull();
  });
});

describe("apiError", () => {
  it("returns error shape with correct status", async () => {
    const res = apiError("Not found", "NOT_FOUND", 404);
    const { status, body } = await parseResponse(res);
    expect(status).toBe(404);
    expect(body.error.message).toBe("Not found");
    expect(body.error.code).toBe("NOT_FOUND");
    expect(body.error.status).toBe(404);
    expect(body.data).toBeNull();
  });

  it("defaults code to ERROR and status to 500", async () => {
    const res = apiError("Oops");
    const { status, body } = await parseResponse(res);
    expect(status).toBe(500);
    expect(body.error.code).toBe("ERROR");
  });
});

describe("apiUnauthorized", () => {
  it("returns 401", async () => {
    const { status, body } = await parseResponse(apiUnauthorized());
    expect(status).toBe(401);
    expect(body.error.code).toBe("UNAUTHORIZED");
  });
});

describe("apiForbidden", () => {
  it("returns 403", async () => {
    const { status, body } = await parseResponse(apiForbidden());
    expect(status).toBe(403);
    expect(body.error.code).toBe("FORBIDDEN");
  });
});

describe("apiNotFound", () => {
  it("returns 404", async () => {
    const { status, body } = await parseResponse(apiNotFound());
    expect(status).toBe(404);
    expect(body.error.code).toBe("NOT_FOUND");
  });

  it("includes resource name in message", async () => {
    const { body } = await parseResponse(apiNotFound("Brewery"));
    expect(body.error.message).toContain("Brewery");
  });
});

describe("apiBadRequest", () => {
  it("returns 400 with VALIDATION_ERROR code", async () => {
    const res = apiBadRequest("Name is required");
    const { status, body } = await parseResponse(res);
    expect(status).toBe(400);
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.message).toBe("Name is required");
  });

  it("includes optional field", async () => {
    const res = apiBadRequest("Too short", "username");
    const { body } = await parseResponse(res);
    expect(body.error.field).toBe("username");
  });
});

describe("apiServerError", () => {
  it("returns 500 with sanitized message", async () => {
    const res = apiServerError("DB connection failed");
    const { status, body } = await parseResponse(res);
    expect(status).toBe(500);
    // Must NOT leak internal details to client
    expect(body.error.message).not.toContain("DB connection failed");
    expect(body.error.message).toBe("Something went wrong. Please try again.");
  });
});

describe("apiConflict", () => {
  it("returns 409", async () => {
    const { status, body } = await parseResponse(apiConflict("Username already taken"));
    expect(status).toBe(409);
    expect(body.error.code).toBe("CONFLICT");
    expect(body.error.message).toBe("Username already taken");
  });
});

describe("apiRateLimited", () => {
  it("returns 429 with Retry-After header", async () => {
    const res = apiRateLimited(60);
    const { status } = await parseResponse(res);
    expect(status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("60");
    expect(res.headers.get("X-RateLimit-Remaining")).toBe("0");
  });
});
