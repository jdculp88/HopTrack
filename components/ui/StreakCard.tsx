import type { ReactNode } from "react";

interface StreakCardProps {
  icon: ReactNode;
  streak: number;
  personalBest: number;
}

/**
 * StreakCard — gold gradient top bar, icon in warm-bg square,
 * big streak number + "day streak" label, personal best subtitle.
 */
export function StreakCard({ icon, streak, personalBest }: StreakCardProps) {
  return (
    <div
      className="rounded-[14px] overflow-hidden"
      style={{ border: "1px solid var(--border)", background: "var(--card-bg)" }}
    >
      <div style={{ height: "3px", background: "linear-gradient(90deg, var(--accent-gold), var(--accent-amber, var(--accent-gold)))" }} />
      <div className="flex items-center gap-3 p-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "var(--warm-bg)" }}
        >
          {icon}
        </div>
        <div>
          <p style={{ color: "var(--text-primary)" }}>
            <span className="font-mono font-bold" style={{ fontSize: "24px" }}>
              {streak}
            </span>
            <span className="font-sans font-semibold text-sm ml-1">day streak</span>
          </p>
          <p className="font-mono" style={{ fontSize: "10px", color: "var(--text-muted)" }}>
            Personal best: {personalBest} days
          </p>
        </div>
      </div>
    </div>
  );
}
