import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import Student from "@/models/Student";

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Start date and end date are required" },
        { status: 400 }
      );
    }

    const attendanceRecords = await Attendance.find({
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).populate("studentId", "name enrollmentNo branch");

    // Format data for Excel
    const data = attendanceRecords.map(record => ({
      Date: new Date(record.date).toLocaleDateString(),
      "Student Name": record.studentId.name,
      "Enrollment No": record.studentId.enrollmentNo,
      Branch: record.studentId.branch,
      Status: record.status,
      "Marked By": record.method
    }));

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to export attendance" },
      { status: 500 }
    );
  }
}