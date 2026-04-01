import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function WrappedLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-md mx-auto rounded-2xl border overflow-hidden"
        style={{ background: "var(--surface)", borderColor: "var(--border)", aspectRatio: "9/16", maxHeight: "85vh" }}
      >
        <div className="flex gap-1 p-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-0.5 flex-1 rounded-full" />
          ))}
        </div>
        <div className="flex flex-col items-center justify-center h-[80%] gap-4">
          <Skeleton className="w-48 h-4 rounded" />
          <Skeleton className="w-64 h-10 rounded" />
          <Skeleton className="w-32 h-4 rounded" />
        </div>
      </div>
    </div>
  );
}
