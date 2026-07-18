import { Webhook } from "svix";
import { getDB } from "../configs/mongodb.js";

// Manage Clerk Users with MongoDB
export const clerkWebhooks = async (req, res) => {
    try {
        const db = getDB();

        // Verify Clerk Webhook
        const webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

        await webhook.verify(JSON.stringify(req.body), {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"],
        });

        const { data, type } = req.body;

        console.log("Webhook Event:", type);

        switch (type) {

            // =========================
            // User Created
            // =========================
            case "user.created": {

                console.log("Received User:", data);

                const userData = {
                    _id: data.id,
                    email: data.email_addresses[0].email_address,
                    name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
                    imageUrl: data.image_url,
                };

                console.log("Inserting user...");

                await db.collection("users").insertOne(userData);

                console.log("User inserted successfully.");

                return res.status(200).json({
                    success: true,
                    message: "User created",
                });
            }

            // =========================
            // User Updated
            // =========================
            case "user.updated": {

                const userData = {
                    email: data.email_addresses[0].email_address,
                    name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
                    imageUrl: data.image_url,
                };

                await db.collection("users").updateOne(
                    { _id: data.id },
                    { $set: userData }
                );

                console.log("User updated.");

                return res.status(200).json({
                    success: true,
                    message: "User updated",
                });
            }

            // =========================
            // User Deleted
            // =========================
            case "user.deleted": {

                await db.collection("users").deleteOne({
                    _id: data.id,
                });

                console.log("User deleted.");

                return res.status(200).json({
                    success: true,
                    message: "User deleted",
                });
            }

            // =========================
            // Other Events
            // =========================
            default:
                console.log(`Ignored webhook event: ${type}`);

                return res.status(200).json({
                    success: true,
                    message: "Event ignored",
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