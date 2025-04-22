"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Camera, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import CameraCaptureDialog from "@/components/ui/CameraCaptureDialog";

const formSchema = z.object({
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

export default function RegisterStudent() {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      branch: "",
      enrollmentNo: "",
      fatherName: "",
      contactNo: "",
      fatherContactNo: "",
    },
  });

  const handleCaptureImage = (image: string) => {
    setImages((prev) => [...prev, image].slice(0, 3));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Each image must be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          newImages.push(reader.result);
          if (newImages.length === files.length) {
            setImages((prev) => [...prev, ...newImages].slice(0, 3));
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (images.length !== 3) {
      toast.error("Please upload exactly 3 images");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          images,
        }),
      });

      if (!response.ok) throw new Error("Failed to register student");

      toast.success("Student registered successfully");
      form.reset();
      setImages([]);
    } catch (error) {
      toast.error("Failed to register student");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-2 mb-8">
        <Camera className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Register New Student</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter student name" {...field} />
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
                    <Input placeholder="Enter enrollment number" {...field} />
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
                  <Input placeholder="Enter father's name" {...field} />
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
                    <Input
                      placeholder="Enter student contact"
                      type="tel"
                      {...field}
                    />
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
                    <Input
                      placeholder="Enter father's contact"
                      type="tel"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <FormLabel>Student Images (3 required)</FormLabel>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCamera(true)}
                disabled={images.length >= 3}
              >
                Capture from Camera
              </Button>

              <label className="cursor-pointer text-secondary-foreground px-4 py-2 rounded-md border hover:bg-secondary/80 transition">
                Upload Image
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={images.length >= 3}
                  className="hidden"
                />
              </label>
            </div>

            <CameraCaptureDialog
              open={showCamera}
              onClose={() => setShowCamera(false)}
              onCapture={handleCaptureImage}
            />

            <div className="grid md:grid-cols-3 gap-4">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className="aspect-square relative border-2 border-dashed rounded-lg overflow-hidden"
                >
                  {images[index] ? (
                    <div className="relative group">
                      <Image
                        src={images[index]}
                        alt={`Student ${index + 1}`}
                        width={300}
                        height={300}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full md:opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500">
                      Image {index + 1}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500">
              Upload or capture 3 clear face photos. Each image must be less
              than 5MB.
            </p>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? "Registering..." : "Register Student"}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}