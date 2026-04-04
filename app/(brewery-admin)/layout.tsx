import { redirect } from "next/navigation";
import { headers, cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { BreweryAdminNav } from "@/components/brewery-admin/BreweryAdminNav";
import { ImpersonationBanner } from "@/components/superadmin/ImpersonationBanner";
import { ToastProvider } from "@/components/ui/Toast";
import { ReducedMotionProvider } from "@/components/ui/ReducedMotionProvider";

export const metadata = { title: { default: "Brewery Dashboard | HopTrack", template: "%s | HopTrack Brewery" } };

export default async function BreweryAdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // ── Impersonation detection ─────────────────────────────────────────
  const cookieStore = await cookies();
  const impersonateBreweryId = cookieStore.get("ht-impersonate")?.value;
  let isImpersonating = false;
  let impersonateBreweryName = "";

  if (impersonateBreweryId) {
    // Verify caller is superadmin
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_superadmin")
      .eq("id", user.id)
      .single() as any;

    if (profile?.is_superadmin) {
      isImpersonating = true;
      // Fetch brewery name for banner
      const service = createServiceClient();
      const { data: brewery } = await service
        .from("breweries")
        .select("name")
        .eq("id", impersonateBreweryId)
        .single() as any;
      impersonateBreweryName = brewery?.name ?? "Unknown Brewery";
    }
    // If not superadmin, cookie is ignored — normal flow proceeds
  }

  // Let the claim page and board render without nav or redirect loop
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? headersList.get("next-url") ?? "";
  const isClaiming = pathname.includes("/brewery-admin/claim");
  const isBoard = pathname.includes("/board");

  let accounts: any[] | null = null;
  let brandAccounts: any[] | null = null;

  if (isImpersonating) {
    // During impersonation: use service client to fetch brewery data (superadmin not in brewery_accounts)
    const service = createServiceClient();
    const { data: breweryData } = await service
      .from("breweries")
      .select("*, brand:brewery_brands(id, name, slug, logo_url)")
      .eq("id", impersonateBreweryId)
      .single() as any;

    if (breweryData) {
      // Build synthetic account so BreweryAdminNav renders correctly
      accounts = [{
        id: "impersonation",
        user_id: user.id,
        brewery_id: impersonateBreweryId,
        role: "owner",
        verified: true,
        propagated_from_brand: false,
        brewery: breweryData,
      }];
    }

    // Fetch brand accounts if brewery belongs to a brand
    if (breweryData?.brand_id) {
      const { data: brandData } = await service
        .from("brand_accounts")
        .select("brand_id, role")
        .eq("brand_id", breweryData.brand_id)
        .limit(1) as any;
      brandAccounts = brandData;
    }
  } else {
    // Normal flow: fetch breweries this user manages
    // Try with brand join; fall back to simple join if schema cache is stale
    let accountsError: any;
    ({ data: accounts, error: accountsError } = await supabase
      .from("brewery_accounts")
      .select("*, brewery:breweries(*, brand:brewery_brands(id, name, slug, logo_url))")
      .eq("user_id", user.id) as any);

    if (accountsError) {
      // Brand join failed (schema cache stale) — retry without it
      const fallback = await supabase
        .from("brewery_accounts")
        .select("*, brewery:breweries(*)")
        .eq("user_id", user.id) as any;
      accounts = fallback.data;
    }

    // Fetch brand memberships for nav grouping
    const { data: bd } = await supabase
      .from("brand_accounts")
      .select("brand_id, role")
      .eq("user_id", user.id) as any;
    brandAccounts = bd;
  }

  if (!isClaiming && !isBoard && !isImpersonating && (!accounts || accounts.length === 0)) redirect("/brewery-admin/claim");

  // On the claim page or board: render without the sidebar nav
  if (isClaiming || isBoard || !accounts || accounts.length === 0) {
    return (
      <ReducedMotionProvider>
        <ToastProvider>
          <div style={{ background: "var(--bg)" }}>
            {children}
          </div>
        </ToastProvider>
      </ReducedMotionProvider>
    );
  }

  return (
    <ReducedMotionProvider>
    <ToastProvider>
      <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>
        {isImpersonating && (
          <ImpersonationBanner breweryId={impersonateBreweryId!} breweryName={impersonateBreweryName} />
        )}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:rounded-xl focus:text-sm focus:font-semibold"
          style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
        >
          Skip to main content
        </a>
        <BreweryAdminNav accounts={accounts} brandAccounts={brandAccounts ?? []} />
        <main id="main-content" className={`flex-1 overflow-auto${isImpersonating ? " pt-10" : ""}`}>
          {children}
        </main>
      </div>
    </ToastProvider>
    </ReducedMotionProvider>
  );
}
