import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import Student from "@/models/Student";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.organizationId || !session?.user?.id || (session.user.role !== 'admin' && session.user.role !== 'co-admin')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { images, ...studentData } = data;

    await connectDB();

    const student = await Student.create({
      ...studentData,
      images,
      organizationId: session.user.organizationId,
    });

    return NextResponse.json(student, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create student" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const students = await Student.find({ organizationId: session.user.organizationId }).sort({ createdAt: -1 });
    return NextResponse.json(students);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch students" },
      { status: 500 }
    );
  }
}