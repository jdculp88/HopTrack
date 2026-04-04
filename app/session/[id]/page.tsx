import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

interface Props {
  params: Promise<{ id: string }>;
}

async function getSession(id: string) {
  const supabase = await createClient();
  const { data: session } = await supabase
    .from("sessions")
    .select(`
      *,
      brewery:breweries(name, city, state),
      profile:profiles(display_name, username, avatar_url, level),
      beer_logs(id, quantity, rating, beer:beers(name, style))
    `)
    .eq("id", id)
    .maybeSingle();
  return session;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const session = await getSession(id);

  if (!session) {
    return { title: "Session Not Found — HopTrack" };
  }

  const displayName = session.profile?.display_name || session.profile?.username || "Someone";
  const breweryName = session.brewery?.name || "Home";
  const beerCount = (session.beer_logs || []).reduce((sum: number, b: any) => sum + (b.quantity || 1), 0);
  const ratedLogs = (session.beer_logs || []).filter((b: any) => b.rating != null);
  const avgRating = ratedLogs.length > 0
    ? (ratedLogs.reduce((sum: number, b: any) => sum + (b.rating || 0), 0) / ratedLogs.length).toFixed(1)
    : null;

  const title = `${displayName} at ${breweryName} — HopTrack`;
  const description = `${beerCount} beer${beerCount !== 1 ? "s" : ""}${avgRating ? ` · avg ${avgRating}★` : ""} · Tracked on HopTrack`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      siteName: "HopTrack",
      images: [{ url: "/icons/icon-512.png", width: 512, height: 512 }],
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function SessionSharePage({ params }: Props) {
  const { id } = await params;
  const session = await getSession(id);

  if (!session) notFound();

  const displayName = session.profile?.display_name || session.profile?.username || "Someone";
  const breweryName = session.brewery?.name || "Home";
  const location = session.brewery
    ? [session.brewery.city, session.brewery.state].filter(Boolean).join(", ")
    : null;
  const beerLogs = session.beer_logs || [];
  const beerCount = beerLogs.reduce((sum: number, b: any) => sum + (b.quantity || 1), 0);
  const xpEarned = session.xp_earned || 0;

  // Calculate duration
  const startedAt = new Date(session.started_at);
  const endedAt = session.ended_at ? new Date(session.ended_at) : null;
  const durationMs = endedAt ? endedAt.getTime() - startedAt.getTime() : 0;
  const durationMin = Math.round(durationMs / 60000);
  const durationStr = durationMin >= 60
    ? `${Math.floor(durationMin / 60)}h ${durationMin % 60}m`
    : `${durationMin}m`;

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-md space-y-6">
        {/* Session card */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          {/* Header */}
          <div className="p-6" style={{ background: "linear-gradient(to right, color-mix(in srgb, var(--accent-gold) 10%, transparent), transparent)", borderBottom: "1px solid var(--border)" }}>
            <div className="flex items-center gap-3 mb-3">
              {session.profile?.avatar_url ? (
                <Image src={session.profile.avatar_url} alt="" width={40} height={40} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[var(--accent-gold)]/20 flex items-center justify-center text-[var(--accent-gold)] font-bold text-sm">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{displayName}</p>
                {session.profile?.level && (
                  <p className="text-xs text-[var(--accent-gold)]">Level {session.profile.level}</p>
                )}
              </div>
            </div>
            <h1 className="font-display text-xl font-bold" style={{ color: "var(--text-primary)" }}>{breweryName}</h1>
            {location && <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{location}</p>}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3" style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="p-4 text-center" style={{ borderRight: "1px solid var(--border)" }}>
              <p className="font-display text-2xl font-bold text-[var(--accent-gold)]">{beerCount}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Beer{beerCount !== 1 ? "s" : ""}</p>
            </div>
            <div className="p-4 text-center" style={{ borderRight: "1px solid var(--border)" }}>
              <p className="font-display text-2xl font-bold text-[var(--accent-gold)]">+{xpEarned}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">XP</p>
            </div>
            <div className="p-4 text-center">
              <p className="font-display text-2xl font-bold text-[var(--accent-gold)]">{endedAt ? durationStr : "Live"}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Duration</p>
            </div>
          </div>

          {/* Beer list */}
          {beerLogs.length > 0 && (
            <div className="p-4 space-y-2">
              <p className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] mb-3">Beers Logged</p>
              {beerLogs.slice(0, 8).map((log: any, i: number) => (
                <div key={log.id || i} className="flex items-center justify-between py-1.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--text-primary)] truncate">{log.beer?.name || "Unknown Beer"}</p>
                    {log.beer?.style && (
                      <p className="text-xs text-[var(--text-muted)]">{log.beer.style}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 ml-2">
                    {log.quantity > 1 && (
                      <span className="text-xs text-[var(--text-secondary)]">×{log.quantity}</span>
                    )}
                    {log.rating && (
                      <span className="text-xs text-[var(--accent-gold)]">{"★".repeat(log.rating)}</span>
                    )}
                  </div>
                </div>
              ))}
              {beerLogs.length > 8 && (
                <p className="text-xs text-[var(--text-muted)] pt-1">+{beerLogs.length - 8} more</p>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="p-4 flex items-center justify-between" style={{ borderTop: "1px solid var(--border)" }}>
            <div className="flex items-center gap-2">
              <span className="text-lg">🍺</span>
              <span className="text-xs font-mono text-[var(--text-muted)]">HopTrack</span>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              {startedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/home"
          className="block w-full text-center py-3.5 bg-[var(--accent-gold)] text-[var(--bg)] font-semibold rounded-xl hover:opacity-90 transition-opacity"
        >
          Open in HopTrack
        </Link>

        <p className="text-center text-xs text-[var(--text-muted)]">
          Track every pour. Earn XP. Discover craft beer.
        </p>
      </div>
    </div>
  );
}
