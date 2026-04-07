"use client";

import { forwardRef } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useHaptic } from "@/hooks/useHaptic";
import { spring, microInteraction } from "@/lib/animation";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "gold" | "style";
type ButtonSize = "xs" | "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
  /** CSS color string for variant="style" — uses beer's style primary color */
  styleColor?: string;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--accent-gold)] text-[var(--bg)] hover:bg-[var(--accent-amber)] border border-transparent font-semibold",
  secondary:
    "bg-[var(--surface)] text-[var(--text-primary)] hover:bg-[var(--surface-2)] border border-[var(--border)] hover:border-[var(--text-muted)]",
  ghost:
    "bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)] border border-transparent",
  danger:
    "bg-[var(--danger)]/10 text-[var(--danger)] hover:bg-[var(--danger)]/20 border border-[var(--danger)]/30",
  gold:
    "bg-transparent text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/40 hover:border-[var(--accent-gold)]",
  style:
    "border border-transparent font-semibold",  /* color set via inline style */
};

const SIZES: Record<ButtonSize, string> = {
  xs: "text-xs px-2 py-1 min-h-[32px] rounded-lg gap-1",
  sm: "text-sm px-3 py-2 min-h-[40px] rounded-xl gap-1.5",
  md: "text-sm px-4 py-2.5 min-h-[44px] rounded-xl gap-2",
  lg: "text-base px-6 py-3 min-h-[48px] rounded-2xl gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      iconRight,
      fullWidth = false,
      styleColor,
      children,
      className,
      disabled,
      onClick,
      style,
      ...props
    },
    ref
  ) => {
    const { haptic } = useHaptic();

    // DS v2: style variant uses beer's primary color for bg + colored shadow
    const styleVariantProps = variant === "style" && styleColor
      ? {
          style: {
            backgroundColor: styleColor,
            color: "var(--bg)",
            boxShadow: `0 4px 16px ${styleColor}20`,
            ...style,
          } as React.CSSProperties,
        }
      : { style };

    return (
      <button
        ref={ref}
        onClick={(e) => {
          haptic("press");
          onClick?.(e);
        }}
        className={cn(
          "inline-flex items-center justify-center font-sans transition-all duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]",
          "disabled:opacity-50 disabled:pointer-events-none",
          VARIANTS[variant],
          SIZES[size],
          fullWidth && "w-full",
          className
        )}
        disabled={disabled || loading}
        {...styleVariantProps}
        {...props}
      >
        <motion.span
          className="inline-flex items-center justify-center gap-inherit w-full"
          whileHover={variant === "primary" ? { scale: 1.01 } : undefined}
          whileTap={microInteraction.press}
          transition={spring.default}
          style={{ gap: "inherit" }}
        >
          {loading ? (
            <LoadingSpinner size={size} />
          ) : icon ? (
            <span className="flex-shrink-0">{icon}</span>
          ) : null}
          {children && <span>{children}</span>}
          {iconRight && !loading && (
            <span className="flex-shrink-0">{iconRight}</span>
          )}
        </motion.span>
      </button>
    );
  }
);
Button.displayName = "Button";

function LoadingSpinner({ size }: { size: ButtonSize }) {
  const s = { xs: "w-3 h-3", sm: "w-3.5 h-3.5", md: "w-4 h-4", lg: "w-5 h-5" };
  return (
    <svg
      className={cn("animate-spin", s[size])}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12" cy="12" r="10"
        stroke="currentColor" strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
