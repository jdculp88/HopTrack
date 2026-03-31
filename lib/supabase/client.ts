import { createBrowserClient } from "@supabase/ssr";
// Database type exists at @/types/database but Supabase's .select() inference
// doesn't handle partial columns or complex joins. Omitting generic for now.

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
