"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Users, UserCheck, UserX, Calendar } from "lucide-react";

interface AttendanceRecord {
  status: "present" | "absent";
}

interface Student {
  _id: string;
}

async function fetchTotalStudents(): Promise<number> {
  try {
    const response = await fetch("/api/students"); // Fetch all students
    if (!response.ok) {
      console.error("Failed to fetch students");
      return 0;
    }
    const data: Student[] = await response.json();
    return data.length;
  } catch (error) {
    console.error("Error fetching students:", error);
    return 0;
  }
}

async function fetchAttendanceToday(): Promise<{
  present: number;
  absent: number;
}> {
  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0];
  try {
    const response = await fetch(`/api/attendance?date=${formattedDate}`);
    if (!response.ok) {
      console.error("Failed to fetch today's attendance");
      return { present: 0, absent: 0 };
    }
    const data: AttendanceRecord[] = await response.json();
    const present = data.filter((record) => record.status === "present").length;
    const absent = data.length - present;
    return { present, absent };
  } catch (error) {
    console.error("Error fetching today's attendance:", error);
    return { present: 0, absent: 0 };
  }
}

async function fetchMonthlyAttendance(): Promise<number> {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  try {
    const response = await fetch(
      `/api/attendance/monthly-average?year=${year}&month=${month}`
    ); // Assuming you have an API for monthly average
    if (!response.ok) {
      console.error("Failed to fetch monthly average attendance");
      return 0;
    }
    const data = await response.json();
    return data.average || 0;
  } catch (error) {
    console.error("Error fetching monthly average attendance:", error);
    return 0;
  }
}

export default function Dashboard() {
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [presentToday, setPresentToday] = useState<number>(0);
  const [absentToday, setAbsentToday] = useState<number>(0);
  const [monthlyAverage, setMonthlyAverage] = useState<number>(0);

  useEffect(() => {
    const loadData = async () => {
      const total = await fetchTotalStudents();
      setTotalStudents(total);

      const todayAttendance = await fetchAttendanceToday();
      setPresentToday(todayAttendance.present);
      setAbsentToday(todayAttendance.absent);

      const monthlyAvg = await fetchMonthlyAttendance();
      setMonthlyAverage(monthlyAvg);
    };

    loadData();
  }, []);

  const presentPercentage =
    totalStudents > 0 ? ((presentToday / totalStudents) * 100).toFixed(1) : "0";
  const absentPercentage =
    totalStudents > 0 ? ((absentToday / totalStudents) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Students"
          value={totalStudents.toString()}
          icon={<Users className="h-6 w-6" />}
          description="Registered students"
        />
        <StatsCard
          title="Present Today"
          value={presentToday.toString()}
          icon={<UserCheck className="h-6 w-6" />}
          description={`${presentPercentage}% attendance`}
        />
        <StatsCard
          title="Absent Today"
          value={absentToday.toString()}
          icon={<UserX className="h-6 w-6" />}
          description={`${absentPercentage}% absent`}
        />
        <StatsCard
          title="This Month"
          value={`${monthlyAverage.toFixed(1)}%`}
          icon={<Calendar className="h-6 w-6" />}
          description="Average attendance"
        />
      </div>

      {/* Add charts and detailed statistics here */}
    </div>
  );
}

function StatsCard({
  title,
  value,
  icon,
  description,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
}) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-semibold mt-1">{value}</p>
        </div>
        <div className="text-gray-400">{icon}</div>
      </div>
      <p className="text-sm text-gray-500 mt-2">{description}</p>
    </Card>
  );
}
