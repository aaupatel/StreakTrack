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

  useEffect(() => {
    fetchAttendance(date);
  }, [date]);

  const fetchAttendance = async (selectedDate: Date) => {
    try {
      const response = await fetch(
        `/api/attendance?date=${selectedDate.toISOString().split("T")[0]}`
      );
      if (!response.ok) throw new Error("Failed to fetch attendance");
      const data = await response.json();
      setAttendance(data);
    } catch (error) {
      toast.error("Failed to fetch attendance records");
    }
  };

  const exportAttendance = async () => {
    try {
      const startDate = new Date(date);
      startDate.setDate(1);
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const response = await fetch(
        `/api/attendance/export?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );

      if (!response.ok) throw new Error("Failed to export attendance");

      const data = await response.json();

      // Convert to CSV
      const headers = Object.keys(data[0]);
      const csv = [
        headers.join(","),
        ...data.map((row: any) =>
          headers.map((header) => row[header]).join(",")
        ),
      ].join("\n");

      // Download file
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `attendance-${date.toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("Attendance exported successfully");
    } catch (error) {
      toast.error("Failed to export attendance");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Attendance Register</h1>
        <Button onClick={exportAttendance}>
          <Download className="mr-2 h-4 w-4" />
          Export Attendance
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <Calendar
            mode="single"
            selected={date}
            onSelect={(date) => date && setDate(date)}
            className="rounded-md border shadow-sm"
          />
        </div>

        <div className="border rounded-lg overflow-hidden shadow-sm">
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
  );
}

// // Update the WebSocket setup in the attendance page
// const setupWebSocket = () => {
//   const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
//   const ws = new WebSocket(
//     `${protocol}//${window.location.host}/api/ws`
//   );

//   ws.onmessage = (event) => {
//     try {
//       const data = JSON.parse(event.data);
//       if (data.type === 'attendance') {
//         fetchAttendance(date);
//       }
//     } catch (error) {
//       console.error('WebSocket message error:', error);
//     }
//   };

//   ws.onerror = (error) => {
//     console.error('WebSocket error:', error);
//   };

//   return () => ws.close();
// };
