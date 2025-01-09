import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


const extractPublicIdFromUrl = (url) => {
    try {
        if (!url) {
            throw new Error("URL is required to extract public ID.");
        }

        // Example: Extract "sample" from the Cloudinary URL
        const regex = /\/v\d+\/([^/.]+)\.\w+$/; // Matches the file name between version and extension
        const match = url.match(regex);

        if (!match || match.length < 2) {
            throw new Error("Invalid Cloudinary URL format.");
        }

        return match[1]; // Extracted public ID
    } catch (error) {
        console.error("Error extracting public ID:", error.message);
        return null;
    }
};

const removeFromCloudinary = async (url, resourceType = "image") => {
    try {
        const publicId = extractPublicIdFromUrl(url);

        if (!publicId) {
            throw new Error("Failed to extract public ID from URL.");
        }

        const response = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
        });

        console.log("File removed successfully from Cloudinary:", response);
        return response;
    } catch (error) {
        console.error("Error removing file from Cloudinary:", error.message);
        return null;
    }
};

export default removeFromCloudinary ;
