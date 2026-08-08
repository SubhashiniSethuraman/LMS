import { clerkClient } from "@clerk/express";

//Middleware (Protect Educator Routes)
export const protectEducator = async (req, res, next) => {
    try {

        //Get userId from clerk from app.use(clerkMiddleware()) middleware
        // const userId = req.auth.userId
        const { userId } = req.auth();
        const response = await clerkClient.users.getUser(userId)

        //Response will be like
        //{
        //     id: "user_2abc123",
        //     firstName: "Buddy",
        //     lastName: "S",
        //     emailAddresses: [...],

        //     publicMetadata: {
        //         role: "Educator"
        //     }
        // }

        if(response.publicMetadata.role !== "educator")
            return res.json({success: false, message: 'Unauthorized Access'})

        //Express continues to the controller
        next()
    } catch (error) {
        return res.json({success: false, message: error.message})
    }
}