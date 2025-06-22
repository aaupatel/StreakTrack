import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import Student from "@/models/Student";
import { authOptions } from "@/lib/auth";
import { deleteFromCloudinary, uploadToCloudinary } from "@/lib/cloudinary";

// Helper to extract params
function getIdFromParams(request: NextRequest): string {
    const url = new URL(request.url);
    const segments = url.pathname.split("/");
    return segments[segments.length - 1];
}

export async function PUT(request: NextRequest) {
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
        const studentId = getIdFromParams(request);
        const data = await request.json();

        const student = await Student.findById(studentId);
        if (!student) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }

        const currentImages = [...student.images];
        const updatedIndices: number[] = data.updatedIndices || [];
        const updatedBase64s: string[] = data.updatedImages || [];

        if (updatedBase64s.length > 0 && updatedIndices.length > 0) {
            const formattedBase64s = updatedBase64s.map((img) =>
                img.startsWith("data:image/") ? img : `data:image/png;base64,${img}`
            );

            const imagesToDelete = updatedIndices.map((index) => currentImages[index]);
            await deleteFromCloudinary(imagesToDelete);

            const uploadedUrls = await uploadToCloudinary(formattedBase64s);

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

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const studentId = getIdFromParams(request);

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

export async function DELETE(request: NextRequest) {
    try {
        await connectDB();
        const studentId = getIdFromParams(request);

        const student = await Student.findByIdAndDelete(studentId);

        if (!student) {
            return new NextResponse("Student not found", { status: 404 });
        }

        // Optionally delete Cloudinary images
        return new NextResponse("Student deleted successfully", { status: 200 });
    } catch (error: any) {
        console.error("Error deleting student:", error);
        return new NextResponse(error.message, { status: 500 });
    }
}
