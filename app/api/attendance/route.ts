import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import Student from "@/models/Student";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface MonthlyAttendanceRecord {
  EnrollmentNo: string;
  Name: string;
  Branch: string;
  [day: number]: "P" | "A" | undefined; // Allow undefined for days without status initially
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.organizationId || !session?.user?.id || (session.user.role !== 'admin' && session.user.role !== 'co-admin')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const data = await request.json();

    const { studentId, status, method = "manual" } = data;

    const student = await Student.findById(studentId);
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.create({
      studentId,
      date: today,
      status,
      method,
      markedBy: session.user.id,
    });

    return NextResponse.json(attendance, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to mark attendance" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.organizationId || !session?.user?.id || (session.user.role !== 'admin' && session.user.role !== 'co-admin')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year");
    const month = searchParams.get("month");
    const dateParam = searchParams.get("date");

    if (dateParam) {
      // Fetch daily attendance
      const selectedDateUTC = new Date(dateParam);
      selectedDateUTC.setUTCHours(0, 0, 0, 0);

      const nextDayUTC = new Date(selectedDateUTC);
      nextDayUTC.setUTCDate(selectedDateUTC.getUTCDate() + 1);
      nextDayUTC.setUTCHours(0, 0, 0, 0);

      const dailyAttendance = await Attendance.find({
        organizationId: session.user.organizationId,
        date: { $gte: selectedDateUTC, $lt: nextDayUTC },
      }).populate("studentId", "_id name enrollmentNo branch");

      return NextResponse.json(dailyAttendance);
    } else if (year && month) {
      // Fetch monthly attendance
      const firstDayOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1);
      const lastDayOfMonth = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);

      const students = await Student.find({ organizationId: session.user.organizationId }, "_id name enrollmentNo branch");
      const attendanceRecords = await Attendance.find({
        organizationId: session.user.organizationId,
        date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
      }).populate("studentId", "_id name enrollmentNo branch");

      const monthlyAttendanceWithEnrollment: { [key: string]: MonthlyAttendanceRecord } = {};
      students.forEach(student => {
        monthlyAttendanceWithEnrollment[student.enrollmentNo] = {
          EnrollmentNo: student.enrollmentNo,
          Name: student.name,
          Branch: student.branch,
        };
      });

      attendanceRecords.forEach(record => {
        const studentEnrollmentNo = record.studentId.enrollmentNo;
        const day = record.date.getDate();
        if (monthlyAttendanceWithEnrollment[studentEnrollmentNo]) {
          monthlyAttendanceWithEnrollment[studentEnrollmentNo][day] = 'P';
        }
      });

      const daysInMonth = lastDayOfMonth.getDate();
      for (const enrollmentNo in monthlyAttendanceWithEnrollment) {
        for (let i = 1; i <= daysInMonth; i++) {
          if (!monthlyAttendanceWithEnrollment[enrollmentNo][i]) {
            monthlyAttendanceWithEnrollment[enrollmentNo][i] = 'A';
          }
        }
      }

      return NextResponse.json(Object.values(monthlyAttendanceWithEnrollment));
    } else {
      return NextResponse.json({ error: "Year and month or date are required" }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch attendance" }, { status: 500 });
  }
}
