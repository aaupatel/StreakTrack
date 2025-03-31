"use client";

import { useState, useEffect } from "react";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Edit, Search } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface Student {
  _id: string;
  name: string;
  branch: string;
  enrollmentNo: string;
  contactNo: string;
  fatherName: string;
  fatherContactNo: string;
  images: string[];
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch("/api/students");
        const data = await response.json();
        setStudents(data);
      } catch (error) {
        console.error("Failed to fetch students:", error);
      }
    };

    fetchStudents();
  }, []);

  const filteredStudents = students.filter((student) =>
    Object.values(student).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Students</h1>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search students..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Photo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Enrollment No.</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Father&apos;s Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Father&apos;s Contact</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((student) => (
              <TableRow key={student._id}>
                <TableCell>
                  {student.images?.[0] && (
                    <div className="relative w-10 h-10 rounded-full overflow-hidden">
                      <Image
                        src={student.images[0]}
                        alt={student.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{student.name}</TableCell>
                <TableCell>{student.enrollmentNo}</TableCell>
                <TableCell>{student.branch}</TableCell>
                <TableCell>{student.fatherName}</TableCell>
                <TableCell>{student.contactNo}</TableCell>
                <TableCell>{student.fatherContactNo}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-600"
                    onClick={() => console.log(student._id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}