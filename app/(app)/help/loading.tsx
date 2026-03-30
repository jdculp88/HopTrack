import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function HelpLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Title */}
      <Skeleton className="h-9 w-48" />
      {/* Subtitle */}
      <Skeleton className="h-4 w-64" />
      {/* FAQ items */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 space-y-2"
        >
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
        </div>
      ))}
    </div>
  );
}
