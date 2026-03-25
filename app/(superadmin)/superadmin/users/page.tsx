import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Users, ShieldAlert, Search, ExternalLink } from "lucide-react";

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
      "id, username, display_name, avatar_url, home_city, total_checkins, xp, level, created_at, is_superadmin",
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
      <form method="GET" className="mb-5">
        <div
          className="flex items-center gap-2 px-3 py-2.5 rounded-lg border w-full max-w-sm"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <Search size={14} style={{ color: "var(--text-muted)" }} />
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search username or name…"
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
          className="grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto] gap-4 px-5 py-3 text-xs font-mono uppercase tracking-wider border-b"
          style={{
            color: "var(--text-muted)",
            borderColor: "var(--border)",
            background: "var(--surface-2)",
          }}
        >
          <span className="w-8" />
          <span>User</span>
          <span className="w-20 text-right">Check-ins</span>
          <span className="w-16 text-right">Level</span>
          <span className="w-16 text-right hidden sm:block">XP</span>
          <span className="w-24 text-right hidden md:block">Joined</span>
          <span className="w-8" />
        </div>

        {userList.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>
            No users found
          </div>
        ) : (
          userList.map((user: any, i: number) => (
            <div
              key={user.id}
              className="grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto] gap-4 px-5 py-3.5 items-center"
              style={{
                borderTop: i > 0 ? "1px solid var(--border)" : undefined,
              }}
            >
              {/* Avatar */}
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}
              >
                {(user.display_name ?? user.username ?? "?")[0].toUpperCase()}
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

              {/* Check-ins */}
              <span
                className="text-sm font-mono text-right w-20"
                style={{ color: "var(--text-secondary)" }}
              >
                {(user.total_checkins ?? 0).toLocaleString()}
              </span>

              {/* Level */}
              <span
                className="text-sm font-mono text-right w-16"
                style={{ color: "var(--text-secondary)" }}
              >
                {user.level ?? 1}
              </span>

              {/* XP */}
              <span
                className="text-sm font-mono text-right w-16 hidden sm:block"
                style={{ color: "var(--text-muted)" }}
              >
                {(user.xp ?? 0).toLocaleString()}
              </span>

              {/* Joined */}
              <span
                className="text-xs text-right w-24 hidden md:block"
                style={{ color: "var(--text-muted)" }}
              >
                {new Date(user.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>

              {/* View profile */}
              <Link
                href={`/profile/${user.username}`}
                target="_blank"
                className="w-8 flex items-center justify-center transition-opacity hover:opacity-70"
                style={{ color: "var(--text-muted)" }}
                title="View profile"
              >
                <ExternalLink size={13} />
              </Link>
            </div>
          ))
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
