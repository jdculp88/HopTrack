import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function BoardLoading() {
  return (
    <div
      className="fixed inset-0 flex flex-col z-[9999]"
      style={{
        background: `
          radial-gradient(ellipse at 50% 0%, rgba(212,168,67,0.08) 0%, transparent 50%),
          #FBF7F0
        `,
      }}
    >
      {/* Header skeleton — brewery name */}
      <div style={{ padding: "28px 40px 20px" }}>
        <div className="flex items-center gap-4">
          <Skeleton className="w-14 h-14 rounded-[14px]" style={{ background: "rgba(26,23,20,0.08)" }} />
          <Skeleton className="h-12 w-96" style={{ background: "rgba(26,23,20,0.06)" }} />
          <div className="ml-auto">
            <Skeleton className="h-8 w-16" style={{ background: "rgba(212,168,67,0.15)" }} />
          </div>
        </div>
        <div className="mt-5" style={{ height: 1, background: "rgba(26,23,20,0.1)" }} />
      </div>

      {/* BOTW skeleton */}
      <div style={{ padding: "20px 40px 24px" }}>
        <Skeleton className="h-3 w-40 mb-3" style={{ background: "rgba(212,168,67,0.2)" }} />
        <div className="flex items-baseline gap-4">
          <Skeleton className="h-10 w-72" style={{ background: "rgba(26,23,20,0.06)" }} />
          <div className="flex-1" />
          <Skeleton className="h-10 w-16" style={{ background: "rgba(212,168,67,0.15)" }} />
        </div>
        <Skeleton className="h-3 w-48 mt-2" style={{ background: "rgba(26,23,20,0.04)" }} />
        <div className="mt-5" style={{ height: 2, background: "rgba(212,168,67,0.2)" }} />
      </div>

      {/* Beer list skeleton — 6 entries */}
      <div style={{ padding: "12px 40px", flex: 1 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ marginBottom: "clamp(20px, 2.5vh, 32px)" }}>
            <div className="flex items-baseline gap-3">
              <Skeleton className="h-8 w-56" style={{ background: "rgba(26,23,20,0.06)" }} />
              <div className="flex-1" style={{ borderBottom: "1.5px dotted rgba(212,168,67,0.15)", marginBottom: 8 }} />
              <Skeleton className="h-8 w-14" style={{ background: "rgba(212,168,67,0.12)" }} />
            </div>
            <Skeleton className="h-3 w-40 mt-1" style={{ background: "rgba(26,23,20,0.04)" }} />
          </div>
        ))}
      </div>

      {/* Footer skeleton */}
      <div style={{ padding: "16px 40px", borderTop: "1px solid rgba(26,23,20,0.08)" }} className="flex items-center justify-between">
        <Skeleton className="h-3 w-48" style={{ background: "rgba(26,23,20,0.04)" }} />
        <Skeleton className="h-3 w-24" style={{ background: "rgba(26,23,20,0.04)" }} />
      </div>
    </div>
  );
}
