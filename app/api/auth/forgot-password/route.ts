import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/sendMail";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();
        await connectDB();

        const user = await User.findOne({ email });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        // Generate a reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        user.resetToken = resetToken;
        user.resetTokenExpiry = Date.now() + 3600000; // 1-hour expiry
        await user.save();

        const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?token=${resetToken}`;
        await sendPasswordResetEmail(email, resetLink);

        return NextResponse.json({ message: "Reset link sent" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Error sending email" }, { status: 500 });
    }
}
