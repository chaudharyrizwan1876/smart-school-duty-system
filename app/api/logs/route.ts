import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import NotificationLog from "@/models/NotificationLog";
import Teacher from "@/models/Teacher";
import DutyType from "@/models/DutyType";

export async function GET() {
  await connectDB();
  const logs = await NotificationLog.find()
    .populate("teacher")
    .populate("dutyType")
    .sort({ sentAt: -1 })
    .limit(500);
  return NextResponse.json(logs);
}
