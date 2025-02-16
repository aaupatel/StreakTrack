import { NextResponse } from "next/server";
import User from "@/models/User";
import connectDB from "@/lib/mongodb";

export async function POST(req: Request) {
    try {
        const { password, token } = await req.json();
        await connectDB();

        const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
        if (!user) return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });

        user.password = password;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        return NextResponse.json({ message: "Password reset successful" }, { status: 200 });
    } catch (error) {
        console.error("Error resetting password:", error);
        return NextResponse.json({ error: "Error resetting password" }, { status: 500 });
    }
}
