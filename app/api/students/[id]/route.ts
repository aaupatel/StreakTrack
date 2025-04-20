import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import Student from "@/models/Student";
import { authOptions } from "@/lib/auth";
import { deleteFromCloudinary, uploadToCloudinary } from "@/lib/cloudinary";

function getPublicIdFromUrl(url: string | undefined): string | undefined {
    if (!url) return undefined;
    const parts = url.split('/');
    const imageNameWithExtension = parts[parts.length - 1];
    const imageName = imageNameWithExtension.split('.')[0];
    return imageName;
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.organizationId || !session?.user?.id || (session.user.role !== 'admin' && session.user.role !== 'co-admin')) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        await connectDB();
        const studentId = (await Promise.resolve(params)).id;
        const formData = await request.formData();
        const name = formData.get("name") as string;
        const branch = formData.get("branch") as string;
        const enrollmentNo = formData.get("enrollmentNo") as string;
        const contactNo = formData.get("contactNo") as string;
        const fatherName = formData.get("fatherName") as string;
        const fatherContactNo = formData.get("fatherContactNo") as string;
        const files: (File | null)[] = formData.getAll("images") as (File | null)[];

        const student = await Student.findById(studentId);
        if (!student) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }

        const existingImageUrls = student.images || [];
        const newImageUrls: (string | null)[] = [];
        const publicIdsToDelete: string[] = [];

        for (let i = 0; i < Math.max(files.length, existingImageUrls.length); i++) {
            const file = files[i];
            if (file instanceof File) {
                try {
                    const buffer = await file.arrayBuffer();
                    const bytes = Buffer.from(buffer);
                    const uploadResponse = await new Promise((resolve, reject) => {
                        cloudinary.uploader.upload_stream({ folder: "StreakTrack" }, (error, result) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(result?.secure_url);
                            }
                        }).end(bytes);
                    });
                    newImageUrls.push(uploadResponse as string);
                    if (existingImageUrls[i]) {
                        const publicId = getPublicIdFromUrl(existingImageUrls[i]);
                        if (publicId) {
                            publicIdsToDelete.push(publicId);
                        }
                    }
                } catch (error: any) {
                    console.error("Cloudinary Upload Error:", error);
                    newImageUrls.push(null); // Indicate upload failure
                }
            } else if (file === null) {
                newImageUrls.push(null);
                if (existingImageUrls[i]) {
                    const publicId = getPublicIdFromUrl(existingImageUrls[i]);
                    if (publicId) {
                        publicIdsToDelete.push(publicId);
                    }
                }
            } else {
                newImageUrls.push(existingImageUrls[i] || null);
            }
        }

        await deleteFromCloudinary(publicIdsToDelete);
        const finalImageUrls = newImageUrls.filter(url => url !== null) as string[];
        const updatedStudent = await Student.findByIdAndUpdate(
            studentId,
            {
                name,
                branch,
                enrollmentNo,
                contactNo,
                fatherName,
                fatherContactNo,
                images: finalImageUrls,
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