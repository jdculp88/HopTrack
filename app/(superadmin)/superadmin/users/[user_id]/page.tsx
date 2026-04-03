import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { redirect, notFound } from "next/navigation";
import { fetchUserDetail } from "@/lib/superadmin-user";
import { UserDetailClient } from "./UserDetailClient";

export async function generateMetadata({ params }: { params: Promise<{ user_id: string }> }) {
  const { user_id } = await params;
  const service = createServiceClient();
  const { data } = await service.from("profiles").select("display_name, username").eq("id", user_id).single() as any;
  return { title: `${data?.display_name ?? data?.username ?? "User"} — Superadmin` };
}

export default async function UserDetailPage({ params }: { params: Promise<{ user_id: string }> }) {
  const { user_id } = await params;

  // Auth check (layout already does this, but defense in depth)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_superadmin")
    .eq("id", user.id)
    .single() as any;

  if (!profile?.is_superadmin) redirect("/home");

  const service = createServiceClient();
  const data = await fetchUserDetail(service, user_id);

  if (!data) notFound();

  return <UserDetailClient data={data} />;
}
