// Copyright 2026 HopTrack. All rights reserved.
// GET /api/superadmin/waitlist/export — Sprint 174 (The Coming Soon)
//
// Streams a CSV download of every waitlist signup. Layouts do NOT guard API
// routes, so we re-check superadmin status here before reading the locked
// table via service-role client.

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { apiUnauthorized, apiForbidden } from "@/lib/api-response";

export async function GET() {
  // Auth guard
  const auth = await createClient();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) return apiUnauthorized();

  const { data: profile } = (await auth
    .from("profiles")
    .select("is_superadmin")
    .eq("id", user.id)
    .single()) as { data: { is_superadmin?: boolean } | null };
  if (!profile?.is_superadmin) return apiForbidden();

  // Read locked table via service role
  const svc = createServiceClient();
  const { data: rows, error } = await svc
    .from("waitlist")
    .select(
      "name, email, city, state, audience_type, brewery_name, created_at"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return new Response("Failed to export waitlist", { status: 500 });
  }

  const header = [
    "Name",
    "Email",
    "City",
    "State",
    "Audience",
    "Brewery Name",
    "Signed Up At",
  ].join(",");

  const lines = ((rows ?? []) as Array<{
    name: string;
    email: string;
    city: string;
    state: string;
    audience_type: string;
    brewery_name: string | null;
    created_at: string;
  }>).map((r) =>
    [
      csvEscape(r.name),
      csvEscape(r.email),
      csvEscape(r.city),
      csvEscape(r.state),
      csvEscape(r.audience_type),
      csvEscape(r.brewery_name ?? ""),
      r.created_at,
    ].join(",")
  );

  const csv = [header, ...lines].join("\n");
  const date = new Date().toISOString().split("T")[0];

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="hoptrack-waitlist-${date}.csv"`,
    },
  });
}

function csvEscape(val: string): string {
  if (!val) return "";
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}
