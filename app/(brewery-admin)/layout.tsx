import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { BreweryAdminNav } from "@/components/brewery-admin/BreweryAdminNav";

export const metadata = { title: { default: "Brewery Dashboard | HopTrack", template: "%s | HopTrack Brewery" } };

export default async function BreweryAdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Let the claim page render without nav or redirect loop
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? headersList.get("next-url") ?? "";
  const isClaiming = pathname.includes("/brewery-admin/claim");

  // Fetch all breweries this user manages (verified or pending)
  const { data: accounts } = await supabase
    .from("brewery_accounts")
    .select("*, brewery:breweries(*)")
    .eq("user_id", user.id) as any;

  if (!isClaiming && (!accounts || accounts.length === 0)) redirect("/brewery-admin/claim");

  // On the claim page: render without the sidebar nav
  if (isClaiming || !accounts || accounts.length === 0) {
    return (
      <div className="min-h-screen" style={{ background: "var(--bg)" }}>
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>
      <BreweryAdminNav accounts={accounts} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
