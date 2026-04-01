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
  children: React.ReactNode;
}

const paddingClasses = {
  compact: "p-3",
  default: "p-4",
  spacious: "p-5",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ bgClass, padding = "default", hoverable = false, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border",
          paddingClasses[padding],
          bgClass,
          hoverable
            ? "border-[var(--border)] hover:border-[var(--accent-gold)]/30 transition-colors"
            : "border-[var(--border)]",
          !bgClass && "bg-[var(--surface)]",
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
