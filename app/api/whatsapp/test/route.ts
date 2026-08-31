import { NextRequest, NextResponse } from "next/server";
import { sendWhatsAppMessage, getWhatsAppStatus } from "@/lib/whatsapp";

// Quick manual test: POST { "phone": "923001234567", "message": "hello" }
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { phone, message } = body;

  if (!phone) {
    return NextResponse.json({ error: "phone is required" }, { status: 400 });
  }

  const status = getWhatsAppStatus();
  if (status.status !== "connected") {
    return NextResponse.json({ error: `WhatsApp not connected (status: ${status.status})` }, { status: 400 });
  }

  try {
    await sendWhatsAppMessage(phone, message || "Test message from School Duty System");
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
