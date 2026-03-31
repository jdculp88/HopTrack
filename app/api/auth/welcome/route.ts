import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { onUserSignUp } from "@/lib/email-triggers";

// Fire-and-forget welcome email after sign-up
export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fire welcome email (non-blocking)
    onUserSignUp(user.id).catch((err) =>
      console.error("[auth/welcome] Email trigger failed:", err)
    );

    return NextResponse.json({ sent: true });
  } catch (err: any) {
    console.error("[auth/welcome]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
