import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/for-breweries",
          "/privacy",
          "/terms",
          "/dmca",
          "/help",
          "/login",
          "/signup",
          "/brewery/",
          "/brewery-welcome/",
          "/session/",
        ],
        disallow: [
          "/api/",
          "/brewery-admin/",
          "/superadmin/",
          "/settings",
          "/notifications",
          "/friends",
          "/profile/",
          "/explore",
          "/beer-lists",
          "/pint-rewind",
          "/forgot-password",
          "/reset-password",
        ],
      },
    ],
    sitemap: "https://hoptrack.beer/sitemap.xml",
    host: "https://hoptrack.beer",
  };
}
