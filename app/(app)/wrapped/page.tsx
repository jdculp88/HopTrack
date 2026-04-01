import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { WrappedClient } from "./WrappedClient";

export const metadata = {
  title: "Your Wrapped | HopTrack",
  description: "Your year in beer — stats, favorites, and personality.",
};

export default async function WrappedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single() as any;

  return <WrappedClient username={profile?.username ?? "beer-lover"} />;
}
