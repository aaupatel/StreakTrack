import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import Student from "@/models/Student";
import { authOptions } from "@/lib/auth";
import { deleteFromCloudinary, uploadToCloudinary } from "@/lib/cloudinary";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (
            !session?.user?.organizationId ||
            !session?.user?.id ||
            (session.user.role !== "admin" && session.user.role !== "co-admin")
        ) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const studentId = await params.id;
        console.log(studentId)
        const data = await request.json();

        const student = await Student.findById(studentId);
        if (!student) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }

        const currentImages = [...student.images];
        const updatedIndices: number[] = data.updatedIndices || [];
        const updatedBase64s: string[] = data.updatedImages || [];

        // Handle image updates only if base64s and indices are provided
        if (updatedBase64s.length > 0 && updatedIndices.length > 0) {
            // Fix base64 format before uploading
            const formattedBase64s = updatedBase64s.map((img) => {
                if (img.startsWith("data:image/")) return img;
                return `data:image/png;base64,${img}`;
            });

            // Delete old images from Cloudinary
            const imagesToDelete = updatedIndices.map((index) => currentImages[index]);
            await deleteFromCloudinary(imagesToDelete);

            // Upload new images to Cloudinary
            const uploadedUrls = await uploadToCloudinary(formattedBase64s);

            // Update the image URLs in place
            for (let i = 0; i < updatedIndices.length; i++) {
                currentImages[updatedIndices[i]] = uploadedUrls[i];
            }
        }

        const updatedStudent = await Student.findByIdAndUpdate(
            studentId,
            {
                name: data.name,
                branch: data.branch,
                enrollmentNo: data.enrollmentNo,
                contactNo: data.contactNo,
                fatherName: data.fatherName,
                fatherContactNo: data.fatherContactNo,
                images: currentImages,
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
        const studentId = await params.id;
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
        const session = await getServerSession(authOptions);
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        await connectDB();
        const studentId = await params.id;

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