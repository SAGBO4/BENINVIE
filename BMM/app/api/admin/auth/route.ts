import { NextRequest, NextResponse } from "next/server";
import {
  clearAdminSession,
  isAuthenticated,
  setAdminSession,
  verifyPassword,
} from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";

export async function GET(): Promise<NextResponse> {
  const authenticated = await isAuthenticated();
  return NextResponse.json({
    authenticated,
    supabaseConfigured: isSupabaseConfigured(),
  });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { action, password } = body;

    if (action === "logout") {
      await clearAdminSession();
      return NextResponse.json({ success: true, message: "Logged out" });
    }

    if (action === "login") {
      if (typeof password !== "string" || !password.trim()) {
        return NextResponse.json(
          { success: false, error: "Password is required" },
          { status: 400 }
        );
      }

      const isValid = await verifyPassword(password.trim());
      if (!isValid) {
        return NextResponse.json(
          { success: false, error: "Incorrect password" },
          { status: 401 }
        );
      }

      await setAdminSession();
      return NextResponse.json({
        success: true,
        message: "Authentication successful",
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (err) {
    console.error("Auth API error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
