import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function PintRewindLoading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: "#0F0E0C" }}>
      <div className="text-center">
        <p className="text-5xl mb-4">🍺</p>
        <Skeleton className="h-6 w-48 rounded mx-auto mb-2" />
        <Skeleton className="h-4 w-32 rounded mx-auto" />
      </div>
    </div>
  );
}
