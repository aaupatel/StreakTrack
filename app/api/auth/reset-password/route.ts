import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import connectDB from "@/lib/mongodb";

export async function POST(req: Request) {
    try {
        const { password, token } = await req.json();
        await connectDB();

        const user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } });
        if (!user) return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });

        user.password = await bcrypt.hash(password, 10);
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        return NextResponse.json({ message: "Password reset successful" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Error resetting password" }, { status: 500 });
    }
}
