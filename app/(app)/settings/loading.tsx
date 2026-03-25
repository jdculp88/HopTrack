import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function SettingsLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <Skeleton className="h-7 w-28" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border)]">
            <Skeleton className="h-4 w-24" />
          </div>
          {Array.from({ length: 3 }).map((_, j) => (
            <div key={j} className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] last:border-0">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
