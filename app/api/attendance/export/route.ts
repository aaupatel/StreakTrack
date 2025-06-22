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

    const records = await Attendance.find({
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).populate("studentId", "name enrollmentNo branch");

    const studentMap = new Map();

    records.forEach((rec) => {
      const dateKey = new Date(rec.date).toISOString().split("T")[0];
      const studentKey = rec.studentId.enrollmentNo;

      if (!studentMap.has(studentKey)) {
        studentMap.set(studentKey, {
          Name: rec.studentId.name,
          EnrollmentNo: rec.studentId.enrollmentNo,
          Branch: rec.studentId.branch,
        });
      }
      studentMap.get(studentKey)[dateKey] =
        rec.status === "present" ? "P" : "A";
    });
    const result = Array.from(studentMap.values());

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to export attendance" },
      { status: 500 }
    );
  }
}