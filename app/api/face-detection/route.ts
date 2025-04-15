import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Student from "@/models/Student";

export async function POST(request: Request) {
  try {
    await connectDB();
    const { image } = await request.json();

    // Mark attendance automatically
    // await markAttendance(bestMatch.studentId);

    return NextResponse.json({
      // studentId: bestMatch.studentId,
      // name: bestMatch.name,
      // enrollmentNo: bestMatch.enrollmentNo,
      // confidence: bestMatch.confidence
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Face detection failed" },
      { status: 500 }
    );
  }
}

async function markAttendance(studentId: string) {
  try {
    const response = await fetch('/api/attendance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        studentId,
        status: 'present',
        method: 'automatic'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to mark attendance');
    }

    return await response.json();
  } catch (error) {
    console.error('Attendance marking error:', error);
    throw error;
  }
}