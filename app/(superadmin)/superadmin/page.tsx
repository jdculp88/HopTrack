import { createServiceClient } from "@/lib/supabase/service";
import { calculateCommandCenterMetrics } from "@/lib/superadmin-metrics";
import CommandCenterClient from "./CommandCenterClient";

export const metadata = { title: "Command Center" };
export const revalidate = 30;

export default async function SuperadminCommandCenterPage() {
  const service = createServiceClient();
  const data = await calculateCommandCenterMetrics(service, "30d");

  return <CommandCenterClient initialData={data} />;
}
