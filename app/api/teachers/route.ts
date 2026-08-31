import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Teacher from "@/models/Teacher";

export async function GET() {
  await connectDB();
  const teachers = await Teacher.find().sort({ name: 1 });
  return NextResponse.json(teachers);
}

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  if (!body.name || !body.phone) {
    return NextResponse.json({ error: "Name and phone are required" }, { status: 400 });
  }
  const teacher = await Teacher.create({
    name: body.name,
    phone: body.phone,
    subject: body.subject || "",
    active: body.active !== undefined ? body.active : true,
  });
  return NextResponse.json(teacher, { status: 201 });
}
