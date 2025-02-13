import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import crypto from "crypto";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Organization from "@/models/Organization";
import { sendCoAdminInvite } from "@/lib/sendMail";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId || session.user.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, name } = await request.json();

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Generate invite token
    const inviteToken = crypto.randomBytes(32).toString('hex');

    // Create user with temporary data
    const user = await User.create({
      email,
      name,
      password: inviteToken, // Temporary password, will be set by co-admin
      role: 'co-admin',
      organizationId: session.user.organizationId,
      organizationName: session.user.organizationName,
      verificationToken: inviteToken,
    });

    // Add co-admin to organization
    await Organization.findByIdAndUpdate(
      session.user.organizationId,
      { $push: { coAdmins: user._id } }
    );

    // Send invitation email
    await sendCoAdminInvite(email, inviteToken, session.user.organizationName!);

    return NextResponse.json(
      { message: "Co-admin invitation sent successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to send invitation" },
      { status: 500 }
    );
  }
}