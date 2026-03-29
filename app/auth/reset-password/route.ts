import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Supabase redirects here after the user clicks the password reset email link.
 * The URL contains a `code` query param that we exchange for a session,
 * then redirect to the client-side reset form at /(auth)/reset-password.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Session established — redirect to the reset form page
      return NextResponse.redirect(`${origin}/reset-password`);
    }
  }

  // If no code or exchange failed, redirect to forgot-password with error
  return NextResponse.redirect(`${origin}/forgot-password?error=invalid_link`);
}
