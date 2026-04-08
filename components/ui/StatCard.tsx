import type { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  value: number | string;
  label: string;
}

/**
 * StatCard — gold top bar, icon in warm-bg square, big mono number, uppercase label.
 * Design spec: 14px radius, 3px gold gradient top bar, 28px/700 number, 9px label.
 */
export function StatCard({ icon, value, label }: StatCardProps) {
  return (
    <div
      className="rounded-[14px] overflow-hidden"
      style={{ background: "var(--card-bg)", border: "1px solid var(--border)" }}
    >
      <div style={{ height: "3px", background: "linear-gradient(90deg, var(--accent-gold), var(--accent-amber, var(--accent-gold)))" }} />
      <div className="p-3">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center mb-2"
          style={{ background: "var(--warm-bg)" }}
        >
          {icon}
        </div>
        <p
          className="font-mono font-bold leading-none"
          style={{ fontSize: "28px", color: "var(--text-primary)" }}
        >
          {value}
        </p>
        <p
          className="font-mono uppercase mt-1"
          style={{ fontSize: "9px", color: "var(--text-muted)", letterSpacing: "0.08em" }}
        >
          {label}
        </p>
      </div>
    </div>
  );
}
