import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function BreweryWelcomeLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#FBF7F0" }}>
      <div className="w-full max-w-[480px] mx-auto px-6 py-12 space-y-6">
        <Skeleton className="h-8 w-40 mx-auto" />
        <Skeleton className="h-12 w-64 mx-auto" />
        <Skeleton className="h-4 w-48 mx-auto" />
        <div className="space-y-3 pt-4">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-12 w-full rounded-2xl" />
      </div>
    </div>
  );
}
