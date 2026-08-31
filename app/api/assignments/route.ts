import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import DutyAssignment from "@/models/DutyAssignment";
import Teacher from "@/models/Teacher";
import DutyType from "@/models/DutyType";
import { scheduleTodaysDuties } from "@/lib/scheduler";

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  let filter: any = {};
  if (month && year) {
    const start = new Date(Number(year), Number(month) - 1, 1);
    const end = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);
    filter.date = { $gte: start, $lte: end };
  }

  const assignments = await DutyAssignment.find(filter)
    .populate("dutyType")
    .populate("teachers")
    .sort({ date: 1 });

  return NextResponse.json(assignments);
}

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  if (!body.date || !body.dutyType || !Array.isArray(body.teachers) || body.teachers.length === 0) {
    return NextResponse.json(
      { error: "date, dutyType and at least one teacher are required" },
      { status: 400 }
    );
  }

  const assignment = await DutyAssignment.create({
    date: new Date(body.date),
    dutyType: body.dutyType,
    teachers: body.teachers,
  });

  scheduleTodaysDuties().catch((err) => console.error("Reschedule failed:", err));

  const populated = await DutyAssignment.findById(assignment._id)
    .populate("dutyType")
    .populate("teachers");

  return NextResponse.json(populated, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  await DutyAssignment.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
