import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://hoptrack.beer";

  // Static public pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/for-breweries`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/help`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Dynamic brewery pages — public, max 50 entries
  let breweryRoutes: MetadataRoute.Sitemap = [];
  try {
    const supabase = await createClient();
    const { data: breweries } = await supabase
      .from("breweries")
      .select("id, updated_at")
      .eq("is_claimed", true)
      .order("updated_at", { ascending: false })
      .limit(43); // 43 + 7 static = 50 total

    if (breweries) {
      breweryRoutes = breweries.map((brewery) => ({
        url: `${baseUrl}/brewery/${brewery.id}`,
        lastModified: brewery.updated_at ? new Date(brewery.updated_at) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
    }
  } catch {
    // Non-fatal — sitemap works without brewery routes
  }

  return [...staticRoutes, ...breweryRoutes];
}
