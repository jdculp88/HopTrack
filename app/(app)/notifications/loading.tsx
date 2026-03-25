import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function NotificationsLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <Skeleton className="h-7 w-40" />
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 flex items-start gap-3">
            <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
