/**
 * Auth divider ("or") — Sprint 134 (The Tidy)
 *
 * Replaces identical divider pattern in login, signup, and forgot-password pages.
 */
export function AuthDivider({ label = "or" }: { label?: string }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex-1 h-px bg-[#3A3628]" />
      <span className="text-xs text-[var(--text-muted)]">{label}</span>
      <div className="flex-1 h-px bg-[#3A3628]" />
    </div>
  );
}
