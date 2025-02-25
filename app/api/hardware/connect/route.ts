import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Organization from "@/models/Organization";
import Device from "@/models/Device";

export async function POST(req: Request) {
  try {
    const { organizationId, deviceId } = await req.json();
    console.log("Hardware Connection Request:");
    console.log("Organization ID:", organizationId);
    console.log("Device ID:", deviceId);

    await connectDB();
    console.log("Database connected successfully");

    // Update device's lastSeen
    const device = await Device.findOneAndUpdate(
      { _id: deviceId }, // Use deviceId to find the Device document
      { lastSeen: new Date(), status: 'online' }, // Update lastSeen and status
      { new: true }
    );

    if (!device) {
      return NextResponse.json({ message: "Device not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Device connected" }, { status: 200 });
  } catch (error) {
    console.error("Error connecting device:", error);
    return NextResponse.json({ message: "Error connecting device" }, { status: 500 });
  }
}