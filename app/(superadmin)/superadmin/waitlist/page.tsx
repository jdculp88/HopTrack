// Superadmin waitlist viewer — Sprint 174 (The Coming Soon)
//
// Reads the locked `waitlist` table via service-role client (mirrors the
// barback page pattern). Auth is handled by the (superadmin) layout, so no
// extra guard is required here.
//
// Surface:
//   - Total + audience breakdown
//   - Demand by state (sorted desc) — the demand-mapping play
//   - Full row table with name/email/city/state/audience/brewery/signup time
//   - Export CSV link → /api/superadmin/waitlist/export

import { createServiceClient } from "@/lib/supabase/service";
import { ListChecks, Download, Beer, Users as UsersIcon } from "lucide-react";
import { formatDate, formatRelativeTime } from "@/lib/dates";

export const metadata = { title: "Waitlist" };

interface WaitlistRow {
  id: string;
  name: string;
  email: string;
  city: string;
  state: string;
  audience_type: "user" | "brewery";
  brewery_name: string | null;
  created_at: string;
}

export default async function WaitlistPage() {
  const supabase = createServiceClient();

  const { data: rows } = (await supabase
    .from("waitlist")
    .select(
      "id, name, email, city, state, audience_type, brewery_name, created_at"
    )
    .order("created_at", { ascending: false })) as { data: WaitlistRow[] | null };

  const list = rows ?? [];
  const total = list.length;
  const userCount = list.filter((r) => r.audience_type === "user").length;
  const breweryCount = list.filter((r) => r.audience_type === "brewery").length;

  // Demand by state — sorted desc
  const stateMap = new Map<string, number>();
  for (const row of list) {
    stateMap.set(row.state, (stateMap.get(row.state) ?? 0) + 1);
  }
  const stateDemand = Array.from(stateMap.entries())
    .map(([state, count]) => ({
      state,
      count,
      pct: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const maxStateCount = stateDemand[0]?.count ?? 0;

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <ListChecks size={15} style={{ color: "var(--text-muted)" }} />
          <p
            className="text-xs font-mono uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            Pre-Launch Signups
          </p>
        </div>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1
            className="font-display text-2xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Waitlist
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>
              {total.toLocaleString()} total
            </span>
            <a
              href="/api/superadmin/waitlist/export"
              className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg transition-opacity hover:opacity-90"
              style={{
                background: "var(--accent-gold)",
                color: "var(--bg)",
              }}
            >
              <Download size={13} />
              Export CSV
            </a>
          </div>
        </div>
      </div>

      {/* Audience pills */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div
          className="rounded-xl border p-4"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <UsersIcon size={13} style={{ color: "var(--text-muted)" }} />
            <span
              className="text-[10px] font-mono uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              Beer drinkers
            </span>
          </div>
          <p
            className="font-display text-2xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            {userCount.toLocaleString()}
          </p>
        </div>
        <div
          className="rounded-xl border p-4"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Beer size={13} style={{ color: "var(--text-muted)" }} />
            <span
              className="text-[10px] font-mono uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              Breweries
            </span>
          </div>
          <p
            className="font-display text-2xl font-bold"
            style={{ color: "var(--accent-gold)" }}
          >
            {breweryCount.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Demand by state */}
      {stateDemand.length > 0 && (
        <div
          className="rounded-xl border p-5 mb-6"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <p
              className="text-[10px] font-mono uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              Demand by State
            </p>
            <p
              className="text-[10px] font-mono"
              style={{ color: "var(--text-muted)" }}
            >
              {stateDemand.length} state{stateDemand.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="space-y-1.5">
            {stateDemand.slice(0, 12).map(({ state, count, pct }) => (
              <div key={state} className="flex items-center gap-3">
                <span
                  className="text-xs font-mono font-bold w-8"
                  style={{ color: "var(--text-primary)" }}
                >
                  {state}
                </span>
                <div
                  className="flex-1 h-2 rounded-full overflow-hidden"
                  style={{ background: "var(--surface-2)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${maxStateCount > 0 ? (count / maxStateCount) * 100 : 0}%`,
                      background: "var(--accent-gold)",
                    }}
                  />
                </div>
                <span
                  className="text-xs font-mono w-12 text-right"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {count}
                </span>
                <span
                  className="text-[10px] font-mono w-10 text-right"
                  style={{ color: "var(--text-muted)" }}
                >
                  {pct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
        <div
          className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 text-xs font-mono uppercase tracking-wider border-b"
          style={{
            color: "var(--text-muted)",
            borderColor: "var(--border)",
            background: "var(--surface-2)",
          }}
        >
          <span>Person</span>
          <span className="hidden sm:block w-32">Location</span>
          <span className="w-20 text-center">Audience</span>
          <span className="w-24 text-right">Joined</span>
        </div>

        {list.length === 0 ? (
          <div
            className="px-5 py-10 text-center text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            No waitlist signups yet.
          </div>
        ) : (
          list.map((row, i) => (
            <div
              key={row.id}
              className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3.5 items-center"
              style={{
                borderTop: i > 0 ? "1px solid var(--border)" : undefined,
              }}
            >
              {/* Name + email */}
              <div className="min-w-0">
                <div
                  className="text-sm font-medium truncate"
                  style={{ color: "var(--text-primary)" }}
                >
                  {row.name}
                </div>
                <div
                  className="text-xs truncate"
                  style={{ color: "var(--text-muted)" }}
                >
                  {row.email}
                  {row.audience_type === "brewery" && row.brewery_name && (
                    <>
                      {" · "}
                      <span style={{ color: "var(--accent-gold)" }}>
                        {row.brewery_name}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Location */}
              <span
                className="text-xs hidden sm:block w-32 truncate"
                style={{ color: "var(--text-secondary)" }}
              >
                {row.city}, {row.state}
              </span>

              {/* Audience badge */}
              <span className="w-20 flex justify-center">
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full"
                  style={
                    row.audience_type === "brewery"
                      ? {
                          background: "rgba(212,168,67,0.12)",
                          color: "var(--accent-gold)",
                        }
                      : {
                          background: "var(--surface-2)",
                          color: "var(--text-secondary)",
                        }
                  }
                >
                  {row.audience_type === "brewery" ? "BREWERY" : "USER"}
                </span>
              </span>

              {/* Joined */}
              <span
                className="text-xs text-right w-24"
                style={{ color: "var(--text-muted)" }}
                title={formatDate(row.created_at)}
              >
                {formatRelativeTime(row.created_at)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
