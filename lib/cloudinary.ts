import cloudinary from "cloudinary";

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
    secure: true,
});

export async function uploadToCloudinary(base64Files: string[]): Promise<string[]> {
    try {
        if (!base64Files || base64Files.length === 0) {
            throw new Error("No files provided for upload.");
        }

        const uploadedImages: string[] = [];

        for (const base64File of base64Files) {
            if (!/^data:image\/(png|jpeg|jpg|webp|avif);base64,/.test(base64File)) {
                throw new Error("Invalid base64 image format.");
            }

            const uploadResponse = await cloudinary.v2.uploader.upload(base64File, {
                folder: "StreakTrack",
                format: "png",  // Convert uploaded image to PNG
            });

            uploadedImages.push(uploadResponse.secure_url);
        }

        return uploadedImages;
    } catch (error: any) {
        console.error("Cloudinary Upload Error:", error);
        throw new Error(error.message || "Failed to upload images to Cloudinary.");
    }
}

export const deleteFromCloudinary = async (publicIds: string[]): Promise<void> => {
    try {
        if (publicIds.length > 0) {
            const deleteResult = await cloudinary.v2.uploader.destroy(publicIds, { resource_type: 'image' });
            console.log("Cloudinary Delete Result:", deleteResult);
        }
    } catch (error: any) {
        console.error("Cloudinary Delete Error:", error);
        throw new Error(error.message || "Failed to delete images from Cloudinary.");
    }
};