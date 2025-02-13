import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import crypto from "crypto";
import connectDB from "@/lib/mongodb";
import Organization from "@/models/Organization";
import { handleApiError, validateRequest } from "@/lib/error-handler";
import { deviceSchema } from "@/lib/validation-schemas";

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.organizationId || !['admin', 'co-admin'].includes(session.user.role!)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const validatedData = validateRequest(data, deviceSchema);

    await connectDB();

    // Check if organization has reached device limit
    const organization = await Organization.findById(session.user.organizationId);
    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    if (organization.devices.length >= organization.settings.maxDevices) {
      return NextResponse.json(
        { error: "Maximum device limit reached" },
        { status: 400 }
      );
    }

    // Check if device already exists
    const existingDevice = await Organization.findOne({
      _id: session.user.organizationId,
      'devices.deviceId': validatedData.deviceId
    });

    if (existingDevice) {
      return NextResponse.json(
        { error: "Device ID already exists" },
        { status: 400 }
      );
    }

    // Add new device
    const updatedOrg = await Organization.findByIdAndUpdate(
      session.user.organizationId,
      {
        $push: {
          devices: {
            ...validatedData,
            status: 'offline',
            lastSeen: new Date(),
            settings: {
              captureInterval: parseInt(process.env.HARDWARE_DEVICE_INTERVAL || "5000"),
              batchSize: parseInt(process.env.MAX_BATCH_SIZE || "50"),
              enabled: true
            }
          }
        }
      },
      { new: true }
    );

    return NextResponse.json({ 
      message: "Device added successfully",
      device: updatedOrg.devices[updatedOrg.devices.length - 1]
    });
  } catch (error) {
    const { error: errorMessage, status } = handleApiError(error);
    return NextResponse.json({ error: errorMessage }, { status });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const organization = await Organization.findById(session.user.organizationId);
    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    return NextResponse.json(organization.devices || []);
  } catch (error) {
    const { error: errorMessage, status } = handleApiError(error);
    return NextResponse.json({ error: errorMessage }, { status });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.organizationId || !['admin', 'co-admin'].includes(session.user.role!)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { deviceId, settings } = data;

    await connectDB();

    const organization = await Organization.findOneAndUpdate(
      {
        _id: session.user.organizationId,
        'devices.deviceId': deviceId
      },
      {
        $set: {
          'devices.$.settings': settings
        }
      },
      { new: true }
    );

    if (!organization) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    const updatedDevice = organization.devices.find(d => d.deviceId === deviceId);
    return NextResponse.json(updatedDevice);
  } catch (error) {
    const { error: errorMessage, status } = handleApiError(error);
    return NextResponse.json({ error: errorMessage }, { status });
  }
}