import { createClient } from "@/lib/supabase/server";
import { FileText, Flag, Eye, MessageSquare, Camera, Clock } from "lucide-react";

export const metadata = { title: "Content" };

export default async function ContentPage() {
  const supabase = await createClient();

  // Pull some basic stats to make the page useful even as a placeholder
  const [{ count: totalCheckins }, { count: totalBeers }, { count: totalBreweries }] =
    await Promise.all([
      supabase.from("sessions").select("id", { count: "exact", head: true }).eq("is_active", false) as any,
      supabase.from("beers").select("id", { count: "exact", head: true }) as any,
      supabase.from("breweries").select("id", { count: "exact", head: true }) as any,
    ]);

  const UPCOMING = [
    {
      icon: Flag,
      title: "Reported Sessions",
      desc: "Users can flag sessions that violate community guidelines. Review queue coming in Sprint 8.",
      status: "Sprint 8",
    },
    {
      icon: MessageSquare,
      title: "Comment Moderation",
      desc: "Review and remove comments on sessions. Planned once comment threads ship.",
      status: "Sprint 9",
    },
    {
      icon: Camera,
      title: "Photo Review",
      desc: "AI-assisted review of uploaded photos for inappropriate content. Requires Storage to ship first.",
      status: "Sprint 8+",
    },
    {
      icon: Eye,
      title: "Beer Name Approval",
      desc: "Optional gating of new beer submissions to prevent spam entries.",
      status: "Sprint 8",
    },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <FileText size={15} style={{ color: "var(--text-muted)" }} />
          <p
            className="text-xs font-mono uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            Platform
          </p>
        </div>
        <h1
          className="font-display text-2xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          Content Moderation
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Tools for reviewing and managing user-generated content across the platform.
        </p>
      </div>

      {/* Current content stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Sessions", value: (totalCheckins ?? 0).toLocaleString() },
          { label: "Beers in DB", value: (totalBeers ?? 0).toLocaleString() },
          { label: "Breweries", value: (totalBreweries ?? 0).toLocaleString() },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border p-4"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <p
              className="font-display text-2xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {stat.value}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Upcoming moderation tools */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Clock size={14} style={{ color: "var(--text-muted)" }} />
          <h2
            className="text-xs font-mono uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            Moderation Tools — In Development
          </h2>
        </div>

        <div className="space-y-3">
          {UPCOMING.map(({ icon: Icon, title, desc, status }) => (
            <div
              key={title}
              className="flex items-start gap-4 p-4 rounded-xl border"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: "var(--surface-2)" }}
              >
                <Icon size={16} style={{ color: "var(--text-muted)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap mb-0.5">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {title}
                  </p>
                  <span
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded uppercase tracking-wide"
                    style={{
                      background: "var(--surface-2)",
                      color: "var(--text-muted)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {status}
                  </span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
