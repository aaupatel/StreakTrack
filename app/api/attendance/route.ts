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
      organizationId: session.user.organizationId, // Ensure organizationId is saved with attendance
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
    const fetchAverage = searchParams.get("average") === "true"; // New parameter to request average

    if (fetchAverage && year && month) {
      // Logic for GET_MONTHLY_AVERAGE
      const yearInt = parseInt(year, 10);
      const monthInt = parseInt(month, 10);

      const firstDayOfMonth = new Date(yearInt, monthInt - 1, 1);
      const lastDayOfMonth = new Date(yearInt, monthInt, 0, 23, 59, 59, 999); // Last moment of the last day

      const totalStudents = await Student.countDocuments({ organizationId: session.user.organizationId });
      if (totalStudents === 0) {
        return NextResponse.json({ average: 0 });
      }

      const presentCount = await Attendance.countDocuments({
        organizationId: session.user.organizationId,
        date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
        status: "present",
      });

      // Calculate total expected attendance based on actual days in month
      const daysInMonth = lastDayOfMonth.getDate();
      const totalPossibleAttendanceRecords = totalStudents * daysInMonth;

      const averagePercentage = totalPossibleAttendanceRecords > 0 ? (presentCount / totalPossibleAttendanceRecords) * 100 : 0;

      return NextResponse.json({ average: parseFloat(averagePercentage.toFixed(1)) });

    } else if (dateParam) {
      // Logic for daily attendance (previously in GET_ATTENDANCE)
      const selectedDateUTC = new Date(dateParam);
      selectedDateUTC.setUTCHours(0, 0, 0, 0);

      const nextDayUTC = new Date(selectedDateUTC);
      nextDayUTC.setUTCDate(selectedDateUTC.getUTCDate() + 1);
      nextDayUTC.setUTCHours(0, 0, 0, 0);

      const dailyAttendance = await Attendance.find({
        organizationId: session.user.organizationId,
        date: { $gte: selectedDateUTC, $lt: nextDayUTC },
      }).populate("studentId", "_id name enrollmentNo branch"); // Populate with more student details

      return NextResponse.json(dailyAttendance);

    } else if (year && month) {
      // Logic for monthly attendance report
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
        const studentEnrollmentNo = (record.studentId as any).enrollmentNo; // Cast to any to access enrollmentNo
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
      // If no specific parameters, return a bad request
      return NextResponse.json({ error: "Missing required parameters. Provide 'date' for daily attendance, or 'year' and 'month' for monthly attendance/average." }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Error in GET attendance API:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch attendance data" }, { status: 500 });
  }
}