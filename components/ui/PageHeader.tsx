import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

/**
 * Consistent page header — Sprint 134 (The Tidy)
 *
 * Replaces 10+ identical title + subtitle patterns across admin and consumer pages.
 *
 * @example
 * <PageHeader title="Tap List" subtitle="Manage your beers on tap" icon={Beer} />
 * <PageHeader title="Analytics" action={<Button>Export CSV</Button>} />
 */
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  /** Optional action element (button, etc.) rendered on the right */
  action?: React.ReactNode;
  /** Optional help element (HelpIcon, etc.) rendered inline after the title */
  helpAction?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, icon: Icon, action, helpAction, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-8", className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          {Icon && (
            <div className="flex items-center gap-2 mb-1">
              <Icon size={15} style={{ color: "var(--text-muted)" }} />
              <p className="text-xs font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                {title}
              </p>
            </div>
          )}
          <div className="flex items-center gap-2">
            <h1 className="font-display text-3xl font-bold" style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              {title}
            </h1>
            {helpAction && <div className="flex-shrink-0">{helpAction}</div>}
          </div>
          {subtitle && (
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  );
}
