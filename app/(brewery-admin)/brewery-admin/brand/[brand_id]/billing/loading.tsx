import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function BrandBillingLoading() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-44 rounded-xl" />
      </div>

      {/* Subscription status card */}
      <div className="rounded-2xl p-6 space-y-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <Skeleton className="h-6 w-40" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      </div>

      {/* Locations */}
      <div className="rounded-2xl p-6 space-y-3" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>

      {/* Pricing card */}
      <div className="rounded-2xl p-6 space-y-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-12 w-48 rounded-xl" />
      </div>
    </div>
  );
}
