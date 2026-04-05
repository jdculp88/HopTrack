import { getCachedCommandCenterData } from "@/lib/cached-data";
import CommandCenterClient from "./CommandCenterClient";

export const metadata = { title: "Command Center" };

export default async function SuperadminCommandCenterPage() {
  const data = await getCachedCommandCenterData("30d");

  return <CommandCenterClient initialData={data} />;
}
