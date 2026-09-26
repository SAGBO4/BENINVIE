import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { PortfolioData } from "@/lib/portfolio-data";
import { getPortfolioData, updatePortfolioData } from "@/lib/portfolio-store";
import { isSupabaseConfigured, SUPABASE_SQL_SCHEMA } from "@/lib/supabase";

export async function GET(): Promise<NextResponse> {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getPortfolioData();
  return NextResponse.json({
    data,
    supabaseConfigured: isSupabaseConfigured(),
    sqlSchema: SUPABASE_SQL_SCHEMA,
  });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid payload format" },
        { status: 400 }
      );
    }

    const res = await updatePortfolioData(body as PortfolioData);
    if (!res.success) {
      return NextResponse.json(
        { success: false, error: res.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Portfolio updated successfully",
      supabaseConfigured: isSupabaseConfigured(),
    });
  } catch (err) {
    console.error("Data update error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
