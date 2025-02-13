import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import Organization from "@/models/Organization";

export async function POST(request: Request) {
  try {
    const { deviceId, name } = await request.json();

    await connectDB();

    // Update device status
    const organization = await Organization.findOneAndUpdate(
      { "devices.deviceId": deviceId },
      { 
        $set: { 
          "devices.$.status": "online",
          "devices.$.lastSeen": new Date(),
        }
      },
      { new: true }
    );

    if (!organization) {
      return NextResponse.json(
        { error: "Device not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Device connected successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to connect device" },
      { status: 500 }
    );
  }
}