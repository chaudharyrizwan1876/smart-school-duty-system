import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import RecurringDuty from "@/models/RecurringDuty";
import { scheduleTodaysDuties } from "@/lib/scheduler";

export async function GET() {
  await connectDB();
  const recurring = await RecurringDuty.find()
    .populate("dutyType")
    .populate("teachers")
    .sort({ dayOfWeek: 1 });
  return NextResponse.json(recurring);
}

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  if (
    body.dayOfWeek === undefined ||
    body.dayOfWeek === null ||
    !body.dutyType ||
    !Array.isArray(body.teachers) ||
    body.teachers.length === 0
  ) {
    return NextResponse.json(
      { error: "dayOfWeek, dutyType and at least one teacher are required" },
      { status: 400 }
    );
  }

  const recurring = await RecurringDuty.create({
    dayOfWeek: body.dayOfWeek,
    dutyType: body.dutyType,
    teachers: body.teachers,
  });

  scheduleTodaysDuties().catch((err) => console.error("Reschedule failed:", err));

  const populated = await RecurringDuty.findById(recurring._id).populate("dutyType").populate("teachers");
  return NextResponse.json(populated, { status: 201 });
}
