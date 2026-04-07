"use client";

import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional semantic card-bg class (card-bg-stats, card-bg-reco, etc.) */
  bgClass?: string;
  /** Padding variant: compact (p-3), default (p-4), spacious (p-5) */
  padding?: "compact" | "default" | "spacious";
  /** Whether to show hover state border highlight */
  hoverable?: boolean;
  /** Sprint 161 — The Vibe: apply mesh gradient hero treatment */
  mesh?: boolean;
  /** Sprint 163 — The Depth: higher elevation shadow (modals, popovers, featured) */
  elevated?: boolean;
  /** Sprint 163 — The Depth: disable shadow (for inline/nested cards) */
  flat?: boolean;
  children: React.ReactNode;
}

const paddingClasses = {
  compact: "p-3",
  default: "p-4",
  spacious: "p-5",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ bgClass, padding = "default", hoverable = false, mesh = false, elevated = false, flat = false, className, children, ...props }, ref) => {
    const resolvedBgClass = mesh ? "card-bg-hero" : bgClass;
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border",
          paddingClasses[padding],
          resolvedBgClass,
          hoverable
            ? "border-[var(--card-border)] hover:border-[var(--accent-gold)]/30 transition-colors"
            : "border-[var(--card-border)]",
          !resolvedBgClass && "bg-[var(--card-bg)]",
          // Sprint 163 — Shadow & Elevation System
          !flat && (elevated
            ? "shadow-[var(--shadow-elevated)]"
            : "shadow-[var(--shadow-card)]"),
          hoverable && !flat && "hover:shadow-[var(--shadow-card-hover)]",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div className={cn("mb-3", className)} {...props}>
      {children}
    </div>
  );
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  as?: "h2" | "h3" | "h4";
}

export function CardTitle({ as: Tag = "h3", className, children, ...props }: CardTitleProps) {
  return (
    <Tag
      className={cn(
        "font-display font-bold text-[var(--text-primary)]",
        Tag === "h2" ? "text-2xl" : Tag === "h3" ? "text-lg" : "text-base",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
