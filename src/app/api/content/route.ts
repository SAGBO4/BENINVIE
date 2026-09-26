import { NextResponse } from "next/server";
import { getPortfolioData } from "@/lib/portfolio-store";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  const data = await getPortfolioData();
  return NextResponse.json(data);
}
