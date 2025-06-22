"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { getDaysInMonth } from "date-fns";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";

interface MonthlyAttendanceRecord {
  Name: string;
  Branch: string;
  [day: number]: "P" | "A"; 
  EnrollmentNo: string;
}

interface AttendanceRecord {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    enrollmentNo: string;
    branch: string;
  };
  date: string;
  status: "present" | "absent";
  method: "automatic" | "manual";
}

export default function AttendancePage() {
  const [date, setDate] = useState<Date>(new Date());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [monthlyAttendance, setMonthlyAttendance] = useState<
    MonthlyAttendanceRecord[]
  >([]);

  useEffect(() => {
    fetchDailyAttendance(date)
    fetchMonthlyAttendance(date.getFullYear(), date.getMonth() + 1);
  }, [date]);

  const fetchDailyAttendance = async (selectedDate: Date) => {
    try {
      const response = await fetch(
        `/api/attendance?date=${selectedDate.toISOString().split("T")[0]}`
      );
      if (!response.ok) throw new Error("Failed to fetch daily attendance");
      const data = await response.json();
      setAttendance(data);
    } catch (error) {
      toast.error("Failed to fetch daily attendance records");
    }
  };

   const fetchMonthlyAttendance = async (year: number, month: number) => {
     try {
       const response = await fetch(
         `/api/attendance?year=${year}&month=${month}`
       );
       if (!response.ok) throw new Error("Failed to fetch monthly attendance");
       const data = await response.json();
       setMonthlyAttendance(data);
     } catch (error) {
       toast.error("Failed to fetch monthly attendance records");
     }
   };

   const handleDateChange = (newDate: Date | undefined) => {
     if (newDate) {
       setDate(newDate);
       fetchDailyAttendance(newDate); // Fetch daily attendance when a new date is selected
     }
   };

  const daysInCurrentMonth = getDaysInMonth(date);
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
  const monthString = monthStart.toLocaleDateString("default", {
    month: "long",
    year: "numeric",
  });

  const formattedDate = date.toLocaleDateString("en-IN", {
    // You can adjust the locale as needed
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const exportAttendance = async () => {
    try {
      const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const response = await fetch(
        `/api/attendance/export?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );

      if (!response.ok) throw new Error("Failed to export attendance");

      const data = await response.json();

      // Extract all unique dates
      const allDates = new Set<string>();
      data.forEach((row: any) => {
        Object.keys(row).forEach((key) => {
          if (/^\d{4}-\d{2}-\d{2}$/.test(key)) {
            allDates.add(key);
          }
        });
      });

      const sortedDates = Array.from(allDates).sort();

      const headers = ["Name", "Branch", ...sortedDates];

      const csv = [
        headers.join(","),
        ...data.map((row: any) => headers.map((h) => row[h] ?? "A").join(",")),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `attendance-${date.toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Attendance exported successfully");
    } catch (err) {
      toast.error("Failed to export attendance");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Attendance</h1>
        {/* <Button onClick={exportAttendance}>
          <Download className="mr-2 h-4 w-4" />
          Export Attendance
        </Button> */}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="border rounded-lg">
          <h2 className="px-4 py-2 font-semibold border-b">
            Calendar {monthString}
          </h2>
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateChange}
            classNames={{
              selected: cn(
                "bg-primary text-primary-foreground", // Default selected style
                "ring-2 ring-primary ring-offset-1",
                "font-bold"
              ),
              today: "font-semibold", // Style for today's date
            }}
            styles={{
              selected: {
                backgroundColor: "var(--accent)",
                color: "var(--accent-foreground)",
              },
            }}
          />
        </div>

        <div className="border rounded-lg shadow-sm">
          <h2 className="px-4 py-2 font-semibold border-b">
            Daily Attendance {formattedDate}
          </h2>
          <div className="overflow-y-scroll max-h-72">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Roll No.</TableHead>
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold text-center">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold">Method</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendance.map((record) => (
                  <TableRow key={record._id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      {record.studentId.enrollmentNo}
                    </TableCell>
                    <TableCell>{record.studentId.name}</TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                          record.status === "present"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {record.status === "present" ? "P" : "A"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          record.method === "automatic"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {record.method}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {attendance.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-gray-500"
                    >
                      No attendance records found for this date
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            Monthly Attendance Register - {monthString}
          </h1>
          <Button onClick={exportAttendance}>
            <Download className="mr-2 h-4 w-4" />
            Export Attendance
          </Button>
        </div>

        <div className="grid md:grid-cols-1 gap-8">
          <div className="border rounded-lg overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Roll No.</TableHead>
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Branch</TableHead>
                  {Array.from({ length: daysInCurrentMonth }, (_, i) => (
                    <TableHead
                      key={i + 1}
                      className="font-semibold text-center"
                    >
                      {i + 1}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyAttendance.map((record) => (
                  <TableRow
                    key={record.EnrollmentNo}
                    className="hover:bg-gray-50"
                  >
                    <TableCell className="font-medium">
                      {record.EnrollmentNo}
                    </TableCell>
                    <TableCell>{record.Name}</TableCell>
                    <TableCell>{record.Branch}</TableCell>
                    {Array.from({ length: daysInCurrentMonth }, (_, i) => (
                      <TableCell key={i + 1} className="text-center">
                        {record[i + 1] || "A"}{" "}
                        {/* Default to 'A' if no status */}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {monthlyAttendance.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3 + daysInCurrentMonth}
                      className="text-center py-8 text-gray-500"
                    >
                      No attendance records found for this month
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}

