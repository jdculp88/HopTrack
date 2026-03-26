import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LandingContent from "@/components/landing/LandingContent";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/home");
  return <LandingContent />;
}
