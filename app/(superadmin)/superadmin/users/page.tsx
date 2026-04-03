import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Users, ShieldAlert, ChevronRight } from "lucide-react";
import { formatDate, formatRelativeTime } from "@/lib/dates";
import { SearchForm } from "@/components/superadmin/SearchForm";
import { computeSegment, getSegmentConfig } from "@/lib/crm";

export const metadata = { title: "Users" };

const PAGE_SIZE = 50;

interface SearchParams {
  q?: string;
  page?: string;
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q, page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page ?? "1", 10));
  const offset = (currentPage - 1) * PAGE_SIZE;

  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select(
      "id, username, display_name, avatar_url, home_city, total_checkins, xp, level, created_at, is_superadmin, last_session_date",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (q && q.trim().length > 0) {
    const term = q.trim();
    query = query.or(`username.ilike.%${term}%,display_name.ilike.%${term}%`) as any;
  }

  const { data: users, count } = (await query) as any;
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);
  const userList = (users as any[]) ?? [];

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Users size={15} style={{ color: "var(--text-muted)" }} />
          <p
            className="text-xs font-mono uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            Platform Users
          </p>
        </div>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1
            className="font-display text-2xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Users
          </h1>
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>
            {(count ?? 0).toLocaleString()} total
          </span>
        </div>
      </div>

      {/* Search */}
      <SearchForm placeholder="Search username or name…" defaultValue={q} />

      {/* Table */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        {/* Header row */}
        <div
          className="grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto_auto] gap-4 px-5 py-3 text-xs font-mono uppercase tracking-wider border-b"
          style={{
            color: "var(--text-muted)",
            borderColor: "var(--border)",
            background: "var(--surface-2)",
          }}
        >
          <span className="w-8" />
          <span>User</span>
          <span className="w-16 text-right">Sessions</span>
          <span className="w-16 text-center hidden sm:block">Segment</span>
          <span className="w-16 text-right">Level</span>
          <span className="w-20 text-right hidden md:block">Last Active</span>
          <span className="w-20 text-right hidden lg:block">Joined</span>
          <span className="w-6" />
        </div>

        {userList.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>
            No users found
          </div>
        ) : (
          userList.map((user: any, i: number) => {
            const segConfig = getSegmentConfig(user.total_checkins ?? 0);
            return (
              <Link
                key={user.id}
                href={`/superadmin/users/${user.id}`}
                className="grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto_auto] gap-4 px-5 py-3.5 items-center transition-colors hover:bg-[var(--surface-2)]"
                style={{
                  borderTop: i > 0 ? "1px solid var(--border)" : undefined,
                }}
              >
                {/* Avatar */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 overflow-hidden"
                  style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}
                >
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    (user.display_name ?? user.username ?? "?")[0].toUpperCase()
                  )}
                </div>

                {/* Name / username */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="text-sm font-medium truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {user.display_name ?? user.username}
                    </span>
                    {user.is_superadmin && (
                      <span
                        className="inline-flex items-center gap-1 text-xs font-mono px-1.5 py-0.5 rounded"
                        style={{
                          background: "rgba(196,75,58,0.1)",
                          color: "var(--danger)",
                        }}
                      >
                        <ShieldAlert size={10} />
                        admin
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      @{user.username}
                    </span>
                    {user.home_city && (
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        · {user.home_city}
                      </span>
                    )}
                  </div>
                </div>

                {/* Sessions */}
                <span
                  className="text-sm font-mono text-right w-16"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {(user.total_checkins ?? 0).toLocaleString()}
                </span>

                {/* Segment badge */}
                <span className="w-16 hidden sm:flex justify-center">
                  <span
                    className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full"
                    style={{ background: segConfig.bgColor, color: segConfig.color }}
                  >
                    {segConfig.emoji} {segConfig.label}
                  </span>
                </span>

                {/* Level */}
                <span
                  className="text-sm font-mono text-right w-16"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {user.level ?? 1}
                </span>

                {/* Last Active */}
                <span
                  className="text-xs text-right w-20 hidden md:block"
                  style={{ color: "var(--text-muted)" }}
                >
                  {user.last_session_date ? formatRelativeTime(user.last_session_date) : "Never"}
                </span>

                {/* Joined */}
                <span
                  className="text-xs text-right w-20 hidden lg:block"
                  style={{ color: "var(--text-muted)" }}
                >
                  {formatDate(user.created_at)}
                </span>

                {/* Arrow */}
                <ChevronRight size={14} style={{ color: "var(--text-muted)" }} />
              </Link>
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
