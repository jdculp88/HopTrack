import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function ReportLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Heading */}
      <Skeleton className="h-8 w-52" />
      {/* Date range pills */}
      <div className="flex gap-2">
        <Skeleton className="h-8 w-16 rounded-xl" />
        <Skeleton className="h-8 w-16 rounded-xl" />
        <Skeleton className="h-8 w-16 rounded-xl" />
        <Skeleton className="h-8 w-20 rounded-xl" />
      </div>
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 space-y-2"
          >
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-16" />
          </div>
        ))}
      </div>
      {/* Chart areas */}
      {Array.from({ length: 2 }).map((_, i) => (
        <div
          key={i}
          className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 space-y-3"
        >
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}
