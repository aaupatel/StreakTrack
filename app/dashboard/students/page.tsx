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
import { Edit, Search, Trash, Upload, X } from "lucide-react";
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
import { FormLabel } from "@/components/ui/form";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const studentSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  branch: z.string(),
  enrollmentNo: z.string(),
  contactNo: z.string().optional(),
  fatherName: z.string().optional(),
  fatherContactNo: z.string().optional(),
  updatedImages: z.array(z.any().nullable()).optional(),
});

type StudentFormValues = z.infer<typeof studentSchema>;

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

  const form = useForm<StudentFormValues>({
    resolver: undefined,
    defaultValues: {
      name: "",
      branch: "",
      enrollmentNo: "",
      contactNo: "",
      fatherName: "",
      fatherContactNo: "",
      updatedImages: [null, null, null],
    },
  });

  const { handleSubmit, setValue, watch, reset } = form;
  const updatedImages = watch("updatedImages");

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
  }, [toast]);

  const filteredStudents = students.filter((student) =>
    Object.values(student).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    reset({
      name: student.name,
      branch: student.branch,
      enrollmentNo: student.enrollmentNo,
      contactNo: student.contactNo,
      fatherName: student.fatherName,
      fatherContactNo: student.fatherContactNo,
      updatedImages: [null, null, null],
    });
    setOpen(true);
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0] || null;
    const newUpdatedImages = [...(updatedImages || [])];
    newUpdatedImages[index] = file;
    setValue("updatedImages", newUpdatedImages);
  };

  const handleRemoveImage = (index: number) => {
    const newUpdatedImages = [...(updatedImages || [])];
    newUpdatedImages[index] = null;
    setValue("updatedImages", newUpdatedImages);
  };

  const handleUpdateStudent = handleSubmit(async (data) => {
    if (!selectedStudent) return;

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("branch", data.branch);
      formData.append("enrollmentNo", data.enrollmentNo);
      formData.append("contactNo", data.contactNo || "");
      formData.append("fatherName", data.fatherName || "");
      formData.append("fatherContactNo", data.fatherContactNo || "");

      data.updatedImages?.forEach((file) => {
        if (file) {
          formData.append("images", file);
        }
      });

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
  });

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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Student Details</DialogTitle>
            <DialogDescription>
              Make changes to the student&apos;s information.
            </DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <FormProvider {...form}>
              <div className="grid gap-4 py-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Student Name</Label>
                    <Input {...form.register("name")} id="name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="enrollmentNo">Enrollment Number</Label>
                    <Input
                      {...form.register("enrollmentNo")}
                      id="enrollmentNo"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branch">Branch</Label>
                  <Input {...form.register("branch")} id="branch" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fatherName">Father&apos;s Name</Label>
                  <Input {...form.register("fatherName")} id="fatherName" />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="contactNo">Student Contact Number</Label>
                    <Input
                      {...form.register("contactNo")}
                      id="contactNo"
                      type="tel"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fatherContactNo">
                      Father&apos;s Contact Number
                    </Label>
                    <Input
                      {...form.register("fatherContactNo")}
                      id="fatherContactNo"
                      type="tel"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <FormLabel>Student Images (Click to update)</FormLabel>
                  <div className="grid grid-cols-3 gap-4">
                    {[0, 1, 2].map((index) => (
                      <div
                        key={index}
                        className="aspect-square relative border rounded-lg overflow-hidden hover:border-primary/50 transition-colors cursor-pointer"
                      >
                        {selectedStudent.images[index] &&
                          !updatedImages?.[index] && (
                            <Image
                              src={selectedStudent.images[index]}
                              alt={`Student ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          )}
                        {updatedImages?.[index] && (
                          <Image
                            src={URL.createObjectURL(updatedImages[index]!)}
                            alt={`New Student ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageChange(e, index)}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        {(selectedStudent.images[index] ||
                          updatedImages?.[index]) && (
                          <div className="absolute top-0 right-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="bg-gray-200 text-red-500 rounded-full shadow-md hover:bg-red-500 hover:text-gray-200"
                              onClick={() => handleRemoveImage(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                        {!selectedStudent.images[index] &&
                          !updatedImages?.[index] && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500">
                              <Upload className="w-6 h-6" />
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">
                    Click on an image to update it.
                  </p>
                </div>
              </div>
            </FormProvider>
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
