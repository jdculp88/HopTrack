import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function MessagesLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6 pt-16 lg:pt-8">
      <div>
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>
      <div className="rounded-2xl border p-5 space-y-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <Skeleton className="h-4 w-28" />
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
      <div className="rounded-2xl border p-5 space-y-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <div className="flex justify-end">
          <Skeleton className="h-10 w-40 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
