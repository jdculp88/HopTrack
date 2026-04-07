/**
 * SectionHeader — Design System v2.0 Section 08
 *
 * Two variants:
 * - "label": JetBrains Mono 10px/0.14em uppercase + extending hairline. For list subgroups.
 * - "title": General Sans 20px/600 + amber "See all →" link. For major content sections.
 */

interface SectionHeaderProps {
  /** Variant determines the visual treatment */
  variant?: "label" | "title";
  /** The section text */
  children: string;
  /** Optional action link (title variant only) */
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function SectionHeader({
  variant = "title",
  children,
  action,
  className,
}: SectionHeaderProps) {
  if (variant === "label") {
    return (
      <div className={`flex items-center gap-2 ${className ?? ""}`}>
        <span
          className="font-mono text-[10px] font-semibold tracking-[0.14em] uppercase whitespace-nowrap"
          style={{ color: "var(--text-muted)" }}
        >
          {children}
        </span>
        <div className="h-px flex-1" style={{ background: "var(--border)" }} />
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-between ${className ?? ""}`}>
      <h2
        className="font-display text-xl font-semibold tracking-[-0.01em]"
        style={{ color: "var(--text-primary)" }}
      >
        {children}
      </h2>
      {action && (
        <button
          onClick={action.onClick}
          className="font-mono text-[11px] font-medium transition-opacity hover:opacity-70"
          style={{ color: "var(--amber, var(--accent-gold))" }}
        >
          {action.label} →
        </button>
      )}
    </div>
  );
}
