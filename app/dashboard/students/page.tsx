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
import { toast } from "sonner";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const studentSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  branch: z.string().min(2, "Branch must be at least 2 characters"),
  enrollmentNo: z
    .string()
    .min(5, "Enrollment number must be at least 5 characters"),
  fatherName: z.string().min(2, "Father's name must be at least 2 characters"),
  contactNo: z
    .string()
    .regex(/^\d{10}$/, "Contact number must be exactly 10 digits"),
  fatherContactNo: z
    .string()
    .regex(/^\d{10}$/, "Father's contact number must be exactly 10 digits"),
  updatedImages: z.array(z.any().nullable()).optional(),
});

const engineeringBranches = [
  "Computer Science Engineering",
  "Information Technology",
  "Electronics and Communication Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Agricultural Engineering",
];

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
    resolver: zodResolver(studentSchema),
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

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch("/api/students");
        const data = await response.json();
        setStudents(data);
      } catch (error) {
        console.error("Failed to fetch students:", error);
        toast.error("Error fetching students.");
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

  // Utility function to convert a File to a Base64 string
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64String = result.split(",")[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleUpdateStudent = handleSubmit(async (data) => {
    if (!selectedStudent) return;

    try {
      const updatedImagesBase64: string[] = [];
      const updatedIndices: number[] = [];

      if (data.updatedImages) {
        for (let i = 0; i < data.updatedImages.length; i++) {
          const file = data.updatedImages[i];
          if (file) {
            const base64 = await fileToBase64(file);
            updatedImagesBase64.push(base64);
            updatedIndices.push(i);
          }
        }
      }

      const payload = {
        name: data.name,
        branch: data.branch,
        enrollmentNo: data.enrollmentNo,
        contactNo: data.contactNo,
        fatherName: data.fatherName,
        fatherContactNo: data.fatherContactNo,
        updatedImages: updatedImagesBase64.length ? updatedImagesBase64 : [],
        updatedIndices: updatedIndices,
      };

      const id = selectedStudent._id;

      const response = await fetch(`/api/students/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const updatedStudent = await response.json();
        setStudents((prev) =>
          prev.map((s) => (s._id === updatedStudent._id ? updatedStudent : s))
        );
        setOpen(false);
        toast.success("Student updated successfully!");
      } else {
        const errorData = await response.json();
        console.error("Error updating student:", errorData);
        toast.error("Failed to update student.");
      }
    } catch (error: any) {
      console.error("Error updating student:", error);
      toast.error("Failed to update student.");
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
          toast.success("Student deleted successfully!");
        } else {
          const errorData = await response.json();
          console.error("Error updating student:", errorData);
          toast.error("Failed to delete student.");
        }
      } catch (error: any) {
        console.error("Error deleting student:", error);
        toast.error("Failed to delete student.");
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
                <TableCell className="text-right md:flex justify-end items-center block">
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Update"
                    className="text-blue-500 hover:text-blue-600 transition-all duration-200"
                    onClick={() => handleEdit(student)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Delete"
                    className="text-red-500 hover:text-red-600 transition-all duration-200"
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
        <DialogContent className="max-w-2xl max-h-screen overflow-y-auto p-6">
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
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student Name</FormLabel>
                        <FormControl>
                          <Input {...field} id="name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="enrollmentNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Enrollment Number</FormLabel>
                        <FormControl>
                          <Input {...field} id="enrollmentNo" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="branch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select branch" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {engineeringBranches.map((branch) => (
                            <SelectItem key={branch} value={branch}>
                              {branch}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fatherName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Father&apos;s Name</FormLabel>
                      <FormControl>
                        <Input {...field} id="fatherName" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="contactNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student Contact Number</FormLabel>
                        <FormControl>
                          <Input {...field} id="contactNo" type="tel" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fatherContactNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Father&apos;s Contact Number</FormLabel>
                        <FormControl>
                          <Input {...field} id="fatherContactNo" type="tel" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <FormLabel>Student Images</FormLabel>
                  <div className="grid md:grid-cols-3 gap-4">
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
