import { describe, it, expect, vi } from "vitest";
import { verifyBrandAccess } from "../brand-auth";

function mockSupabase(responses: Record<string, any>) {
  const chainBuilder = (table: string) => {
    const currentResponse = responses[table];
    const chain: any = {
      select: () => chain,
      eq: (_col: string, _val: string) => chain,
      in: (_col: string, _vals: string[]) => chain,
      limit: () => chain,
      maybeSingle: () => Promise.resolve({ data: currentResponse?.maybeSingle ?? null, error: null }),
    };
    // For array responses (non-maybeSingle), resolve as data array
    chain.then = (resolve: any) =>
      resolve({ data: currentResponse?.data ?? currentResponse ?? [], error: null });
    return chain;
  };

  return { from: (table: string) => chainBuilder(table) } as any;
}

describe("verifyBrandAccess", () => {
  it("returns role when user has a brand_accounts row", async () => {
    const supabase = mockSupabase({
      brand_accounts: { maybeSingle: { role: "owner" } },
    });

    const result = await verifyBrandAccess(supabase, "brand-1", "user-1");
    expect(result).toBe("owner");
  });

  it("returns brand_manager role correctly", async () => {
    const supabase = mockSupabase({
      brand_accounts: { maybeSingle: { role: "brand_manager" } },
    });

    const result = await verifyBrandAccess(supabase, "brand-1", "user-1");
    expect(result).toBe("brand_manager");
  });

  it("returns 'brewery_member' when no brand_accounts but manages a brewery in the brand", async () => {
    // brand_accounts returns null, brewery_accounts returns an account,
    // breweries returns a match
    const supabase = {
      from: (table: string) => {
        const chain: any = {
          select: () => chain,
          eq: () => chain,
          in: () => chain,
          limit: () => chain,
          maybeSingle: () => {
            if (table === "brand_accounts") {
              return Promise.resolve({ data: null, error: null });
            }
            return Promise.resolve({ data: null, error: null });
          },
        };
        // Override the implicit resolution for array queries
        if (table === "brewery_accounts") {
          chain.then = (resolve: any) =>
            resolve({ data: [{ brewery_id: "brew-1" }], error: null });
        } else if (table === "breweries") {
          chain.then = (resolve: any) =>
            resolve({ data: [{ id: "brew-1" }], error: null });
        }
        return chain;
      },
    } as any;

    const result = await verifyBrandAccess(supabase, "brand-1", "user-1");
    expect(result).toBe("brewery_member");
  });

  it("returns null when user has no access at all", async () => {
    const supabase = {
      from: (table: string) => {
        const chain: any = {
          select: () => chain,
          eq: () => chain,
          in: () => chain,
          limit: () => chain,
          maybeSingle: () => Promise.resolve({ data: null, error: null }),
        };
        chain.then = (resolve: any) =>
          resolve({ data: [], error: null });
        return chain;
      },
    } as any;

    const result = await verifyBrandAccess(supabase, "brand-1", "user-1");
    expect(result).toBeNull();
  });

  it("returns null when brewery_accounts exist but none belong to the brand", async () => {
    const supabase = {
      from: (table: string) => {
        const chain: any = {
          select: () => chain,
          eq: () => chain,
          in: () => chain,
          limit: () => chain,
          maybeSingle: () => Promise.resolve({ data: null, error: null }),
        };
        if (table === "brewery_accounts") {
          chain.then = (resolve: any) =>
            resolve({ data: [{ brewery_id: "brew-1" }], error: null });
        } else if (table === "breweries") {
          // No brewery in this brand
          chain.then = (resolve: any) =>
            resolve({ data: [], error: null });
        } else {
          chain.then = (resolve: any) =>
            resolve({ data: [], error: null });
        }
        return chain;
      },
    } as any;

    const result = await verifyBrandAccess(supabase, "brand-1", "user-1");
    expect(result).toBeNull();
  });
});
