import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (filePath) => {
    try {
        if (!filePath) {
            return null;
        }

        const response = await cloudinary.uploader.upload(filePath, {
            resource_type: "auto",
        });
       
        // Remove the file from the local system after successful upload
        fs.unlinkSync(filePath);
 
        return response.url;
    } catch (error) {
        console.error("Error during upload:", error);

        // If upload fails, ensure the file is removed to prevent accumulation
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        return null;
    }
};

export default uploadOnCloudinary ;
