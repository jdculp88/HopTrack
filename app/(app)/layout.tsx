import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/AppShell";
import { StorefrontShell } from "@/components/layout/StorefrontShell";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { InstallPromptBanner } from "@/components/ui/InstallPromptBanner";
import { ReducedMotionProvider } from "@/components/ui/ReducedMotionProvider";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Brewery pages are publicly accessible (The Storefront)
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const isBreweryRoute = pathname.startsWith("/brewery/") || pathname === "/brewery";

  if (!user && !isBreweryRoute) redirect("/login");

  // Unauthenticated brewery visitors get the StorefrontShell (no app nav)
  if (!user && isBreweryRoute) {
    return (
      <ReducedMotionProvider>
        <ErrorBoundary context="StorefrontLayout">
          <StorefrontShell>
            {children}
          </StorefrontShell>
        </ErrorBoundary>
      </ReducedMotionProvider>
    );
  }

  // Authenticated users get the full AppShell
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user!.id)
    .single();

  const username = profile?.username ?? user!.email?.split("@")[0] ?? "me";

  return (
    <ReducedMotionProvider>
      <ErrorBoundary context="AppLayout">
        <AppShell username={username}>
          {children}
          <InstallPromptBanner />
        </AppShell>
      </ErrorBoundary>
    </ReducedMotionProvider>
  );
}
