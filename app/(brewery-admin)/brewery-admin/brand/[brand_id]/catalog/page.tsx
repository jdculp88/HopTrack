import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Building2, ArrowLeft, List, Settings } from "lucide-react";
import { BrandCatalogClient } from "./BrandCatalogClient";

export const revalidate = 30;

export async function generateMetadata({ params }: { params: Promise<{ brand_id: string }> }) {
  const { brand_id } = await params;
  const supabase = await createClient();
  const { data } = await (supabase
    .from("brewery_brands")
    .select("name")
    .eq("id", brand_id)
    .single() as any);
  return { title: `${data?.name ?? "Brand"} Catalog — HopTrack` };
}

export default async function BrandCatalogPage({ params }: { params: Promise<{ brand_id: string }> }) {
  const { brand_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await (supabase
    .from("brand_accounts")
    .select("role")
    .eq("brand_id", brand_id)
    .eq("user_id", user.id)
    .maybeSingle() as any);

  if (!membership) redirect("/brewery-admin");

  const { data: brand } = await (supabase
    .from("brewery_brands")
    .select("*")
    .eq("id", brand_id)
    .single() as any);

  if (!brand) notFound();

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Brand Header */}
      <div className="border-b" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-6 flex items-center gap-4">
          {brand.logo_url ? (
            <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 relative border" style={{ borderColor: "var(--border)" }}>
              <Image src={brand.logo_url} alt={brand.name} fill className="object-cover" sizes="56px" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)" }}>
              <Building2 size={24} style={{ color: "var(--accent-gold)" }} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-2xl font-bold truncate" style={{ color: "var(--text-primary)" }}>
              {brand.name} — Beer Catalog
            </h1>
            <div className="flex items-center gap-3 mt-0.5">
              <Link
                href={`/brewery-admin/brand/${brand_id}/dashboard`}
                className="text-xs flex items-center gap-1 hover:opacity-70 transition-opacity"
                style={{ color: "var(--accent-gold)" }}
              >
                <ArrowLeft size={11} /> Dashboard
              </Link>
              <Link
                href={`/brewery-admin/brand/${brand_id}/tap-list`}
                className="text-xs flex items-center gap-1 hover:opacity-70 transition-opacity"
                style={{ color: "var(--text-muted)" }}
              >
                <List size={11} /> Tap List
              </Link>
              <Link
                href={`/brewery-admin/brand/${brand_id}/settings`}
                className="text-xs flex items-center gap-1 hover:opacity-70 transition-opacity"
                style={{ color: "var(--text-muted)" }}
              >
                <Settings size={11} /> Settings
              </Link>
            </div>
          </div>
        </div>
      </div>

      <BrandCatalogClient brandId={brand_id} />
    </div>
  );
}
