import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/db/client";
import { sendSimulatedSms } from "@/lib/simulation";

export async function GET() {
  return NextResponse.json({
    success: true,
    total: dbStore.smsLogs.length,
    data: dbStore.smsLogs,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { telephone, message, langue = "fr" } = body;

    if (!telephone || !message) {
      return NextResponse.json({ success: false, error: "telephone et message requis" }, { status: 400 });
    }

    const sms = sendSimulatedSms({ telephone, message, langue });
    dbStore.smsLogs.unshift(sms);

    return NextResponse.json({ success: true, data: sms }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
