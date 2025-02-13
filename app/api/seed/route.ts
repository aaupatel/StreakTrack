import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Faculty from "@/models/Faculty";
import bcrypt from "bcryptjs";

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Seeding is not allowed in production" },
      { status: 403 }
    );
  }

  try {
    await connectDB();

    // Check if faculty already exists
    const existingFaculty = await Faculty.findOne({ email: "ayushpatidar2810@gmail.com" });
    if (existingFaculty) {
      return NextResponse.json(
        { message: "Test faculty already exists" },
        { status: 200 }
      );
    }

    // Create test faculty
    const hashedPassword = await bcrypt.hash("123456", 10);
    const faculty = await Faculty.create({
      name: "Ayush Patidar",
      email: "ayushpatidar2810@gmail.com",
      password: hashedPassword,
      emailVerified: true
    });

    return NextResponse.json(
      { message: "Test faculty created successfully", faculty },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create test faculty" },
      { status: 500 }
    );
  }
}