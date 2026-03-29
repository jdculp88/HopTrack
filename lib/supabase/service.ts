import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service role Supabase client — bypasses RLS.
 * SERVER-SIDE ONLY. Never import in client components or expose to the browser.
 * Uses SUPABASE_SERVICE_ROLE_KEY (not the anon key).
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars. " +
        "Service role client is only available server-side."
    );
  }

  return createSupabaseClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
