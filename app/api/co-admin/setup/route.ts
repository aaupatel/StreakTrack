import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    const { token, password, contactNo, name } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired invitation token" },
        { status: 400 }
      );
    }

    user.password = password;
    user.contactNo = contactNo;
    user.name = name;
    user.emailVerified = true;
    user.verificationToken = undefined;
    await user.save();

    return NextResponse.json({ message: "Account setup successful" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Account setup failed" },
      { status: 500 }
    );
  }
}