import { Search } from "lucide-react";

/**
 * Superadmin search form — Sprint 134 (The Tidy)
 *
 * Replaces identical search form in users, breweries, and claims pages.
 *
 * @example
 * <SearchForm placeholder="Search users..." defaultValue={q} />
 */
interface SearchFormProps {
  placeholder: string;
  defaultValue?: string | null;
  maxWidth?: string;
}

export function SearchForm({ placeholder, defaultValue, maxWidth = "max-w-sm" }: SearchFormProps) {
  return (
    <form method="GET" className="mb-5">
      <div
        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border w-full ${maxWidth}`}
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <Search size={14} style={{ color: "var(--text-muted)" }} />
        <input
          name="q"
          defaultValue={defaultValue ?? ""}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm outline-none"
          style={{ color: "var(--text-primary)" }}
        />
      </div>
    </form>
  );
}
