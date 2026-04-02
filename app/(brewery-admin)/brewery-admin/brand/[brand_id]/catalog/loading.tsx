import { Package } from "lucide-react";

export default function BrandCatalogLoading() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="border-b" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl animate-pulse" style={{ background: "var(--surface-2)" }} />
          <div className="flex-1 space-y-2">
            <div className="h-7 w-56 rounded-lg animate-pulse" style={{ background: "var(--surface-2)" }} />
            <div className="h-4 w-32 rounded-lg animate-pulse" style={{ background: "var(--surface-2)" }} />
          </div>
        </div>
      </div>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto pt-16 lg:pt-8">
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <Package size={32} style={{ color: "var(--text-muted)" }} />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Loading catalog...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
