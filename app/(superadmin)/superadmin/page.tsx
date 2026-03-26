import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  Users,
  Beer,
  ClipboardCheck,
  CheckCircle,
  TrendingUp,
  UserPlus,
  ShieldAlert,
} from "lucide-react";
import { formatDateTime } from "@/lib/dates";

export const metadata = { title: "Overview" };

export default async function SuperadminOverviewPage() {
  const supabase = await createClient();

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: totalUsers },
    { count: totalBreweries },
    { count: totalCheckins },
    { count: pendingClaims },
    { count: verifiedBreweries },
    { count: newUsersThisWeek },
    { data: recentActions },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }) as any,
    supabase.from("breweries").select("id", { count: "exact", head: true }) as any,
    supabase.from("checkins").select("id", { count: "exact", head: true }) as any,
    supabase.from("brewery_claims").select("id", { count: "exact", head: true }).eq("status", "pending") as any,
    supabase.from("brewery_accounts").select("id", { count: "exact", head: true }).eq("verified", true) as any,
    supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", oneWeekAgo) as any,
    supabase
      .from("admin_actions")
      .select("*, admin:profiles(display_name, username)")
      .order("created_at", { ascending: false })
      .limit(20) as any,
  ]);

  const stats = [
    {
      label: "Total Users",
      value: (totalUsers ?? 0).toLocaleString(),
      icon: Users,
      note: `+${(newUsersThisWeek ?? 0)} this week`,
      href: "/superadmin/users",
    },
    {
      label: "Total Breweries",
      value: (totalBreweries ?? 0).toLocaleString(),
      icon: Beer,
      note: `${(verifiedBreweries ?? 0)} verified`,
      href: "/superadmin/breweries",
    },
    {
      label: "Total Check-ins",
      value: (totalCheckins ?? 0).toLocaleString(),
      icon: TrendingUp,
      note: "all time",
      href: "/superadmin/stats",
    },
    {
      label: "Pending Claims",
      value: (pendingClaims ?? 0).toLocaleString(),
      icon: ClipboardCheck,
      note: "awaiting review",
      highlight: (pendingClaims ?? 0) > 0,
      href: "/superadmin/claims",
    },
    {
      label: "Verified Breweries",
      value: (verifiedBreweries ?? 0).toLocaleString(),
      icon: CheckCircle,
      note: `of ${(totalBreweries ?? 0)} total`,
      href: "/superadmin/breweries",
    },
    {
      label: "New Users This Week",
      value: (newUsersThisWeek ?? 0).toLocaleString(),
      icon: UserPlus,
      note: "last 7 days",
      href: "/superadmin/users",
    },
  ];

  const actions = (recentActions as any[]) ?? [];

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <ShieldAlert size={16} style={{ color: "var(--danger)" }} />
          <p
            className="text-xs font-mono uppercase tracking-wider"
            style={{ color: "var(--danger)" }}
          >
            Platform Overview
          </p>
        </div>
        <h1
          className="font-display text-3xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          HopTrack Admin
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Platform-wide metrics and recent activity
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, note, highlight, href }) => (
          <Link
            key={label}
            href={href}
            className="rounded-xl p-5 border transition-all hover:opacity-80 group"
            style={{
              background: "var(--surface)",
              borderColor: highlight ? "var(--danger)" : "var(--border)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <p
                className="text-xs font-mono uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                {label}
              </p>
              <Icon
                size={15}
                style={{ color: highlight ? "var(--danger)" : "var(--text-muted)" }}
              />
            </div>
            <p
              className="font-display text-3xl font-bold tabular-nums"
              style={{ color: highlight ? "var(--danger)" : "var(--text-primary)" }}
            >
              {value}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              {note}
            </p>
          </Link>
        ))}
      </div>

      {/* Recent Admin Activity */}
      <div>
        <h2
          className="font-display text-lg font-bold mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          Recent Admin Activity
        </h2>

        {actions.length === 0 ? (
          <div
            className="rounded-xl p-10 border text-center"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <ShieldAlert
              size={32}
              className="mx-auto mb-3"
              style={{ color: "var(--text-muted)" }}
            />
            <p
              className="font-display font-semibold mb-1"
              style={{ color: "var(--text-primary)" }}
            >
              No admin actions yet
            </p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              This is the first-time setup. Admin actions like claim approvals and
              rejections will appear here.
            </p>
          </div>
        ) : (
          <div
            className="rounded-xl border overflow-hidden"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            {actions.map((action: any, i: number) => (
              <div
                key={action.id}
                className="flex items-start gap-4 px-5 py-4"
                style={{
                  borderTop: i > 0 ? `1px solid var(--border)` : undefined,
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: "var(--surface-2)" }}
                >
                  <ShieldAlert size={13} style={{ color: "var(--danger)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="text-sm font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {action.admin?.display_name ?? action.admin?.username ?? "Admin"}
                    </span>
                    <span
                      className="text-xs font-mono px-1.5 py-0.5 rounded"
                      style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}
                    >
                      {action.action_type}
                    </span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      on {action.target_type}
                    </span>
                  </div>
                  {action.notes && (
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                      {action.notes}
                    </p>
                  )}
                </div>
                <time
                  className="text-xs flex-shrink-0"
                  style={{ color: "var(--text-muted)" }}
                  dateTime={action.created_at}
                >
                  {formatDateTime(action.created_at)}
                </time>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
