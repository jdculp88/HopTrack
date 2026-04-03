import { createClient } from "@/lib/supabase/server";
import { fetchPlatformStats } from "@/lib/superadmin-stats";
import StatsClient from "./StatsClient";

export const metadata = { title: "Platform Stats" };

export default async function PlatformStatsPage() {
  const supabase = await createClient();
  const data = await fetchPlatformStats(supabase);
  return <StatsClient initialData={data} />;
}
