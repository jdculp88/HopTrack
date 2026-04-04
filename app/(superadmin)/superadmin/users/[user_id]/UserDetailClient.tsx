"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ExternalLink, Copy, Check, User, Star, Flame, Zap,
  Beer, Trophy, Heart, MessageSquare, MapPin, Clock, Calendar,
  Shield, ShieldAlert, Eye, EyeOff, Bell, BellOff, Tag, X, Plus,
  ChevronRight, BarChart3, TrendingUp,
} from "lucide-react";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatsGrid } from "@/components/ui/StatsGrid";
import { Sparkline } from "@/components/ui/Sparkline";
import { SessionHeatmap } from "@/components/superadmin/SessionHeatmap";
import { ActivityTimeline } from "@/components/superadmin/ActivityTimeline";
import { formatDate, formatRelativeTime } from "@/lib/dates";
import { formatDuration } from "@/lib/kpi";
import { spring, stagger, variants } from "@/lib/animation";
import { getFirstName } from "@/lib/first-name";
import type { UserDetailData, BreweryAffinity } from "@/lib/superadmin-user";

// ── Tab config ─────────────────────────────────────────────────────────

type TabId = "overview" | "activity" | "sessions" | "social" | "breweries" | "admin";

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "activity", label: "Activity" },
  { id: "sessions", label: "Sessions" },
  { id: "social", label: "Social" },
  { id: "breweries", label: "Breweries" },
  { id: "admin", label: "Admin" },
];

// ── Churn risk colors ──────────────────────────────────────────────────

const CHURN_COLORS: Record<string, string> = {
  green: "#4A7C59",
  amber: "#E8841A",
  red: "#C44B3A",
};

// ── Copy button helper ─────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="inline-flex items-center p-1 rounded transition-colors"
      style={{ color: "var(--text-muted)" }}
      title="Copy"
    >
      {copied ? <Check size={12} style={{ color: "#4A7C59" }} /> : <Copy size={12} />}
    </button>
  );
}

// ── Sort helper for session table ──────────────────────────────────────

type SortKey = "date" | "brewery" | "duration" | "beers" | "rating";
type SortDir = "asc" | "desc";

// ── Component ──────────────────────────────────────────────────────────

export function UserDetailClient({ data }: { data: UserDetailData }) {
  const {
    profile, segment, segmentConfig, engagementScore, engagementLevel,
    churnRisk, lifecycle, kpis, engagementSparkline, topStyles,
    recentActivity, sessions, sessionHeatmap, breweryAffinities,
    adminNotes, adminTags: initialTags,
    totalSessions, totalFriends, totalReactions, totalComments,
    totalAchievements, totalPossibleAchievements,
  } = data;

  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [notesText, setNotesText] = useState(adminNotes[0]?.content ?? "");
  const [notesSaving, setNotesSaving] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const notesTimer = useRef<NodeJS.Timeout | null>(null);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [newTag, setNewTag] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // ── Notes auto-save ─────────────────────────────────────────────────
  const handleNotesChange = useCallback((value: string) => {
    setNotesText(value);
    setNotesSaved(false);
    if (notesTimer.current) clearTimeout(notesTimer.current);
    notesTimer.current = setTimeout(async () => {
      setNotesSaving(true);
      try {
        await fetch(`/api/superadmin/users/${profile.id}/notes`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notes: value }),
        });
        setNotesSaved(true);
      } catch {}
      setNotesSaving(false);
    }, 2000);
  }, [profile.id]);

  // ── Tags ────────────────────────────────────────────────────────────
  const addTag = useCallback(async () => {
    const tag = newTag.trim().toLowerCase();
    if (!tag || tags.includes(tag)) return;
    setTags(prev => [...prev, tag]);
    setNewTag("");
    try {
      const service = await fetch(`/api/superadmin/users/${profile.id}/notes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notesText, tags: [...tags, tag] }),
      });
    } catch {}
  }, [newTag, tags, profile.id, notesText]);

  const removeTag = useCallback(async (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  }, []);

  // ── Session sorting ─────────────────────────────────────────────────
  const sortedSessions = useMemo(() => {
    const sorted = [...sessions];
    sorted.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "date": cmp = new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime(); break;
        case "brewery": cmp = a.breweryName.localeCompare(b.breweryName); break;
        case "duration": cmp = (a.duration ?? 0) - (b.duration ?? 0); break;
        case "beers": cmp = a.beerCount - b.beerCount; break;
        case "rating": cmp = (a.avgRating ?? 0) - (b.avgRating ?? 0); break;
      }
      return sortDir === "desc" ? -cmp : cmp;
    });
    return sorted;
  }, [sessions, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  // ── Sparkline chart data ────────────────────────────────────────────
  const sparklineChartData = engagementSparkline.map((count, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return { date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), sessions: count };
  });

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <Link
        href="/superadmin/users"
        className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider hover:underline"
        style={{ color: "var(--text-muted)" }}
      >
        <ArrowLeft size={12} />
        Users
      </Link>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <motion.div {...variants.slideUp} transition={spring.gentle}>
        <div className="flex flex-col sm:flex-row items-start gap-4">
          {/* Avatar */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center border flex-shrink-0 overflow-hidden"
            style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
          >
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <User size={28} style={{ color: "var(--text-muted)" }} />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Name */}
            <h1 className="font-display text-2xl font-bold truncate" style={{ color: "var(--text-primary)" }}>
              {profile.display_name ?? profile.username}
            </h1>

            {/* Username + email */}
            <div className="flex items-center gap-2 flex-wrap mt-0.5">
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                @{profile.username}
              </span>
              {profile.email && (
                <span className="flex items-center gap-1 text-sm" style={{ color: "var(--text-muted)" }}>
                  · {profile.email}
                  <CopyButton text={profile.email} />
                </span>
              )}
              {profile.home_city && (
                <span className="flex items-center gap-1 text-sm" style={{ color: "var(--text-muted)" }}>
                  · <MapPin size={11} /> {profile.home_city}
                </span>
              )}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mt-2.5">
              {/* Segment */}
              <span
                className="inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-full"
                style={{ background: segmentConfig.bgColor, color: segmentConfig.color }}
              >
                {segmentConfig.emoji} {segmentConfig.label}
              </span>

              {/* Churn risk */}
              <span
                className="inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-full"
                style={{
                  background: `${CHURN_COLORS[churnRisk.level]}20`,
                  color: CHURN_COLORS[churnRisk.level],
                }}
              >
                {churnRisk.level === "green" ? "●" : churnRisk.level === "amber" ? "◐" : "○"}
                {" "}{churnRisk.label}
                {churnRisk.daysSinceLastSession !== null && ` (${churnRisk.daysSinceLastSession}d)`}
              </span>

              {/* Engagement */}
              <span
                className="inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-full"
                style={{ background: "rgba(212,168,67,0.1)", color: "var(--accent-gold)" }}
              >
                <Zap size={10} /> {engagementScore}/100 · {engagementLevel}
              </span>

              {/* Superadmin */}
              {profile.is_superadmin && (
                <span
                  className="inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(196,75,58,0.1)", color: "var(--danger)" }}
                >
                  <ShieldAlert size={10} /> Admin
                </span>
              )}
            </div>
          </div>

          {/* External link to profile */}
          <Link
            href={`/profile/${profile.username}`}
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-colors border"
            style={{ color: "var(--text-secondary)", borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <ExternalLink size={12} />
            View Profile
          </Link>
        </div>

        {/* Mini stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {[
            { label: "Sessions", value: totalSessions.toLocaleString(), icon: Beer },
            { label: "Level", value: `${profile.level}`, icon: TrendingUp },
            { label: "Streak", value: `${profile.current_streak}d`, icon: Flame },
            { label: "XP", value: profile.xp.toLocaleString(), icon: Star },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <stat.icon size={14} style={{ color: "var(--accent-gold)" }} />
              <div>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{stat.label}</p>
                <p className="text-sm font-mono font-bold" style={{ color: "var(--text-primary)" }}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Tab Navigation ──────────────────────────────────────────── */}
      <div
        className="flex gap-1 p-1 rounded-xl overflow-x-auto"
        style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-3.5 py-2 rounded-lg text-xs font-mono transition-all whitespace-nowrap"
            style={{
              background: activeTab === tab.id ? "var(--accent-gold)" : "transparent",
              color: activeTab === tab.id ? "#0F0E0C" : "var(--text-secondary)",
              fontWeight: activeTab === tab.id ? 600 : 400,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ─────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === "overview" && (
            <OverviewTab
              data={data}
              chartData={sparklineChartData}
            />
          )}
          {activeTab === "activity" && (
            <ActivityTimeline events={recentActivity} />
          )}
          {activeTab === "sessions" && (
            <SessionsTab
              sessions={sortedSessions}
              heatmap={sessionHeatmap}
              sortKey={sortKey}
              sortDir={sortDir}
              toggleSort={toggleSort}
            />
          )}
          {activeTab === "social" && (
            <SocialTab data={data} />
          )}
          {activeTab === "breweries" && (
            <BreweriesTab affinities={breweryAffinities} />
          )}
          {activeTab === "admin" && (
            <AdminTab
              profile={profile}
              notesText={notesText}
              notesSaving={notesSaving}
              notesSaved={notesSaved}
              onNotesChange={handleNotesChange}
              tags={tags}
              newTag={newTag}
              setNewTag={setNewTag}
              onAddTag={addTag}
              onRemoveTag={removeTag}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Overview Tab ───────────────────────────────────────────────────────

function OverviewTab({ data, chartData }: { data: UserDetailData; chartData: { date: string; sessions: number }[] }) {
  const { kpis, topStyles, lifecycle, segmentConfig, engagementScore, engagementLevel, profile } = data;

  return (
    <div className="space-y-4">
      {/* 30-day activity chart */}
      <Card padding="spacious">
        <CardHeader>
          <CardTitle as="h3">30-Day Activity</CardTitle>
        </CardHeader>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4A843" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#D4A843" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={false} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                  fontFamily: "var(--font-mono)",
                }}
                labelStyle={{ color: "var(--text-muted)" }}
                itemStyle={{ color: "var(--accent-gold)" }}
              />
              <Area
                type="monotone"
                dataKey="sessions"
                stroke="#D4A843"
                strokeWidth={2}
                fill="url(#goldGrad)"
                dot={false}
                activeDot={{ r: 3, fill: "#D4A843" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Customer Intelligence */}
        <Card>
          <CardHeader><CardTitle as="h3">Customer Intelligence</CardTitle></CardHeader>
          <div className="space-y-3 px-5 pb-5">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{segmentConfig.emoji}</span>
              <div>
                <p className="text-sm font-medium" style={{ color: segmentConfig.color }}>
                  {segmentConfig.label} — {engagementLevel}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {segmentConfig.description}
                </p>
              </div>
            </div>
            {/* Engagement bar */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: "var(--text-muted)" }}>Engagement Score</span>
                <span className="font-mono" style={{ color: "var(--accent-gold)" }}>{engagementScore}/100</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "var(--accent-gold)" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${engagementScore}%` }}
                  transition={spring.gentle}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Lifecycle Pipeline */}
        <Card>
          <CardHeader><CardTitle as="h3">Lifecycle</CardTitle></CardHeader>
          <div className="flex items-center justify-between px-5 pb-5 gap-1">
            {lifecycle.map((stage, i) => (
              <div key={stage.id} className="flex items-center gap-1 flex-1">
                {/* Dot */}
                <div className="flex flex-col items-center">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      background: stage.reached ? "var(--accent-gold)" : "var(--surface-2)",
                      color: stage.reached ? "#0F0E0C" : "var(--text-muted)",
                      border: `2px solid ${stage.reached ? "var(--accent-gold)" : "var(--border)"}`,
                    }}
                  >
                    {stage.reached ? "✓" : i + 1}
                  </div>
                  <span
                    className="text-[10px] mt-1 text-center leading-tight"
                    style={{ color: stage.reached ? "var(--text-primary)" : "var(--text-muted)" }}
                  >
                    {stage.label}
                  </span>
                </div>
                {/* Connector line */}
                {i < lifecycle.length - 1 && (
                  <div
                    className="flex-1 h-0.5 mt-[-14px]"
                    style={{ background: lifecycle[i + 1].reached ? "var(--accent-gold)" : "var(--border)" }}
                  />
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Beer DNA */}
      {topStyles.length > 0 && (
        <Card>
          <CardHeader><CardTitle as="h3">Beer DNA</CardTitle></CardHeader>
          <div className="space-y-2 px-5 pb-5">
            {topStyles.slice(0, 6).map((style) => (
              <div key={style.name} className="flex items-center gap-3">
                <span className="text-xs font-mono w-24 truncate" style={{ color: "var(--text-secondary)" }}>
                  {style.name}
                </span>
                <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: "var(--accent-gold)" }}
                    initial={{ width: 0 }}
                    animate={{ width: `${style.pct}%` }}
                    transition={{ ...spring.gentle, delay: 0.05 }}
                  />
                </div>
                <span className="text-xs font-mono w-10 text-right" style={{ color: "var(--text-muted)" }}>
                  {style.pct}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Key Stats */}
      <StatsGrid
        columns={3}
        stats={[
          { icon: <Star size={16} />, label: "Avg Rating", value: kpis.avgRating !== null ? `${kpis.avgRating}★` : "—" },
          { icon: <Beer size={16} />, label: "Beers / Session", value: kpis.beersPerSession !== null ? `${kpis.beersPerSession}` : "—" },
          { icon: <Trophy size={16} />, label: "Favorite Style", value: kpis.favoriteStyle?.name ?? "—" },
          { icon: <BarChart3 size={16} />, label: "Avg ABV", value: kpis.avgAbv !== null ? `${kpis.avgAbv}%` : "—" },
          { icon: <MapPin size={16} />, label: "Cities", value: `${kpis.citiesVisited}` },
          { icon: <MapPin size={16} />, label: "States", value: `${kpis.statesVisited}` },
        ]}
      />

      {/* Key Dates */}
      <Card>
        <CardHeader><CardTitle as="h3">Key Dates</CardTitle></CardHeader>
        <div className="grid grid-cols-2 gap-3 px-5 pb-5">
          {[
            { label: "Joined", value: formatDate(profile.created_at), icon: Calendar },
            { label: "Last Session", value: profile.last_session_date ? formatRelativeTime(profile.last_session_date) : "Never", icon: Clock },
            { label: "Current Streak", value: `${profile.current_streak} days`, icon: Flame },
            { label: "Longest Streak", value: `${profile.longest_streak} days`, icon: Trophy },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <item.icon size={13} style={{ color: "var(--text-muted)" }} />
              <div>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{item.label}</p>
                <p className="text-sm font-mono" style={{ color: "var(--text-primary)" }}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Sort Header (extracted to module scope for React compiler) ──────────

function SortHeader({ sKey, label, width, sortKey, sortDir, toggleSort }: {
  sKey: SortKey; label: string; width: string;
  sortKey: SortKey; sortDir: SortDir; toggleSort: (key: SortKey) => void;
}) {
  return (
    <button
      onClick={() => toggleSort(sKey)}
      className={`${width} text-right text-xs font-mono uppercase tracking-wider flex items-center justify-end gap-1`}
      style={{ color: sortKey === sKey ? "var(--accent-gold)" : "var(--text-muted)" }}
    >
      {label}
      {sortKey === sKey && <span>{sortDir === "desc" ? "↓" : "↑"}</span>}
    </button>
  );
}

// ── Sessions Tab ──────────────────────────────────────────────────────

function SessionsTab({
  sessions, heatmap, sortKey, sortDir, toggleSort,
}: {
  sessions: UserDetailData["sessions"];
  heatmap: UserDetailData["sessionHeatmap"];
  sortKey: SortKey;
  sortDir: SortDir;
  toggleSort: (key: SortKey) => void;
}) {
  return (
    <div className="space-y-4">
      <SessionHeatmap data={heatmap} />

      <Card>
        <CardHeader><CardTitle as="h3">Session History</CardTitle></CardHeader>
        <div className="overflow-x-auto">
          {/* Table header */}
          <div
            className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-3 border-b"
            style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}
          >
            <SortHeader sKey="date" label="Date" width="text-left" sortKey={sortKey} sortDir={sortDir} toggleSort={toggleSort} />
            <SortHeader sKey="brewery" label="Brewery" width="w-32" sortKey={sortKey} sortDir={sortDir} toggleSort={toggleSort} />
            <SortHeader sKey="duration" label="Duration" width="w-20" sortKey={sortKey} sortDir={sortDir} toggleSort={toggleSort} />
            <SortHeader sKey="beers" label="Beers" width="w-16" sortKey={sortKey} sortDir={sortDir} toggleSort={toggleSort} />
            <SortHeader sKey="rating" label="Rating" width="w-16" sortKey={sortKey} sortDir={sortDir} toggleSort={toggleSort} />
          </div>

          {sessions.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: "var(--text-muted)" }}>No sessions</p>
          ) : (
            sessions.slice(0, 50).map((session, i) => (
              <div
                key={session.id}
                className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-3 items-center"
                style={{ borderTop: i > 0 ? "1px solid var(--border)" : undefined }}
              >
                <span className="text-sm" style={{ color: "var(--text-primary)" }}>
                  {formatDate(session.startedAt)}
                </span>
                <span className="text-sm w-32 truncate text-right" style={{ color: "var(--text-secondary)" }}>
                  {session.breweryName}
                </span>
                <span className="text-sm font-mono w-20 text-right" style={{ color: "var(--text-muted)" }}>
                  {formatDuration(session.duration)}
                </span>
                <span className="text-sm font-mono w-16 text-right" style={{ color: "var(--text-secondary)" }}>
                  {session.beerCount}
                </span>
                <span className="text-sm font-mono w-16 text-right" style={{ color: session.avgRating ? "var(--accent-gold)" : "var(--text-muted)" }}>
                  {session.avgRating ? `${session.avgRating}★` : "—"}
                </span>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

// ── Social Tab ────────────────────────────────────────────────────────

function SocialTab({ data }: { data: UserDetailData }) {
  const { totalFriends, totalReactions, totalComments, totalAchievements, totalPossibleAchievements, kpis } = data;

  return (
    <div className="space-y-4">
      <StatsGrid
        columns={3}
        stats={[
          { icon: <User size={16} />, label: "Friends", value: `${totalFriends}` },
          { icon: <Heart size={16} />, label: "Reactions Given", value: `${totalReactions}` },
          { icon: <MessageSquare size={16} />, label: "Comments", value: `${totalComments}` },
          { icon: <Trophy size={16} />, label: "Achievements", value: `${totalAchievements}/${totalPossibleAchievements}` },
          { icon: <Zap size={16} />, label: "Social Score", value: `${kpis.socialScore}` },
          { icon: <BarChart3 size={16} />, label: "Achievement %", value: kpis.achievementPct !== null ? `${kpis.achievementPct}%` : "—" },
        ]}
      />

      <Card>
        <CardHeader><CardTitle as="h3">Social Influence</CardTitle></CardHeader>
        <div className="px-5 pb-5">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(212,168,67,0.1)" }}
            >
              <span className="text-2xl font-mono font-bold" style={{ color: "var(--accent-gold)" }}>
                {kpis.socialScore}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                Social Score
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Friends ({totalFriends}) + Reactions ({totalReactions}) + Comments ({totalComments})
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ── Breweries Tab ─────────────────────────────────────────────────────

function BreweriesTab({ affinities }: { affinities: BreweryAffinity[] }) {
  if (affinities.length === 0) {
    return (
      <Card>
        <p className="text-sm text-center py-12" style={{ color: "var(--text-muted)" }}>
          No brewery visits recorded
        </p>
      </Card>
    );
  }

  const homeBrewery = affinities[0]; // Already sorted by visits desc

  return (
    <div className="space-y-4">
      {/* Home brewery highlight */}
      {homeBrewery && (
        <Card>
          <div className="flex items-center gap-3 px-5 py-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(212,168,67,0.15)" }}
            >
              <MapPin size={18} style={{ color: "var(--accent-gold)" }} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-mono uppercase tracking-wider" style={{ color: "var(--accent-gold)" }}>
                Home Brewery
              </p>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {homeBrewery.breweryName}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {homeBrewery.visits} visits · {[homeBrewery.city, homeBrewery.state].filter(Boolean).join(", ")}
              </p>
            </div>
            {homeBrewery.avgRating && (
              <span className="text-sm font-mono" style={{ color: "var(--accent-gold)" }}>
                {homeBrewery.avgRating}★
              </span>
            )}
          </div>
        </Card>
      )}

      {/* Affinity table */}
      <Card>
        <CardHeader><CardTitle as="h3">Brewery Visits</CardTitle></CardHeader>
        <div className="overflow-x-auto">
          <div
            className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-3 text-xs font-mono uppercase tracking-wider border-b"
            style={{ color: "var(--text-muted)", borderColor: "var(--border)", background: "var(--surface-2)" }}
          >
            <span>Brewery</span>
            <span className="w-16 text-right">Visits</span>
            <span className="w-24 text-right hidden sm:block">Last Visit</span>
            <span className="w-16 text-right">Rating</span>
            <span className="w-16 text-right hidden sm:block">Loyalty</span>
          </div>
          {affinities.map((b, i) => (
            <div
              key={b.breweryId}
              className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-3 items-center"
              style={{ borderTop: i > 0 ? "1px solid var(--border)" : undefined }}
            >
              <div className="min-w-0">
                <p className="text-sm truncate" style={{ color: "var(--text-primary)" }}>{b.breweryName}</p>
                {(b.city || b.state) && (
                  <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                    {[b.city, b.state].filter(Boolean).join(", ")}
                  </p>
                )}
              </div>
              <span className="text-sm font-mono w-16 text-right" style={{ color: "var(--text-secondary)" }}>
                {b.visits}
              </span>
              <span className="text-xs w-24 text-right hidden sm:block" style={{ color: "var(--text-muted)" }}>
                {b.lastVisit ? formatRelativeTime(b.lastVisit) : "—"}
              </span>
              <span className="text-sm font-mono w-16 text-right" style={{ color: b.avgRating ? "var(--accent-gold)" : "var(--text-muted)" }}>
                {b.avgRating ? `${b.avgRating}★` : "—"}
              </span>
              <span className="text-sm w-16 text-right hidden sm:block">
                {b.hasLoyaltyCard ? (
                  <span style={{ color: "#4A7C59" }}>●</span>
                ) : (
                  <span style={{ color: "var(--text-muted)" }}>—</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Admin Tab ─────────────────────────────────────────────────────────

function AdminTab({
  profile, notesText, notesSaving, notesSaved, onNotesChange,
  tags, newTag, setNewTag, onAddTag, onRemoveTag,
}: {
  profile: UserDetailData["profile"];
  notesText: string;
  notesSaving: boolean;
  notesSaved: boolean;
  onNotesChange: (v: string) => void;
  tags: string[];
  newTag: string;
  setNewTag: (v: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Notes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <CardTitle as="h3">Admin Notes</CardTitle>
            <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
              {notesSaving ? "Saving…" : notesSaved ? "Saved" : "Auto-saves"}
            </span>
          </div>
        </CardHeader>
        <div className="px-5 pb-5">
          <textarea
            value={notesText}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Add notes about this user…"
            rows={5}
            className="w-full px-3 py-2.5 rounded-xl text-sm resize-none outline-none transition-colors"
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
          />
        </div>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader><CardTitle as="h3">Tags</CardTitle></CardHeader>
        <div className="px-5 pb-5 space-y-3">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full"
                style={{ background: "rgba(212,168,67,0.1)", color: "var(--accent-gold)" }}
              >
                <Tag size={10} />
                {tag}
                <button onClick={() => onRemoveTag(tag)} className="hover:opacity-70 transition-opacity">
                  <X size={10} />
                </button>
              </span>
            ))}
            {tags.length === 0 && (
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>No tags</span>
            )}
          </div>
          <div className="flex gap-2">
            <input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onAddTag()}
              placeholder="Add tag…"
              className="flex-1 px-3 py-1.5 rounded-lg text-sm outline-none"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
            />
            <button
              onClick={onAddTag}
              className="px-3 py-1.5 rounded-lg text-xs font-mono transition-colors"
              style={{ background: "var(--accent-gold)", color: "#0F0E0C" }}
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </Card>

      {/* Profile metadata */}
      <Card>
        <CardHeader><CardTitle as="h3">Profile Metadata</CardTitle></CardHeader>
        <div className="grid grid-cols-2 gap-3 px-5 pb-5">
          {[
            { label: "User ID", value: profile.id.slice(0, 8) + "…", full: profile.id },
            { label: "Email", value: profile.email ?? "—" },
            { label: "Visibility", value: profile.is_public ? "Public" : "Private" },
            { label: "Push Notifications", value: profile.notification_preferences ? "Configured" : "Default" },
            { label: "Live Sharing", value: profile.share_live ? "Enabled" : "Disabled" },
            { label: "Superadmin", value: profile.is_superadmin ? "Yes" : "No" },
            { label: "Unique Beers", value: `${profile.unique_beers}` },
            { label: "Unique Breweries", value: `${profile.unique_breweries}` },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-1.5">
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>{item.label}</span>
              <span className="text-xs font-mono flex items-center gap-1" style={{ color: "var(--text-secondary)" }}>
                {item.value}
                {"full" in item && item.full && <CopyButton text={item.full} />}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
