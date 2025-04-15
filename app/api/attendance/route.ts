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

export async function GET_ATTENDANCE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.organizationId || (session.user.role !== 'admin' && session.user.role !== 'co-admin')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");

    if (dateParam) {
      const selectedDateUTC = new Date(dateParam);
      selectedDateUTC.setUTCHours(0, 0, 0, 0);
      const nextDayUTC = new Date(selectedDateUTC);
      nextDayUTC.setDate(selectedDateUTC.getDate() + 1);
      nextDayUTC.setUTCHours(0, 0, 0, 0);

      const dailyAttendance = await Attendance.find({
        organizationId: session.user.organizationId,
        date: { $gte: selectedDateUTC, $lt: nextDayUTC },
      }).populate("studentId", "name"); // Adjust fields as needed

      console.log(dailyAttendance)
      return NextResponse.json(dailyAttendance);
    } else {
      return NextResponse.json({ error: "Date parameter is required for daily attendance" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}

export async function GET_MONTHLY_AVERAGE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.organizationId || (session.user.role !== 'admin' && session.user.role !== 'co-admin')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const yearStr = searchParams.get("year");
    const monthStr = searchParams.get("month");

    if (!yearStr || !monthStr) {
      return NextResponse.json({ error: "Year and month parameters are required" }, { status: 400 });
    }

    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    const firstDayOfMonth = new Date(year, month - 1, 1);
    const lastDayOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const totalStudents = await Student.countDocuments({ organizationId: session.user.organizationId });
    if (totalStudents === 0) {
      return NextResponse.json({ average: 0 });
    }

    const presentCount = await Attendance.countDocuments({
      organizationId: session.user.organizationId,
      date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
      status: "present",
    });

    // Assuming each student should have one record per day
    const totalExpectedAttendance = totalStudents * lastDayOfMonth.getDate();
    const averagePercentage = totalExpectedAttendance > 0 ? (presentCount / totalExpectedAttendance) * 100 : 0;

    console.log({average: parseFloat(averagePercentage.toFixed(1))})
    return NextResponse.json({ average: parseFloat(averagePercentage.toFixed(1)) });
  } catch (error: any) {
    console.error("Error fetching monthly average attendance:", error);
    return NextResponse.json({ error: "Failed to fetch monthly average attendance" }, { status: 500 });
  }
}