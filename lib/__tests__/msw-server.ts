/**
 * MSW Node server — Sprint 105 (The Test Wall)
 * Import and start this in Vitest's global setup or per-suite beforeAll.
 *
 * Typical usage in a test file:
 *
 *   import { server } from "@/lib/__tests__/msw-server";
 *
 *   beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
 *   afterEach(() => server.resetHandlers());
 *   afterAll(() => server.close());
 *
 * You can override handlers per-suite:
 *   server.use(http.get(/\/rest\/v1\/profiles/, () => HttpResponse.json([])));
 */
import { setupServer } from "msw/node";
import { handlers } from "./msw-handlers";

export const server = setupServer(...handlers);
