import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PintRewindCards } from "./PintRewindCards";
import { fetchPintRewindData } from "@/lib/pint-rewind";

export const metadata = { title: "Your Pint Rewind — HopTrack" };

export default async function PintRewindPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const data = await fetchPintRewindData(supabase, user.id);

  return <PintRewindCards initialData={data} />;
}
