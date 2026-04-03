import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Star, Clock } from "lucide-react";
import { formatDateShort } from "@/lib/dates";
import { PageHeader } from "@/components/ui/PageHeader";

const PAGE_SIZE = 25;

export async function generateMetadata({ params }: { params: Promise<{ brewery_id: string }> }) {
  const { brewery_id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("breweries").select("name").eq("id", brewery_id).single();
  return { title: `Sessions — ${(data as any)?.name ?? "Brewery"} — HopTrack` };
}

export default async function BrewerySessionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ brewery_id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { brewery_id } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1"));
  const from = (page - 1) * PAGE_SIZE;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: account } = await supabase
    .from("brewery_accounts")
    .select("role")
    .eq("user_id", user.id)
    .eq("brewery_id", brewery_id)
    .single() as any;
  if (!account) redirect("/brewery-admin");

  const { data: brewery } = await supabase
    .from("breweries").select("name").eq("id", brewery_id).single() as any;

  const { data: sessions, count } = await supabase
    .from("sessions")
    .select("*, profile:profiles(display_name, username, avatar_url), beer_logs(id, beer_id, rating, quantity, beer:beers(name))", { count: "exact" })
    .eq("brewery_id", brewery_id)
    .eq("is_active", false)
    .order("started_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto pt-16 lg:pt-8">
      <div className="mb-6">
        <Link
          href={`/brewery-admin/${brewery_id}`}
          className="inline-flex items-center gap-1.5 text-sm mb-4 transition-opacity hover:opacity-70"
          style={{ color: "var(--accent-gold)" }}
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>
        <PageHeader
          title="All Sessions"
          subtitle={`${(brewery as any)?.name} · ${count ?? 0} total session${count !== 1 ? "s" : ""}`}
          className="mb-0"
        />
      </div>

      <div className="space-y-3">
        {((sessions as any[]) ?? []).length === 0 ? (
          <div className="rounded-2xl p-12 text-center border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <p className="text-3xl mb-2">🍺</p>
            <p className="font-display text-lg" style={{ color: "var(--text-primary)" }}>No sessions yet</p>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              Share your HopTrack brewery page to get the first pour tracked.
            </p>
          </div>
        ) : (
          ((sessions as any[]) ?? []).map((s: any) => {
            const logs = (s.beer_logs as any[]) ?? [];
            const beerCount = logs.reduce((sum: number, l: any) => sum + (l.quantity ?? 1), 0);
            const ratings = logs.filter((l: any) => l.rating > 0);
            const avg = ratings.length > 0
              ? (ratings.reduce((a: number, l: any) => a + l.rating, 0) / ratings.length).toFixed(1)
              : null;
            const durationMs = s.ended_at
              ? new Date(s.ended_at).getTime() - new Date(s.started_at).getTime()
              : null;
            const durationLabel = durationMs
              ? (() => {
                  const m = Math.round(durationMs / 60000);
                  return m < 60 ? `${m}m` : `${Math.floor(m / 60)}h ${m % 60}m`;
                })()
              : null;

            return (
              <div key={s.id} className="flex items-center gap-3 p-4 rounded-2xl border"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}>
                  {(s.profile?.display_name ?? s.user_id?.slice(0, 1) ?? "?")[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                    {s.profile?.display_name ?? "Guest"}
                  </p>
                  <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                    {beerCount > 0
                      ? `${beerCount} beer${beerCount !== 1 ? "s" : ""}${logs[0]?.beer?.name ? ` · ${logs[0].beer.name}` : ""}${logs.length > 1 ? ` +${logs.length - 1} more` : ""}`
                      : "Brewery visit"
                    }
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 text-right">
                  {avg && (
                    <span className="flex items-center gap-0.5 text-sm font-mono" style={{ color: "var(--accent-gold)" }}>
                      <Star size={11} />
                      {avg}
                    </span>
                  )}
                  {durationLabel && (
                    <span className="flex items-center gap-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
                      <Clock size={11} />
                      {durationLabel}
                    </span>
                  )}
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {formatDateShort(s.started_at)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 pt-6 border-t" style={{ borderColor: "var(--border)" }}>
          {page > 1 ? (
            <Link
              href={`/brewery-admin/${brewery_id}/sessions?page=${page - 1}`}
              className="px-4 py-2 rounded-xl text-sm border transition-all hover:opacity-80"
              style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
            >
              ← Previous
            </Link>
          ) : <div />}
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Page {page} of {totalPages}
          </p>
          {page < totalPages ? (
            <Link
              href={`/brewery-admin/${brewery_id}/sessions?page=${page + 1}`}
              className="px-4 py-2 rounded-xl text-sm border transition-all hover:opacity-80"
              style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
            >
              Next →
            </Link>
          ) : <div />}
        </div>
      )}
    </div>
  );
}
