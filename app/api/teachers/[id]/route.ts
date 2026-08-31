import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Teacher from "@/models/Teacher";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const body = await req.json();
  const teacher = await Teacher.findByIdAndUpdate(
    params.id,
    {
      name: body.name,
      phone: body.phone,
      subject: body.subject,
      active: body.active,
    },
    { new: true }
  );
  if (!teacher) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(teacher);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  await Teacher.findByIdAndDelete(params.id);
  return NextResponse.json({ success: true });
}
