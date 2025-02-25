import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import crypto from "crypto";
import connectDB from "@/lib/mongodb";
import Organization from "@/models/Organization";
import { handleApiError, validateRequest } from "@/lib/error-handler";
import { deviceSchema } from "@/lib/validation-schemas";
import { authOptions } from "@/lib/auth";
import Device from "@/models/Device";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId || !['admin', 'co-admin'].includes(session.user.role!)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, location } = await request.json();

    await connectDB();

    // Check if device with the same name already exists in the organization
    const existingDevice = await Device.findOne({ name, organizationId: session.user.organizationId });
    if (existingDevice) {
      return NextResponse.json(
        { message: "Device with this name already exists in your organization" },
        { status: 400 }
      );
    }
    
    // Create new device
    const newDevice = await Device.create({
      name,
      organizationId: session.user.organizationId,
      location,
    });

    // Update organization to add the new device ID
    await Organization.findByIdAndUpdate(
      session.user.organizationId,
      { $push: { devices: newDevice._id } },
      { new: true }
    );

    return NextResponse.json(
      { message: "Device added successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to add device" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const organization = await Organization.findById(session.user.organizationId);

    const devices = await Device.find().populate("organizationId");

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    return NextResponse.json(devices || []);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch devices" },
      { status: 500 }
    );
  }
}

// export async function PATCH(request: Request) {
//   try {
//     const session = await getServerSession();
//     if (!session?.user?.organizationId || !['admin', 'co-admin'].includes(session.user.role!)) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const data = await request.json();
//     const { deviceId, settings } = data;

//     await connectDB();

//     const organization = await Organization.findOneAndUpdate(
//       {
//         _id: session.user.organizationId,
//         'devices.deviceId': deviceId
//       },
//       {
//         $set: {
//           'devices.$.settings': settings
//         }
//       },
//       { new: true }
//     );

//     if (!organization) {
//       return NextResponse.json({ error: "Device not found" }, { status: 404 });
//     }

//     const updatedDevice = organization.devices.find(d => d.deviceId === deviceId);
//     return NextResponse.json(updatedDevice);
//   } catch (error: any) {
//     return NextResponse.json(
//       { error: error.message || "Failed to add device" },
//       { status: 500 }
//     );
//   }
// }