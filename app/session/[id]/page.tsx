import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

async function getSession(id: string) {
  const supabase = await createClient();
  const { data: session } = await (supabase as any)
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
      images: [{ url: "/icons/icon-512x512.png", width: 512, height: 512 }],
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
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#0F0E0C" }}>
      <div className="w-full max-w-md space-y-6">
        {/* Session card */}
        <div className="bg-[#1A1917] border border-[#2A2723] rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#D4A843]/10 to-transparent p-6 border-b border-[#2A2723]">
            <div className="flex items-center gap-3 mb-3">
              {session.profile?.avatar_url ? (
                <img src={session.profile.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#D4A843]/20 flex items-center justify-center text-[#D4A843] font-bold text-sm">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-semibold text-[#F5F0E8] text-sm">{displayName}</p>
                {session.profile?.level && (
                  <p className="text-xs text-[#D4A843]">Level {session.profile.level}</p>
                )}
              </div>
            </div>
            <h1 className="font-display text-xl font-bold text-[#F5F0E8]">{breweryName}</h1>
            {location && <p className="text-sm text-[#A89F8C] mt-1">{location}</p>}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 divide-x divide-[#2A2723] border-b border-[#2A2723]">
            <div className="p-4 text-center">
              <p className="font-display text-2xl font-bold text-[#D4A843]">{beerCount}</p>
              <p className="text-xs text-[#6B6456] mt-1">Beer{beerCount !== 1 ? "s" : ""}</p>
            </div>
            <div className="p-4 text-center">
              <p className="font-display text-2xl font-bold text-[#D4A843]">+{xpEarned}</p>
              <p className="text-xs text-[#6B6456] mt-1">XP</p>
            </div>
            <div className="p-4 text-center">
              <p className="font-display text-2xl font-bold text-[#D4A843]">{endedAt ? durationStr : "Live"}</p>
              <p className="text-xs text-[#6B6456] mt-1">Duration</p>
            </div>
          </div>

          {/* Beer list */}
          {beerLogs.length > 0 && (
            <div className="p-4 space-y-2">
              <p className="text-xs font-mono uppercase tracking-wider text-[#6B6456] mb-3">Beers Logged</p>
              {beerLogs.slice(0, 8).map((log: any, i: number) => (
                <div key={log.id || i} className="flex items-center justify-between py-1.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#F5F0E8] truncate">{log.beer?.name || "Unknown Beer"}</p>
                    {log.beer?.style && (
                      <p className="text-xs text-[#6B6456]">{log.beer.style}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 ml-2">
                    {log.quantity > 1 && (
                      <span className="text-xs text-[#A89F8C]">×{log.quantity}</span>
                    )}
                    {log.rating && (
                      <span className="text-xs text-[#D4A843]">{"★".repeat(log.rating)}</span>
                    )}
                  </div>
                </div>
              ))}
              {beerLogs.length > 8 && (
                <p className="text-xs text-[#6B6456] pt-1">+{beerLogs.length - 8} more</p>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="p-4 border-t border-[#2A2723] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🍺</span>
              <span className="text-xs font-mono text-[#6B6456]">HopTrack</span>
            </div>
            <p className="text-xs text-[#6B6456]">
              {startedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/home"
          className="block w-full text-center py-3.5 bg-[#D4A843] text-[#0F0E0C] font-semibold rounded-xl hover:opacity-90 transition-opacity"
        >
          Open in HopTrack
        </Link>

        <p className="text-center text-xs text-[#6B6456]">
          Track every pour. Earn XP. Discover craft beer.
        </p>
      </div>
    </div>
  );
}
