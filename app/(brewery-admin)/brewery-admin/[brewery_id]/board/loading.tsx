import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function BoardLoading() {
  return (
    <div
      className="fixed inset-0 flex flex-col z-[9999]"
      style={{
        background: `
          radial-gradient(ellipse at 50% 0%, rgba(212,168,67,0.06) 0%, transparent 60%),
          radial-gradient(ellipse at 80% 100%, rgba(212,168,67,0.03) 0%, transparent 50%),
          #0F0E0C
        `,
      }}
    >
      {/* Header skeleton */}
      <div className="px-8 pt-6 pb-4">
        <div className="flex items-center gap-5">
          <Skeleton className="w-[72px] h-[72px] rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
          </div>
          <div className="ml-auto">
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <div className="mt-4 h-px bg-[#3A3628]" />
      </div>

      {/* Tile grid skeleton — 3x2 */}
      <div className="flex-1 px-8 pb-4 grid grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl p-5 flex flex-col gap-3"
            style={{ background: "#1C1A16", border: "1px solid #3A3628" }}
          >
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-24" />
            <div className="flex-1" />
            <div className="flex items-center justify-between pt-3 border-t border-[#3A3628]">
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>

      {/* Footer skeleton */}
      <div className="px-8 py-3 flex items-center justify-between border-t border-[#3A3628]">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
}
