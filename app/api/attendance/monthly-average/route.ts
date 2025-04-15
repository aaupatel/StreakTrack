import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import Student from "@/models/Student";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";


export async function GET(request: Request) {
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

        return NextResponse.json({ average: parseFloat(averagePercentage.toFixed(1)) });
    } catch (error: any) {
        console.error("Error fetching monthly average attendance:", error);
        return NextResponse.json({ error: "Failed to fetch monthly average attendance" }, { status: 500 });
    }
}