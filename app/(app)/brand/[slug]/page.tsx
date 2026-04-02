import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Globe, Building2 } from "lucide-react";
import { BrandMapClient } from "./BrandMapClient";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: brand } = await (supabase
    .from("brewery_brands")
    .select("name, description")
    .eq("slug", slug)
    .single() as any);

  if (!brand) return { title: "Brand Not Found | HopTrack" };

  return {
    title: `${brand.name} | HopTrack`,
    description: brand.description || `Explore all ${brand.name} locations on HopTrack`,
    openGraph: {
      title: `${brand.name} | HopTrack`,
      description: brand.description || `Explore all ${brand.name} locations on HopTrack`,
    },
  };
}

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch brand
  const { data: brand } = await (supabase
    .from("brewery_brands")
    .select("*")
    .eq("slug", slug)
    .single() as any);

  if (!brand) notFound();

  // Fetch locations with basic stats
  const { data: locations } = await (supabase
    .from("breweries")
    .select("id, name, city, state, logo_url, cover_image_url, latitude, longitude, description")
    .eq("brand_id", brand.id)
    .order("name") as any);

  const locationCount = locations?.length ?? 0;
  const mappableLocations = (locations ?? []).filter((l: any) => l.latitude != null && l.longitude != null);

  return (
    <div className="min-h-screen pb-24" style={{ background: "var(--bg)" }}>
      {/* Brand Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ background: "linear-gradient(135deg, var(--accent-gold) 0%, transparent 60%)" }} />
        <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Logo */}
            {brand.logo_url ? (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden flex-shrink-0 relative border"
                style={{ borderColor: "var(--border)" }}>
                <Image src={brand.logo_url} alt={brand.name} fill className="object-cover" sizes="112px" />
              </div>
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)" }}>
                <Building2 size={40} style={{ color: "var(--accent-gold)" }} />
              </div>
            )}

            {/* Info */}
            <div className="text-center sm:text-left">
              <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                {brand.name}
              </h1>
              <div className="flex items-center justify-center sm:justify-start gap-3 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)", color: "var(--accent-gold)" }}>
                  <MapPin size={12} />
                  {locationCount} location{locationCount !== 1 ? "s" : ""}
                </span>
              </div>
              {brand.description && (
                <p className="text-sm max-w-md" style={{ color: "var(--text-secondary)" }}>
                  {brand.description}
                </p>
              )}
              {brand.website_url && (
                <a
                  href={brand.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm mt-3 transition-opacity hover:opacity-70"
                  style={{ color: "var(--accent-gold)" }}
                >
                  <Globe size={14} />
                  {brand.website_url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Location Map */}
      {mappableLocations.length > 0 && (
        <div className="max-w-3xl mx-auto px-4 mb-8">
          <h2 className="font-display text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
            Find a Location
          </h2>
          <BrandMapClient locations={locations ?? []} />
        </div>
      )}

      {/* Locations Grid */}
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="font-display text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
          Locations
        </h2>

        {locationCount === 0 ? (
          <div className="rounded-2xl border p-8 text-center" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <MapPin size={24} className="mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>No locations yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {(locations ?? []).map((loc: any) => (
              <Link
                key={loc.id}
                href={`/brewery/${loc.id}`}
                className="group rounded-2xl border overflow-hidden transition-all"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
              >
                {/* Cover */}
                <div className="h-32 relative overflow-hidden">
                  {loc.cover_image_url || loc.logo_url ? (
                    <Image
                      src={loc.cover_image_url || loc.logo_url}
                      alt={loc.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"
                      style={{ background: "color-mix(in srgb, var(--accent-gold) 10%, var(--surface-2))" }}>
                      <MapPin size={32} style={{ color: "var(--text-muted)" }} />
                    </div>
                  )}
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 50%)" }} />
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-display font-bold text-lg mb-1" style={{ color: "var(--text-primary)" }}>
                    {loc.name}
                  </h3>
                  <p className="text-sm flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                    <MapPin size={13} />
                    {loc.city}, {loc.state}
                  </p>
                  {loc.description && (
                    <p className="text-xs mt-2 line-clamp-2" style={{ color: "var(--text-secondary)" }}>
                      {loc.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: brand.name,
            description: brand.description || undefined,
            url: brand.website_url || undefined,
            logo: brand.logo_url || undefined,
            department: (locations ?? []).map((loc: any) => ({
              "@type": "Brewery",
              name: loc.name,
              address: {
                "@type": "PostalAddress",
                addressLocality: loc.city,
                addressRegion: loc.state,
              },
              ...(loc.latitude && loc.longitude ? {
                geo: {
                  "@type": "GeoCoordinates",
                  latitude: loc.latitude,
                  longitude: loc.longitude,
                },
              } : {}),
            })),
          }),
        }}
      />
    </div>
  );
}
