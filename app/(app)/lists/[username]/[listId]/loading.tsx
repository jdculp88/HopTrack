import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Skeleton className="h-4 w-32 rounded mb-6" />
      <div className="rounded-2xl p-5 mb-6 flex items-start gap-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-7 w-2/3 rounded" />
          <Skeleton className="h-4 w-1/4 rounded" />
          <Skeleton className="h-3 w-1/5 rounded" />
        </div>
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-2xl p-4 flex items-start gap-3" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <Skeleton className="w-7 h-5 rounded" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-3/5 rounded" />
              <Skeleton className="h-3 w-2/5 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
