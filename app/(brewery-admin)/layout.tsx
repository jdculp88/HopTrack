import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { BreweryAdminNav } from "@/components/brewery-admin/BreweryAdminNav";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata = { title: { default: "Brewery Dashboard | HopTrack", template: "%s | HopTrack Brewery" } };

export default async function BreweryAdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Let the claim page and board render without nav or redirect loop
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? headersList.get("next-url") ?? "";
  const isClaiming = pathname.includes("/brewery-admin/claim");
  const isBoard = pathname.includes("/board");

  // Fetch all breweries this user manages (verified or pending)
  // Try with brand join; fall back to simple join if schema cache is stale
  let { data: accounts, error: accountsError } = await supabase
    .from("brewery_accounts")
    .select("*, brewery:breweries(*, brand:brewery_brands(id, name, slug, logo_url))")
    .eq("user_id", user.id) as any;

  if (accountsError) {
    // Brand join failed (schema cache stale) — retry without it
    const fallback = await supabase
      .from("brewery_accounts")
      .select("*, brewery:breweries(*)")
      .eq("user_id", user.id) as any;
    accounts = fallback.data;
  }

  if (!isClaiming && !isBoard && (!accounts || accounts.length === 0)) redirect("/brewery-admin/claim");

  // Fetch brand memberships for nav grouping
  const { data: brandAccounts } = await supabase
    .from("brand_accounts")
    .select("brand_id, role")
    .eq("user_id", user.id) as any;

  // On the claim page or board: render without the sidebar nav
  if (isClaiming || isBoard || !accounts || accounts.length === 0) {
    return (
      <ToastProvider>
        <div style={{ background: "var(--bg)" }}>
          {children}
        </div>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:rounded-xl focus:text-sm focus:font-semibold"
          style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
        >
          Skip to main content
        </a>
        <BreweryAdminNav accounts={accounts} brandAccounts={brandAccounts ?? []} />
        <main id="main-content" className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}
