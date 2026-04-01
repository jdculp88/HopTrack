import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SuperadminNav } from "@/components/superadmin/SuperadminNav";

export const metadata = {
  title: { default: "Superadmin | HopTrack", template: "%s | HopTrack Admin" },
};

export default async function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = (await supabase
    .from("profiles")
    .select("is_superadmin")
    .eq("id", user.id)
    .single()) as any;

  if (!profile?.is_superadmin) redirect("/home");

  const [{ count: pendingClaimsCount }, { count: pendingBarbackCount }] = await Promise.all([
    supabase
      .from("brewery_claims")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending") as any,
    supabase
      .from("crawled_beers")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending") as any,
  ]);

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:rounded-xl focus:text-sm focus:font-semibold"
        style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
      >
        Skip to main content
      </a>
      <SuperadminNav pendingClaimsCount={pendingClaimsCount ?? 0} pendingBarbackCount={pendingBarbackCount ?? 0} />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header
          className="hidden lg:flex items-center justify-between px-6 py-3 border-b flex-shrink-0"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div />
          <span
            className="text-xs font-mono font-bold px-2.5 py-1 rounded-md uppercase tracking-widest"
            style={{ background: "var(--danger)", color: "var(--text-primary)" }}
          >
            SUPERADMIN
          </span>
        </header>
        <main id="main-content" className="flex-1 overflow-auto pt-12 lg:pt-0">
          {children}
        </main>
      </div>
    </div>
  );
}
