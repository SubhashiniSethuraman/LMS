// import { Webhook } from "svix";
import { getDB } from "../configs/mongodb.js";
import { userSchema } from "../models/userModel.js"; // Adjust the path if needed

// Manage Clerk Users with MongoDB
export const clerkWebhooks = async (req, res) => {
    const db = getDB();

    try {
        // Verify Clerk Webhook
        const webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

        await webhook.verify(JSON.stringify(req.body), {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"],
        });

        const { data, type } = req.body;

        switch (type) {

            // =========================
            // User Created
            // =========================
            case "user.created": {

                const userData = {
                    _id: data.id,
                    name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
                    email: data.email_addresses[0].email_address,
                    imageUrl: data.image_url,
                };

                // Validate data
                const { error, value } = userSchema.validate(userData);

                if (error) {
                    return res.status(400).json({
                        success: false,
                        message: error.message,
                    });
                }

                // Check if user already exists
                const userExists = await db.collection("users").findOne({
                    _id: value._id,
                });

                if (userExists) {
                    return res.status(409).json({
                        success: false,
                        message: "User already exists",
                    });
                }

                await db.collection("users").insertOne(value);

                return res.status(201).json({
                    success: true,
                    message: "User created successfully",
                });
            }

            // =========================
            // User Updated
            // =========================
            case "user.updated": {

                const userData = {
                    name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
                    email: data.email_addresses[0].email_address,
                    imageUrl: data.image_url,
                };

                await db.collection("users").updateOne(
                    { _id: data.id },
                    { $set: userData }
                );

                return res.status(200).json({
                    success: true,
                    message: "User updated successfully",
                });
            }

            // =========================
            // User Deleted
            // =========================
            case "user.deleted": {

                await db.collection("users").deleteOne({
                    _id: data.id,
                });

                return res.status(200).json({
                    success: true,
                    message: "User deleted successfully",
                });
            }

            default:
                return res.status(200).json({
                    success: true,
                    message: `Ignored event: ${type}`,
                });
        }

    } catch (error) {
        console.error("Webhook Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};