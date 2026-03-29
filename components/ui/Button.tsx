"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "gold";
type ButtonSize = "xs" | "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-[#D4A843] text-[#0F0E0C] hover:bg-[#E8841A] border border-transparent font-semibold",
  secondary:
    "bg-[var(--surface)] text-[var(--text-primary)] hover:bg-[var(--surface-2)] border border-[var(--border)] hover:border-[#D4A843]/40",
  ghost:
    "bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)] border border-transparent",
  danger:
    "bg-[#C44B3A]/10 text-[#C44B3A] hover:bg-[#C44B3A]/20 border border-[#C44B3A]/30",
  gold:
    "bg-transparent text-[#D4A843] hover:bg-[#D4A843]/10 border border-[#D4A843]/40 hover:border-[#D4A843]",
};

const SIZES: Record<ButtonSize, string> = {
  xs: "text-xs px-2 py-1 rounded-lg gap-1",
  sm: "text-sm px-3 py-1.5 rounded-xl gap-1.5",
  md: "text-sm px-4 py-2.5 rounded-xl gap-2",
  lg: "text-base px-6 py-3 rounded-2xl gap-2",
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
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-sans transition-all duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A843] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F0E0C]",
          "disabled:opacity-50 disabled:pointer-events-none",
          VARIANTS[variant],
          SIZES[size],
          fullWidth && "w-full",
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        <motion.span
          className="inline-flex items-center justify-center gap-inherit w-full"
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
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
