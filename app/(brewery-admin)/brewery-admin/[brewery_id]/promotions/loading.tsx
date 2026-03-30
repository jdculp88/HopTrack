import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function PromotionsLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Heading */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>
      {/* Form fields / cards */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 space-y-4"
        >
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-32 rounded-xl" />
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}
