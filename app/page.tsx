import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import LandingContent from "@/components/landing/LandingContent";
import ComingSoonContent from "@/components/landing/ComingSoonContent";

const isComingSoonMode = () => process.env.COMING_SOON_MODE === "true";

export async function generateMetadata(): Promise<Metadata> {
  if (!isComingSoonMode()) return {};
  return {
    title: "HopTrack — Coming Soon",
    description:
      "The social brewery and beer tracking app, launching soon. Join the waitlist and we'll let you know the moment HopTrack lands in your city.",
    openGraph: {
      title: "HopTrack — Coming Soon",
      description: "Track every pour. Join the waitlist.",
    },
  };
}

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/home");

  if (isComingSoonMode()) return <ComingSoonContent />;
  return <LandingContent />;
}
