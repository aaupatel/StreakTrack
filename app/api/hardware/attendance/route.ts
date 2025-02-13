import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Organization from "@/models/Organization";
import Attendance from "@/models/Attendance";
import Member from "@/models/Member";
import { handleApiError } from "@/lib/error-handler";

interface HardwareAttendanceRecord {
  memberId: string;
  timestamp: string;
  deviceId: string;
}

export async function POST(request: Request) {
  try {
    // Verify hardware API key
    const apiKey = request.headers.get("x-api-key");
    const deviceId = request.headers.get("x-device-id");

    if (!apiKey || !deviceId) {
      return NextResponse.json(
        { error: "Missing API key or device ID" },
        { status: 401 }
      );
    }

    await connectDB();

    // Find organization by API key and device
    const organization = await Organization.findOne({
      apiKey,
      'devices.deviceId': deviceId
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Invalid API key or device not found" },
        { status: 401 }
      );
    }

    // Update device status
    await Organization.updateOne(
      { _id: organization._id, 'devices.deviceId': deviceId },
      {
        $set: {
          'devices.$.status': 'online',
          'devices.$.lastSeen': new Date()
        }
      }
    );

    const data = await request.json();
    const records: HardwareAttendanceRecord[] = data.records;

    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        { error: "Invalid attendance records" },
        { status: 400 }
      );
    }

    // Process records in batches
    const maxBatchSize = parseInt(process.env.MAX_BATCH_SIZE || "50");
    const results = [];

    for (let i = 0; i < records.length; i += maxBatchSize) {
      const batch = records.slice(i, i + maxBatchSize);
      const batchResults = await processBatch(batch, organization._id);
      results.push(...batchResults);
    }

    return NextResponse.json({
      message: "Attendance records processed",
      results
    });
  } catch (error) {
    const { error: errorMessage, status } = handleApiError(error);
    return NextResponse.json({ error: errorMessage }, { status });
  }
}

async function processBatch(
  records: HardwareAttendanceRecord[], 
  organizationId: string
) {
  const results = [];

  for (const record of records) {
    try {
      // Check if member exists and belongs to the organization
      const member = await Member.findOne({
        _id: record.memberId,
        organizationId
      });

      if (!member) {
        results.push({
          memberId: record.memberId,
          status: "error",
          message: "Member not found or unauthorized"
        });
        continue;
      }

      // Check for duplicate attendance within the time window
      const recordDate = new Date(record.timestamp);
      const startOfDay = new Date(recordDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1);

      const existingAttendance = await Attendance.findOne({
        memberId: record.memberId,
        organizationId,
        timestamp: {
          $gte: startOfDay,
          $lt: endOfDay
        }
      });

      if (existingAttendance) {
        results.push({
          memberId: record.memberId,
          status: "skipped",
          message: "Attendance already marked"
        });
        continue;
      }

      // Create attendance record
      const attendance = await Attendance.create({
        memberId: record.memberId,
        deviceId: record.deviceId,
        timestamp: new Date(record.timestamp),
        organizationId,
        method: "hardware"
      });

      results.push({
        memberId: record.memberId,
        status: "success",
        attendanceId: attendance._id
      });
    } catch (error) {
      console.error(`Error processing record for member ${record.memberId}:`, error);
      results.push({
        memberId: record.memberId,
        status: "error",
        message: "Internal server error"
      });
    }
  }

  return results;
}