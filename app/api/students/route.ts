import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Student from "@/models/Student";

export async function POST(request: Request) {
  try {
    await connectDB();
    const data = await request.json();
    
    const student = await Student.create(data);
    
    // Add student ID to the organization
    // await Organization.findByIdAndUpdate(
    //   organizationId,
    //   { $push: { studentIds: student._id } },
    //   { new: true }
    // );

    return NextResponse.json(student, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create student" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    const students = await Student.find({}).sort({ createdAt: -1 });
    return NextResponse.json(students);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch students" },
      { status: 500 }
    );
  }
}