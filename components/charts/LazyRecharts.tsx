// Lazy-loaded Recharts re-exports — Sprint 154 (The Native Feel)
// Owner: Dakota (Dev Lead)
//
// Recharts is a heavy library (~200KB). Most users never visit analytics pages.
// This wrapper re-exports all used Recharts components through a single dynamic
// import so the bundle is only loaded when charts are actually rendered.
//
// Usage: Replace `from "recharts"` with `from "@/components/charts/LazyRecharts"`

"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/SkeletonLoader";

function ChartFallback() {
  return <Skeleton className="w-full h-[200px] rounded-xl" />;
}

// Dynamic import that loads the recharts module once
const RechartsModule = dynamic(
  () => import("recharts").then((mod) => {
    // Return a dummy component — we extract the real ones below
    function RechartsProvider({ children }: { children: React.ReactNode }) {
      return <>{children}</>;
    }
    // Attach all exports to the component for extraction
    (RechartsProvider as any).__mod = mod;
    return { default: RechartsProvider };
  }),
  { ssr: false, loading: () => <ChartFallback /> }
);

// Re-export individual components by lazy-loading the module
// Each component is wrapped in dynamic() for proper code splitting

export const BarChart = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.BarChart })),
  { ssr: false }
);

export const Bar = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.Bar })),
  { ssr: false }
);

export const LineChart = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.LineChart })),
  { ssr: false }
);

export const Line = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.Line })),
  { ssr: false }
);

export const AreaChart = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.AreaChart })),
  { ssr: false }
);

export const Area = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.Area })),
  { ssr: false }
);

export const PieChart = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.PieChart })),
  { ssr: false }
);

export const Pie = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.Pie })),
  { ssr: false }
);

export const ResponsiveContainer = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.ResponsiveContainer })),
  { ssr: false }
);

export const XAxis = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.XAxis })),
  { ssr: false }
);

export const YAxis = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.YAxis })),
  { ssr: false }
);

export const Tooltip = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.Tooltip })),
  { ssr: false }
);

export const CartesianGrid = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.CartesianGrid })),
  { ssr: false }
);

export const Cell = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.Cell })),
  { ssr: false }
);

// Re-export the fallback for consumers that need it
export { ChartFallback, RechartsModule };
