import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Organization from "@/models/Organization";
import { sendVerificationEmail } from "@/lib/sendMail";

export async function POST(request: Request) {
  try {
    const { name, email, password, organizationName, organizationType } = await request.json();

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Check if organization name is taken
    const existingOrg = await Organization.findOne({ name: organizationName });
    if (existingOrg) {
      return NextResponse.json(
        { error: "Organization name already taken" },
        { status: 400 }
      );
    }

    // Generate verification token and API key
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const apiKey = crypto.randomBytes(32).toString('hex');
    
    // Create user first
    const user = await User.create({
      name,
      email,
      password, // it is hashed in user model
      organizationName,
      role: 'admin',
      // organizationId: organization._id,
      verificationToken,
    });

    // Now create organization with admin set
    const organization = await Organization.create({
      name: organizationName,
      type: organizationType,
      admin: user._id,  // Assign the admin immediately
      apiKey,
    });

    // Update user with the organization ID
    user.organizationId = organization._id;
    await user.save();

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    return NextResponse.json(
      { message: "Registration successful. Please check your email to verify your account." },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error.message || "Registration failed" },
      { status: 500 }
    );
  }
}