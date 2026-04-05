import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { MapPin, Globe, Building2 } from "lucide-react";
import { BrandLocationsClient } from "./BrandLocationsClient";
import { BrandLoyaltyStampCard } from "@/components/loyalty/BrandLoyaltyStampCard";
import { getCachedBrandPublicData, getCachedBrandMetadata } from "@/lib/cached-data";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getCachedBrandMetadata(slug);

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
  const { brand, locations, hasBrandLoyalty } = await getCachedBrandPublicData(slug);

  if (!brand) notFound();

  const locationCount = locations.length;

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

      {/* Brand Loyalty Passport */}
      {hasBrandLoyalty && (
        <div className="max-w-3xl mx-auto px-4 mb-8">
          <h2 className="font-display text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
            Loyalty Passport
          </h2>
          <BrandLoyaltyStampCard brandId={brand.id} brandName={brand.name} />
        </div>
      )}

      {/* Map + Locations (client component with geolocation) */}
      <BrandLocationsClient locations={locations ?? []} brandId={brand.id} />

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
