import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Beer, Search, CheckCircle, Clock } from "lucide-react";
import { formatDate } from "@/lib/dates";

export const metadata = { title: "Breweries" };

const PAGE_SIZE = 50;

interface SearchParams {
  q?: string;
  page?: string;
}

export default async function BreweriesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q, page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page ?? "1", 10));
  const offset = (currentPage - 1) * PAGE_SIZE;

  const supabase = await createClient();

  let query = supabase
    .from("breweries")
    .select(
      "id, name, city, state, brewery_type, created_at",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (q && q.trim().length > 0) {
    const term = q.trim();
    query = query.or(`name.ilike.%${term}%,city.ilike.%${term}%`) as any;
  }

  const { data: breweries, count } = (await query) as any;

  // Fetch verified status from brewery_accounts
  const breweryIds = ((breweries as any[]) ?? []).map((b: any) => b.id);
  const { data: accountsRaw } = await supabase
    .from("brewery_accounts")
    .select("brewery_id, verified, role")
    .in("brewery_id", breweryIds.length ? breweryIds : ["none"]);
  const accounts = (accountsRaw as any[]) ?? [];
  const accountMap: Record<string, { verified: boolean; role: string }> = {};
  for (const a of accounts) {
    accountMap[a.brewery_id] = { verified: a.verified, role: a.role };
  }

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);
  const breweryList = (breweries as any[]) ?? [];

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Beer size={15} style={{ color: "var(--text-muted)" }} />
          <p
            className="text-xs font-mono uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            Platform Breweries
          </p>
        </div>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1
            className="font-display text-2xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Breweries
          </h1>
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>
            {(count ?? 0).toLocaleString()} total
          </span>
        </div>
      </div>

      {/* Search */}
      <form method="GET" className="mb-5">
        <div
          className="flex items-center gap-2 px-3 py-2.5 rounded-lg border w-full max-w-sm"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <Search size={14} style={{ color: "var(--text-muted)" }} />
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search by name or city…"
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "var(--text-primary)" }}
          />
        </div>
      </form>

      {/* Table */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        {/* Header row */}
        <div
          className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-3 text-xs font-mono uppercase tracking-wider border-b"
          style={{
            color: "var(--text-muted)",
            borderColor: "var(--border)",
            background: "var(--surface-2)",
          }}
        >
          <span>Brewery</span>
          <span className="w-24 text-center hidden sm:block">Type</span>
          <span className="w-24 text-center">Status</span>
          <span className="w-24 text-right hidden md:block">Added</span>
          <span className="w-20 text-right hidden lg:block">Claims</span>
        </div>

        {breweryList.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>
            No breweries found
          </div>
        ) : (
          breweryList.map((brewery: any, i: number) => {
            const account = accountMap[brewery.id];
            return (
              <div
                key={brewery.id}
                className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-3.5 items-center"
                style={{
                  borderTop: i > 0 ? "1px solid var(--border)" : undefined,
                }}
              >
                {/* Name / location */}
                <div className="min-w-0">
                  <Link
                    href={`/brewery/${brewery.id}`}
                    className="text-sm font-medium hover:underline truncate block"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {brewery.name}
                  </Link>
                  {(brewery.city || brewery.state) && (
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {[brewery.city, brewery.state].filter(Boolean).join(", ")}
                    </span>
                  )}
                </div>

                {/* Type */}
                <span
                  className="text-xs font-mono text-center w-24 hidden sm:block capitalize"
                  style={{ color: "var(--text-muted)" }}
                >
                  {brewery.brewery_type ?? "—"}
                </span>

                {/* Claimed / verified status */}
                <div className="w-24 text-center">
                  {account ? (
                    account.verified ? (
                      <span
                        className="inline-flex items-center gap-1 text-xs font-mono px-1.5 py-0.5 rounded"
                        style={{ background: "rgba(61,122,82,0.15)", color: "var(--success)" }}
                      >
                        <CheckCircle size={10} />
                        Verified
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1 text-xs font-mono px-1.5 py-0.5 rounded"
                        style={{ background: "rgba(212,168,67,0.1)", color: "var(--accent-gold)" }}
                      >
                        <Clock size={10} />
                        Pending
                      </span>
                    )
                  ) : (
                    <span
                      className="text-xs font-mono"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Unclaimed
                    </span>
                  )}
                </div>

                {/* Added */}
                <span
                  className="text-xs text-right w-24 hidden md:block"
                  style={{ color: "var(--text-muted)" }}
                >
                  {formatDate(brewery.created_at)}
                </span>

                {/* View claims link */}
                <div className="w-20 text-right hidden lg:block">
                  <Link
                    href={`/superadmin/claims?brewery=${brewery.id}`}
                    className="text-xs hover:underline"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Claims →
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <Link
                href={`?${new URLSearchParams({ ...(q ? { q } : {}), page: String(currentPage - 1) })}`}
                className="px-3 py-1.5 rounded-lg text-sm border transition-all"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                  color: "var(--text-secondary)",
                }}
              >
                ← Prev
              </Link>
            )}
            {currentPage < totalPages && (
              <Link
                href={`?${new URLSearchParams({ ...(q ? { q } : {}), page: String(currentPage + 1) })}`}
                className="px-3 py-1.5 rounded-lg text-sm border transition-all"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                  color: "var(--text-secondary)",
                }}
              >
                Next →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
