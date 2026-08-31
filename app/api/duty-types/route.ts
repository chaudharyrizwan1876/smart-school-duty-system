import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import DutyType from "@/models/DutyType";

export async function GET() {
  await connectDB();
  const dutyTypes = await DutyType.find().sort({ startTime: 1 });
  return NextResponse.json(dutyTypes);
}

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  if (!body.name || !body.location || !body.startTime) {
    return NextResponse.json({ error: "Name, location and startTime are required" }, { status: 400 });
  }
  const dutyType = await DutyType.create({
    name: body.name,
    location: body.location,
    startTime: body.startTime,
  });
  return NextResponse.json(dutyType, { status: 201 });
}
