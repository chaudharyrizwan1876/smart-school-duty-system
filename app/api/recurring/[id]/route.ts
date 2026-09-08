import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import RecurringDuty from "@/models/RecurringDuty";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const body = await req.json();
  const recurring = await RecurringDuty.findByIdAndUpdate(
    params.id,
    {
      dayOfWeek: body.dayOfWeek,
      dutyType: body.dutyType,
      teachers: body.teachers,
      active: body.active,
    },
    { new: true }
  )
    .populate("dutyType")
    .populate("teachers");
  if (!recurring) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(recurring);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  await RecurringDuty.findByIdAndDelete(params.id);
  return NextResponse.json({ success: true });
}
