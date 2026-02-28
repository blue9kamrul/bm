import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload image to Cloudinary
export const uploadToCloudinary = async (file) => {
  try {
    // Ensure the file object and buffer exist
    if (!file || !file.buffer) {
      throw new Error("No file buffer provided");
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("File size exceeds 5MB limit");
    }

    // Convert buffer to base64
    const base64String = file.buffer.toString("base64");

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(
      `data:${file.mimetype};base64,${base64String}`,
      {
        folder: "brittoo/products",
        resource_type: "image",
      }
    );

    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return null;
  }
};