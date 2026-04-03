/**
 * Auth error alert — Sprint 134 (The Tidy)
 *
 * Replaces identical error display pattern across all 4 auth pages.
 */
export function AuthErrorAlert({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <p className="text-sm text-[#C44B3A] bg-[#C44B3A]/10 border border-[#C44B3A]/20 rounded-xl px-4 py-3 mb-4">
      {message}
    </p>
  );
}
