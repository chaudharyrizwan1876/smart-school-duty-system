import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import DutyType from "@/models/DutyType";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const body = await req.json();
  const dutyType = await DutyType.findByIdAndUpdate(
    params.id,
    {
      name: body.name,
      location: body.location,
      startTime: body.startTime,
    },
    { new: true }
  );
  if (!dutyType) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(dutyType);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  await DutyType.findByIdAndDelete(params.id);
  return NextResponse.json({ success: true });
}
