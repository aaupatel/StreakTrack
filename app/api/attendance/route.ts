import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import Member from "@/models/Member";
import Attendance from "@/models/Attendance";
import { handleApiError, validateRequest } from "@/lib/error-handler";
import { attendanceSchema } from "@/lib/validation-schemas";

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const data = await request.json();
    const validatedData = validateRequest(data, attendanceSchema);
    
    const member = await Member.findOne({ 
      _id: validatedData.memberId,
      organizationId: session.user.organizationId
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Check for duplicate attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingAttendance = await Attendance.findOne({
      memberId: validatedData.memberId,
      organizationId: session.user.organizationId,
      timestamp: {
        $gte: today,
        $lt: tomorrow
      }
    });

    if (existingAttendance) {
      return NextResponse.json(
        { error: "Attendance already marked for today" },
        { status: 400 }
      );
    }

    const attendance = await Attendance.create({
      ...validatedData,
      timestamp: new Date(),
      organizationId: session.user.organizationId,
    });

    return NextResponse.json(attendance, { status: 201 });
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
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
    
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    const attendance = await Attendance.find({
      organizationId: session.user.organizationId,
      timestamp: {
        $gte: startDate,
        $lt: endDate
      }
    }).populate("memberId", "name enrollmentId branch");

    return NextResponse.json(attendance);
  } catch (error) {
    const { error: errorMessage, status } = handleApiError(error);
    return NextResponse.json({ error: errorMessage }, { status });
  }
}