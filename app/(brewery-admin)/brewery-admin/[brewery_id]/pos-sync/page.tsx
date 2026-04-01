import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PosSyncLogClient } from "./PosSyncLogClient";

export async function generateMetadata({ params }: { params: Promise<{ brewery_id: string }> }) {
  const { brewery_id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("breweries").select("name").eq("id", brewery_id).single();
  return { title: `POS Sync Log — ${(data as any)?.name ?? "Brewery"} — HopTrack` };
}

export default async function PosSyncLogPage({ params }: { params: Promise<{ brewery_id: string }> }) {
  const { brewery_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Verify access
  const { data: account } = await supabase
    .from("brewery_accounts")
    .select("role")
    .eq("user_id", user.id)
    .eq("brewery_id", brewery_id)
    .maybeSingle() as any;

  if (!account || !["owner", "manager"].includes(account.role)) {
    redirect("/brewery-admin/claim");
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto pt-16 lg:pt-8">
      {/* Back link */}
      <Link
        href={`/brewery-admin/${brewery_id}`}
        className="inline-flex items-center gap-1.5 text-xs mb-4 transition-opacity hover:opacity-70"
        style={{ color: "var(--text-muted)" }}
      >
        <ArrowLeft size={12} /> Back to Dashboard
      </Link>

      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
          POS Sync Log
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Full history of POS sync activity — webhooks, manual syncs, and scheduled runs.
        </p>
      </div>

      <PosSyncLogClient breweryId={brewery_id} />
    </div>
  );
}
