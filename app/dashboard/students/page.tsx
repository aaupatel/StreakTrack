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
import { Edit, Search, Trash } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

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
  const [open, setOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [updatedStudentData, setUpdatedStudentData] = useState<{
    name: string;
    branch: string;
    enrollmentNo: string;
    contactNo: string;
    fatherName: string;
    fatherContactNo: string;
    images: File[];
  }>({
    name: "",
    branch: "",
    enrollmentNo: "",
    contactNo: "",
    fatherName: "",
    fatherContactNo: "",
    images: [],
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch("/api/students");
        const data = await response.json();
        setStudents(data);
      } catch (error) {
        console.error("Failed to fetch students:", error);
        toast({
          variant: "destructive",
          title: "Error fetching students.",
          description: "Please try again later.",
        });
      }
    };

    fetchStudents();
  }, []);

  const filteredStudents = students.filter((student) =>
    Object.values(student).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setUpdatedStudentData({
      name: student.name,
      branch: student.branch,
      enrollmentNo: student.enrollmentNo,
      contactNo: student.contactNo,
      fatherName: student.fatherName,
      fatherContactNo: student.fatherContactNo,
      images: [], // Reset images for new uploads
    });
    setOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setUpdatedStudentData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUpdatedStudentData((prev) => ({
      ...prev,
      images: files,
    }));
  };

  const handleUpdateStudent = async () => {
    if (!selectedStudent) return;

    try {
      const formData = new FormData();
      formData.append("name", updatedStudentData.name);
      formData.append("branch", updatedStudentData.branch);
      formData.append("enrollmentNo", updatedStudentData.enrollmentNo);
      formData.append("contactNo", updatedStudentData.contactNo);
      formData.append("fatherName", updatedStudentData.fatherName);
      formData.append("fatherContactNo", updatedStudentData.fatherContactNo);
      updatedStudentData.images.forEach((image) =>
        formData.append("images", image)
      );

      const id = selectedStudent._id;

      const response = await fetch(`/api/students/${id}`, {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        const updatedStudent = await response.json();
        setStudents((prev) =>
          prev.map((s) => (s._id === updatedStudent._id ? updatedStudent : s))
        );
        setOpen(false);
        toast({
          title: "Student updated successfully!",
        });
      } else {
        const errorData = await response.json();
        toast({
          variant: "destructive",
          title: "Failed to update student.",
          description: errorData?.error || "Something went wrong.",
        });
      }
    } catch (error: any) {
      console.error("Error updating student:", error);
      toast({
        variant: "destructive",
        title: "Failed to update student.",
        description: error.message || "Network error.",
      });
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        const response = await fetch(`/api/students/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setStudents((prev) => prev.filter((s) => s._id !== id));
          toast({ title: "Student deleted successfully!" });
        } else {
          const errorData = await response.json();
          toast({
            variant: "destructive",
            title: "Failed to delete student.",
            description: errorData?.error || "Something went wrong.",
          });
        }
      } catch (error: any) {
        console.error("Error deleting student:", error);
        toast({
          variant: "destructive",
          title: "Failed to delete student.",
          description: error.message || "Network error.",
        });
      }
    }
  };

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
                    className="text-blue-500 hover:text-blue-600 mr-2"
                    onClick={() => handleEdit(student)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-600"
                    onClick={() => handleDeleteStudent(student._id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Student Details</DialogTitle>
            <DialogDescription>
              Make changes to the student&apos;s information.
            </DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={updatedStudentData.name}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="branch" className="text-right">
                  Branch
                </Label>
                <Input
                  id="branch"
                  name="branch"
                  value={updatedStudentData.branch}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="enrollmentNo" className="text-right">
                  Enrollment No.
                </Label>
                <Input
                  id="enrollmentNo"
                  name="enrollmentNo"
                  value={updatedStudentData.enrollmentNo}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="contactNo" className="text-right">
                  Contact No.
                </Label>
                <Input
                  id="contactNo"
                  name="contactNo"
                  value={updatedStudentData.contactNo}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="fatherName" className="text-right">
                  Father&apos;s Name
                </Label>
                <Input
                  id="fatherName"
                  name="fatherName"
                  value={updatedStudentData.fatherName}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="fatherContactNo" className="text-right">
                  Father&apos;s Contact
                </Label>
                <Input
                  id="fatherContactNo"
                  name="fatherContactNo"
                  value={updatedStudentData.fatherContactNo}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="images" className="text-right">
                  Update Images
                </Label>
                <Input
                  type="file"
                  id="images"
                  multiple
                  onChange={handleImageChange}
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateStudent}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
