import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CodeEntry } from "@/components/brewery-admin/CodeEntry";

export const metadata = { title: "Confirm Code" };

export default async function PunchPage({
  params,
}: {
  params: Promise<{ brewery_id: string }>;
}) {
  const { brewery_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Verify the user has any role at this brewery
  const { data: account } = await supabase
    .from("brewery_accounts")
    .select("role")
    .eq("brewery_id", brewery_id)
    .eq("user_id", user.id)
    .single() as any;

  // Fallback: check direct ownership
  if (!account) {
    const { data: brewery } = await supabase
      .from("breweries")
      .select("owner_id")
      .eq("id", brewery_id)
      .single() as any;

    if (!brewery || brewery.owner_id !== user.id) {
      redirect("/login");
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-lg mx-auto pt-16 lg:pt-8">
      <div className="mb-6">
        <h1
          className="font-display text-2xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          Confirm Code
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Enter the customer's redemption code to confirm their reward.
        </p>
      </div>
      <CodeEntry breweryId={brewery_id} />
    </div>
  );
}
