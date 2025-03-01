import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import Student from "@/models/Student";
import { authOptions } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.organizationId || !session?.user?.id || (session.user.role !== 'admin' && session.user.role !== 'co-admin')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { images, ...studentData } = data;

    if (!images || images.length !== 3) {
      return NextResponse.json(
        { error: "Exactly 3 images are required for student registration." },
        { status: 400 }
      );
    }

    await connectDB();

    // Upload images to Cloudinary
    const imageUrls: string[] = await uploadToCloudinary(images);

    const student = await Student.create({
      ...studentData,
      images: imageUrls,
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