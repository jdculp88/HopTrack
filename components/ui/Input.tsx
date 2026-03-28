import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, iconRight, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-[var(--text-secondary)] font-sans">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl",
              "text-[var(--text-primary)] placeholder:text-[var(--text-muted)] font-sans text-sm",
              "px-4 py-3 transition-all duration-150",
              "focus:outline-none focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)]/30",
              "hover:border-[#6B6456]",
              icon && "pl-10",
              iconRight && "pr-10",
              error && "border-[#C44B3A] focus:border-[#C44B3A] focus:ring-[#C44B3A]/30",
              className
            )}
            {...props}
          />
          {iconRight && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
              {iconRight}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-[#C44B3A] font-sans">{error}</p>}
        {hint && !error && <p className="text-xs text-[var(--text-muted)] font-sans">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-[var(--text-secondary)] font-sans">{label}</label>
        )}
        <textarea
          ref={ref}
          className={cn(
            "w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl",
            "text-[var(--text-primary)] placeholder:text-[var(--text-muted)] font-sans text-sm",
            "px-4 py-3 transition-all duration-150 resize-none",
            "focus:outline-none focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)]/30",
            "hover:border-[#6B6456]",
            error && "border-[#C44B3A]",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[#C44B3A]">{error}</p>}
        {hint && !error && <p className="text-xs text-[var(--text-muted)]">{hint}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
