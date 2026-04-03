import { cn } from "@/lib/utils";

/**
 * Form field wrapper — Sprint 134 (The Tidy)
 *
 * Replaces 10+ identical label + input + error patterns across admin and auth pages.
 *
 * @example
 * <FormField label="Brewery Name" error={errors.name} required>
 *   <input value={form.name} onChange={...} />
 * </FormField>
 */
interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function FormField({ label, error, required, className, children }: FormFieldProps) {
  return (
    <div className={cn(className)}>
      <label
        className="block text-xs font-semibold mb-1.5"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
        {required && <span style={{ color: "var(--danger)" }}> *</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs mt-1" style={{ color: "var(--danger)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
