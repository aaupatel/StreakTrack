import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import User from "@/models/User";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";
import connectDB from "@/lib/mongodb";

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const name = formData.get("name") as string | null;
    const contactNo = formData.get("contactNo") as string | null;
    const base64Image = formData.get("image") as string | null;

    const updatePayload: any = {};

    if (name && name !== user.name) {
      updatePayload.name = name;
    }

    if (contactNo && contactNo !== user.contactNo) {
      updatePayload.contactNo = contactNo;
    }

    if (name) user.name = name;
    if (contactNo) user.contactNo = contactNo;

    if (base64Image) {
      if (user.image) {
        await deleteFromCloudinary(user.image);
      }
      const imageUrls = await uploadToCloudinary([base64Image]);
      updatePayload.image = imageUrls[0];
      user.profileImage = imageUrls[0];
    }

    if (Object.keys(updatePayload).length > 0) {
      await User.updateOne({ _id: user._id }, { $set: updatePayload });
    }

    await user.save();

    return NextResponse.json({ ...user.toObject(), ...updatePayload });
  } catch (err: any) {
    console.error("Profile update error:", err);
    return NextResponse.json({ message: "Server error", error: err.message }, { status: 500 });
  }
}