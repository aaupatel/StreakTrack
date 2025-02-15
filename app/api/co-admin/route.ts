import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import User from "@/models/User";
import Organization from "@/models/Organization";


export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        await connectDB();

        if (session.user.role !== "admin") {
            return NextResponse.json({ error: "Access Denied" }, { status: 403 });
        }

        const coAdmins = await User.find({
            organizationId: session.user.organizationId,
            role: "co-admin",
        }).select("name email contactNo emailVerified");

        return NextResponse.json(coAdmins, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Failed to fetch students" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        await connectDB();

        if (session.user.role !== "admin") {
            return NextResponse.json({ error: "Access Denied" }, { status: 403 });
        }

        const { coAdminId } = await request.json();

        if (!coAdminId) {
            return NextResponse.json({ error: "Co-Admin ID is required" }, { status: 400 });
        }

        const coAdmin = await User.findOne({
            _id: coAdminId,
            organizationId: session.user.organizationId,
            role: "co-admin",
        });

        if (!coAdmin) {
            return NextResponse.json({ error: "Co-Admin not found" }, { status: 404 });
        }

        // Remove the co-admin from the organization's coAdmins array
        await Organization.updateOne(
            { _id: session.user.organizationId },
            { $pull: { coAdmins: coAdminId } }
        );

        await User.findByIdAndDelete(coAdminId);

        return NextResponse.json({ message: "Co-Admin deleted successfully" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Failed to delete co-admin" },
            { status: 500 }
        );
    }
}
