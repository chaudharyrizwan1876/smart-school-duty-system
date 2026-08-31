import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import DutyAssignment from "@/models/DutyAssignment";
import { scheduleTodaysDuties } from "@/lib/scheduler";

// body: { assignments: [{ date, dutyType, teachers: [] }, ...] }
export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  const assignments = body.assignments;

  if (!Array.isArray(assignments) || assignments.length === 0) {
    return NextResponse.json({ error: "assignments array is required" }, { status: 400 });
  }

  const docs: any[] = assignments
    .filter((a: any) => a.date && a.dutyType && Array.isArray(a.teachers) && a.teachers.length > 0)
    .map((a: any) => ({
      date: new Date(a.date),
      dutyType: a.dutyType,
      teachers: a.teachers,
    }));

  const created = await DutyAssignment.insertMany(docs);

  scheduleTodaysDuties().catch((err) => console.error("Reschedule failed:", err));

  return NextResponse.json({ count: created.length, assignments: created }, { status: 201 });
}
