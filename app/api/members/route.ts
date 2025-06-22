import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import Member from "@/models/Member";
import { authOptions } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId || !['admin', 'co-admin'].includes(session.user.role!)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { images, ...memberData } = data;

    if (!images || images.length !== 3) {
      return NextResponse.json(
        { error: "Exactly 3 images are required for student registration." },
        { status: 400 }
      );
    }

    await connectDB();

    // Upload images to Cloudinary
    const imageUrls: string[] = await uploadToCloudinary(images);

    const member = await Member.create({
      ...memberData,
      images: imageUrls,
      organizationId: session.user.organizationId,
    });

    return NextResponse.json(member, { status: 201 });
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
    const members = await Member.find({ organizationId: session.user.organizationId }).sort({ createdAt: -1 });
    return NextResponse.json(members);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch students" },
      { status: 500 }
    );
  }
}