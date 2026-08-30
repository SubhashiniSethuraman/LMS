import { Webhook } from "svix";
import { getDB } from "../configs/mongodb.js";
import { userSchema } from "../models/userModel.js";
import Stripe from 'stripe'
import { ObjectId } from "mongodb";

// Manage Clerk Users with MongoDB
export const clerkWebhooks = async (req, res) => {
    console.log("========== CLERK WEBHOOK HIT ==========");
    console.log("Headers:", {
        "svix-id": req.headers["svix-id"],
        "svix-timestamp": req.headers["svix-timestamp"],
        "svix-signature": req.headers["svix-signature"],
    });
    console.log("CLERK_WEBHOOK_SECRET exists:", !!process.env.CLERK_WEBHOOK_SECRET);
    console.log("req.rawBody exists:", !!req.rawBody, req.rawBody ? `length: ${req.rawBody.length}` : "N/A");
    console.log("req.body exists:", !!req.body, typeof req.body === 'object' ? JSON.stringify(req.body).substring(0, 150) : req.body);

    try {
        const db = getDB();
        const webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
        const payload = req.rawBody ? req.rawBody.toString() : JSON.stringify(req.body);

        await webhook.verify(payload, {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"],
        });

        console.log("Svix Verification Success!");

        const { data, type } = req.body;
        console.log("Event Type:", type);

        switch (type) {
            case "user.created": {
                console.log("Processing user.created logic for ID:", data.id);
                const userData = {
                    _id: data.id,
                    name: `${data.first_name || ""} ${data.last_name || ""}`.trim() || "User",
                    email: data.email_addresses[0].email_address,
                    imageUrl: data.image_url,
                };
                console.log("UserData constructed:", userData);

                // Validate data
                const { error, value } = userSchema.validate(userData);

                if (error) {
                    console.error("User Creation Validation Error:", error.message);
                    return res.status(400).json({ success: false, message: error.message});
                }

                // Check if user already exists
                console.log("Checking if user exists in DB...");
                const userExists = await db.collection("users").findOne({
                    _id: value._id,
                });
                console.log("User exists:", !!userExists);

                if (userExists) {
                    return res.status(409).json({ success: false, message: "User already exists" });
                }

                console.log("Inserting user into DB...");
                const insertResult = await db.collection("users").insertOne({...value,
                    enrolledCourses: [],
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                console.log("User insertion successful. Result:", insertResult);

                return res.status(201).json({ success: true, message: "User created successfully" });
            }

            case "user.updated": {
                console.log("Processing user.updated logic for ID:", data.id);
                const userData = {
                    _id: data.id,
                    name: `${data.first_name || ""} ${data.last_name || ""}`.trim() || "User",
                    email: data.email_addresses[0].email_address,
                    imageUrl: data.image_url,
                };
                console.log("UserData constructed for update:", userData);

                // Validate data
                const { error, value } = userSchema.validate(userData);

                if (error) {
                    console.error("User Update Validation Error:", error.message);
                    return res.status(400).json({ success: false, message: error.message});
                }

                console.log("Updating user in DB...");
                const result = await db.collection("users").updateOne(
                    { _id: data.id },
                    { $set: {
                        name: value.name,
                        email: value.email,
                        imageUrl: value.imageUrl,
                        updatedAt: new Date()
                    }}
                );
                console.log("User update result:", result);

                if (result.matchedCount === 0) {
                    console.warn("User update failed: User not found in DB");
                    return res.status(404).json({ success: false, message: "User not found" });
                }

                return res.status(200).json({ success: true, message: "User updated successfully" });
            }

            case "user.deleted": {
                console.log("Processing user.deleted logic for ID:", data.id);
                const result = await db.collection("users").deleteOne({
                    _id: data.id,
                });
                console.log("User delete result:", result);

                if (result.deletedCount === 0) {
                    console.warn("User delete failed: User not found in DB");
                    return res.status(404).json({ success: false, message: "User not found" });
                }

                return res.status(200).json({ success: true, message: "User deleted successfully" });
            }

            default:
                return res.status(200).json({ success: true, message: `Ignored event: ${type}` });
        }
    } catch (error) {
        console.error("Webhook Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// const stripeInstance = new Stripe(process.env.STRIPE_WEBHOOK_SECRET)
// export const stripeWebhooks = async(request, response) => {
//     const db = getDB();
//     const sig = request.headers['stripe-signature'];

//     let event;

//     try {
//         event = Stripe.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
//     }
//     catch (err) {
//         response.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     // Handle the event
//     switch (event.type) {
//         case 'payment_intent.succeeded': {
//             const paymentIntent = event.data.object;
//             const paymentIntentId = paymentIntent.id;

//             const session = await stripeInstance.checkout.sessions.list({
//                 payment_intent: paymentIntentId
//             })

//             const { purchaseId } = session.data[0].metadata;

//             const purchaseData = await db.collection("purchases").findOne({purchaseId})
//             const userData = await db.collection("users").findOne(purchaseData.userId)
//             const courseData = await db.collection("courses").findOne(purchaseData.courseId.toString())

//             courseData.enrolledStudents.push(userData)
//             await courseData.save()

//             userData.enrolledCourses.push(courseData._id)
//             await userData.save()

//             purchaseData.status = 'completed'
//             await purchaseData.save()

//             break;
//         }
//         case 'payment_intent.payment_failed': {
//             const paymentIntent = event.data.object;
//             const paymentIntentId = paymentIntent.id;

//             const session = await stripeInstance.checkout.sessions.list({
//                 payment_intent: paymentIntentId
//             })

//             const { purchaseId } = session.data[0].metadata;

//             const purchaseData = await db.collection("purchases").findOne(purchaseId)

//             purchaseData.status = 'failed'
//             await purchaseData.save()
//             break;
//         }
//         default:
//         console.log(`Unhandled event type ${event.type}`);
//     }

//     // Return a response to acknowledge receipt of the event
//     response.json({received: true});
// }


const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhooks = async (request, response) => {
     console.log("========== WEBHOOK HIT ==========");
    const db = getDB();

    const sig = request.headers["stripe-signature"];
    console.log("Signature:", sig);

    let event;

    try {

        console.log("Stripe Secret Exists:", !!process.env.STRIPE_SECRET_KEY);
        console.log("Webhook Secret Exists:", !!process.env.STRIPE_WEBHOOK_SECRET);
        event = stripeInstance.webhooks.constructEvent(
            request.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );

        console.log("Webhook verified");
        console.log("Event type:", event.type);

    } catch (err) {
        console.log("Webhook verification failed");
        console.log(err.message);

        return response
            .status(400)
            .send(`Webhook Error: ${err.message}`);
    }

    console.log("Processing event...");
    switch (event.type) {

        case "payment_intent.succeeded": {

            const paymentIntent = event.data.object;

            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntent.id
            });

            const { purchaseId } = session.data[0].metadata;

            const purchaseData = await db.collection("purchases").findOne({
                _id: new ObjectId(purchaseId)
            });

            if (!purchaseData) break;

            const userData = await db.collection("users").findOne({
                _id: purchaseData.userId
            });

            const courseData = await db.collection("courses").findOne({
                _id: new ObjectId(purchaseData.courseId)
            });

            if (!userData || !courseData) break;

            // Add student to course
            const updatedResult = await db.collection("courses").updateOne(
                { _id: courseData._id },
                {
                    $addToSet: {
                        enrolledStudents: userData._id
                    }
                }
            );
            console.log(updatedResult);

            const updatedUser = await db.collection("users").findOne({
                _id: userData._id
            });

            console.log(updatedUser);

            // Add course to user
            await db.collection("users").updateOne(
                { _id: userData._id },
                {
                    $addToSet: {
                        enrolledCourses: courseData._id
                    }
                }
            );

            // Mark purchase completed
            await db.collection("purchases").updateOne(
                { _id: purchaseData._id },
                {
                    $set: {
                        status: "completed",
                        updatedAt: new Date()
                    }
                }
            );

            console.log("Payment succeeded");

console.log("Session:", session.data[0]);

console.log("Purchase ID:", purchaseId);

console.log("Purchase:", purchaseData);

console.log("User:", userData);

console.log("Course:", courseData);

            break;
        }

        case "payment_intent.payment_failed": {

            const paymentIntent = event.data.object;

            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntent.id
            });

            const { purchaseId } = session.data[0].metadata;

            await db.collection("purchases").updateOne(
                {
                    _id: new ObjectId(purchaseId)
                },
                {
                    $set: {
                        status: "failed",
                        updatedAt: new Date()
                    }
                }
            );

            break;
        }

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    response.json({ received: true });

    console.log("Webhook finished");
};