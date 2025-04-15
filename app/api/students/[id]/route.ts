import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import Student from "@/models/Student";
import { authOptions } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";

async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.organizationId || !session?.user?.id || (session.user.role !== 'admin' && session.user.role !== 'co-admin')) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        await connectDB();
        const studentId = (await Promise.resolve(params)).id; // Access id as a property of the resolved promise
        const formData = await request.formData();
        const name = formData.get("name") as string;
        const branch = formData.get("branch") as string;
        const enrollmentNo = formData.get("enrollmentNo") as string;
        const contactNo = formData.get("contactNo") as string;
        const fatherName = formData.get("fatherName") as string;
        const fatherContactNo = formData.get("fatherContactNo") as string;
        const files: File[] = formData.getAll("images") as File[];

        const student = await Student.findById(studentId);
        if (!student) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }

        let imageUrls: string[] = student.images;

        if (files && files.length > 0) {
            const base64Files: string[] = [];
            for (const file of files) {
                const base64 = await fileToBase64(file);
                base64Files.push(base64);
            }
            imageUrls = await uploadToCloudinary(base64Files);
        }

        const updatedStudent = await Student.findByIdAndUpdate(
            studentId,
            {
                name,
                branch,
                enrollmentNo,
                contactNo,
                fatherName,
                fatherContactNo,
                images: imageUrls,
            },
            { new: true }
        );

        if (!updatedStudent) {
            return NextResponse.json({ error: "Failed to update student" }, { status: 500 });
        }

        return NextResponse.json(updatedStudent, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Failed to update student" },
            { status: 500 }
        );
    }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        await connectDB();
        const studentId = (await Promise.resolve(params)).id; // Access id as a property of the resolved promise
        const student = await Student.findById(studentId);
        if (!student) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }

        if (student.organizationId.toString() !== session.user.organizationId.toString()) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        return NextResponse.json(student);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Failed to fetch student" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const studentId = (await Promise.resolve(params)).id;

        const student = await Student.findByIdAndDelete(studentId);

        if (!student) {
            return new NextResponse("Student not found", { status: 404 });
        }

        // Optionally, delete the student's images from Cloudinary here.

        return new NextResponse("Student deleted successfully", { status: 200 });
    } catch (error: any) {
        console.error("Error deleting student:", error);
        return new NextResponse(error.message, { status: 500 });
    }
}