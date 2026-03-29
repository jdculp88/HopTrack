import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get("username");

  if (!username || username.length < 3) {
    return NextResponse.json(
      { available: false, error: "Username must be at least 3 characters." },
      { status: 400 }
    );
  }

  if (!/^[a-z0-9_]+$/i.test(username)) {
    return NextResponse.json(
      { available: false, error: "Username can only contain letters, numbers, and underscores." },
      { status: 400 }
    );
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .ilike("username", username)
      .limit(1);

    if (error) {
      return NextResponse.json(
        { available: false, error: "Failed to check username." },
        { status: 500 }
      );
    }

    return NextResponse.json({ available: !data || data.length === 0 });
  } catch {
    return NextResponse.json(
      { available: false, error: "Failed to check username." },
      { status: 500 }
    );
  }
}
