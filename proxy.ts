// Copyright 2026 HopTrack. All rights reserved.
import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const COMING_SOON_ALLOWED_PATHS = new Set<string>([
  "/",
  "/privacy",
  "/terms",
  "/dmca",
  "/api/waitlist/subscribe",
  "/api/health",
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.webmanifest",
  "/manifest.json",
]);

const COMING_SOON_ALLOWED_PREFIXES = ["/og/", "/icon", "/apple-icon"];

export function isAllowedDuringComingSoon(pathname: string): boolean {
  if (COMING_SOON_ALLOWED_PATHS.has(pathname)) return true;
  return COMING_SOON_ALLOWED_PREFIXES.some((p) => pathname.startsWith(p));
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (
    process.env.COMING_SOON_MODE === "true" &&
    !isAllowedDuringComingSoon(pathname)
  ) {
    if (pathname.startsWith("/api/")) {
      return new NextResponse(null, { status: 404 });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  const response = await updateSession(request);
  response.headers.set("x-pathname", pathname);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
