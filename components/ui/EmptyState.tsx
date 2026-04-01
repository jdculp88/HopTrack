"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  /** Emoji alternative to icon */
  emoji?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary" | "gold";
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeConfig = {
  sm: { container: "py-8 px-4", emoji: "text-3xl", title: "text-base", desc: "text-sm" },
  md: { container: "py-12 px-6", emoji: "text-4xl", title: "text-lg", desc: "text-sm" },
  lg: { container: "py-16 px-8", emoji: "text-5xl", title: "text-xl", desc: "text-base" },
};

export function EmptyState({
  icon,
  emoji,
  title,
  description,
  action,
  secondaryAction,
  className,
  size = "md",
}: EmptyStateProps) {
  const s = sizeConfig[size];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className={cn(
        "flex flex-col items-center justify-center text-center",
        s.container,
        className
      )}
    >
      {(icon || emoji) && (
        <div className={cn("mb-4", emoji && s.emoji)}>
          {emoji ? <span>{emoji}</span> : icon}
        </div>
      )}

      <h3 className={cn("font-display font-semibold text-[var(--text-primary)] mb-2", s.title)}>
        {title}
      </h3>

      {description && (
        <p className={cn("text-[var(--text-muted)] max-w-xs mb-6", s.desc)}>
          {description}
        </p>
      )}

      {!description && (action || secondaryAction) && <div className="mb-6" />}

      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {action && (
            <Button
              variant={action.variant ?? "primary"}
              size="md"
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="ghost" size="md" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}
