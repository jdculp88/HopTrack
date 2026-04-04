import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
      <p className="text-5xl">🍺</p>
      <h2 className="font-display text-2xl font-bold text-[var(--text-primary)]">
        Page not found
      </h2>
      <p className="text-sm text-[var(--text-secondary)]">
        This tap appears to be empty. The page you are looking for does not exist.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <Link
          href="/home"
          className="px-6 py-3 bg-[var(--accent-gold)] text-[var(--bg)] font-semibold rounded-xl hover:opacity-90 transition-opacity"
        >
          Go Home
        </Link>
        <Link
          href="/explore"
          className="px-6 py-3 border border-[var(--border)] text-[var(--text-primary)] font-semibold rounded-xl hover:bg-[var(--surface)] transition-colors"
        >
          Explore Breweries
        </Link>
      </div>
    </div>
  );
}
