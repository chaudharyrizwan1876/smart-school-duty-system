import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Teacher from "@/models/Teacher";
import DutyType from "@/models/DutyType";
import DutyAssignment from "@/models/DutyAssignment";
import NotificationLog from "@/models/NotificationLog";
import { getWhatsAppStatus } from "@/lib/whatsapp";

export async function GET() {
  await connectDB();

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const startOfMonth = new Date(startOfDay.getFullYear(), startOfDay.getMonth(), 1);
  const endOfMonth = new Date(startOfDay.getFullYear(), startOfDay.getMonth() + 1, 0, 23, 59, 59, 999);

  const [totalTeachers, dutiesThisMonth, todaysDuties, notificationsSentToday] = await Promise.all([
    Teacher.countDocuments({ active: true }),
    DutyAssignment.countDocuments({ date: { $gte: startOfMonth, $lte: endOfMonth } }),
    DutyAssignment.find({ date: { $gte: startOfDay, $lte: endOfDay } })
      .populate("dutyType")
      .populate("teachers")
      .sort({ "dutyType.startTime": 1 }),
    NotificationLog.countDocuments({ sentAt: { $gte: startOfDay, $lte: endOfDay }, status: "sent" }),
  ]);

  const whatsapp = getWhatsAppStatus();

  return NextResponse.json({
    whatsapp,
    stats: {
      totalTeachers,
      dutiesThisMonth,
      notificationsSentToday,
    },
    todaysDuties,
  });
}
