// import {v2 as cloudinary} from 'cloudinary'

// const connectCloudinary = async () => {
//     cloudinary.config({
//         cloud_name: process.env.CLOUDINARY_NAME,
//         api_key: process.env.CLOUDINARY_API_KEY,
//         api_secret: process.env.CLOUDINARY_SECRET_KEY
//     })

//     console.log("Cloudinary configured:", {
//         cloud_name: process.env.CLOUDINARY_NAME,
//         api_key: process.env.CLOUDINARY_API_KEY,
//         has_secret: !!process.env.CLOUDINARY_SECRET_KEY
//     });
// }
// try {
//         const result = await cloudinary.api.ping();
//         console.log("Cloudinary ping:", result);
//     } catch (error) {
//         console.log("Cloudinary ping error:", error);
//     }
// export default connectCloudinary
// export {cloudinary}

import { v2 as cloudinary } from "cloudinary";

const connectCloudinary = async () => {

    // 1. Configure Cloudinary FIRST
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_SECRET_KEY
    });

    // 2. Check the ACTUAL Cloudinary SDK configuration
    console.log("Cloudinary SDK config:", {
        cloud_name: cloudinary.config().cloud_name,
        api_key: cloudinary.config().api_key,
        has_secret: !!cloudinary.config().api_secret
    });

    // 3. Ping ONLY AFTER config()
    try {
        const result = await cloudinary.api.ping();
        console.log("Cloudinary ping:", result);
    } catch (error) {
        console.log("Cloudinary ping error:", error);
    }
};

export default connectCloudinary;
export { cloudinary };