import { Webhook } from "svix";
import { getDB } from "../configs/mongodb.js";
import { userSchema } from "../models/userModel.js";
import Stripe from 'stripe'
import { ObjectId } from "mongodb";

// Manage Clerk Users with MongoDB
export const clerkWebhooks = async (req, res) => {
    try {
        const db = getDB();
        const webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
        const payload = req.rawBody ? req.rawBody.toString() : JSON.stringify(req.body);

        await webhook.verify(payload, {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"],
        });

        const { data, type } = req.body;

        switch (type) {
            case "user.created": {
                const userData = {
                    _id: data.id,
                    name: `${data.first_name || ""} ${data.last_name || ""}`.trim() || "User",
                    email: data.email_addresses[0].email_address,
                    imageUrl: data.image_url,
                };

                // Validate data
                const { error, value } = userSchema.validate(userData);

                if (error) {
                    return res.status(400).json({ success: false, message: error.message});
                }

                // Check if user already exists
                const userExists = await db.collection("users").findOne({
                    _id: value._id,
                });

                if (userExists) {
                    return res.status(409).json({ success: false, message: "User already exists" });
                }

                const now = new Date().toISOString();
                const insertResult = await db.collection("users").insertOne({...value,
                    enrolledCourses: [],
                    createdAt: now,
                    updatedAt: now
                });

                return res.status(201).json({ success: true, message: "User created successfully" });
            }

            case "user.updated": {
                const userData = {
                    _id: data.id,
                    name: `${data.first_name || ""} ${data.last_name || ""}`.trim() || "User",
                    email: data.email_addresses[0].email_address,
                    imageUrl: data.image_url,
                };

                // Validate data
                const { error, value } = userSchema.validate(userData);

                if (error) {
                    console.error("User Update Validation Error:", error.message);
                    return res.status(400).json({ success: false, message: error.message});
                }

                const result = await db.collection("users").updateOne(
                    { _id: data.id },
                    { $set: {
                        name: value.name,
                        email: value.email,
                        imageUrl: value.imageUrl,
                        updatedAt: new Date().toISOString()
                    }}
                );

                if (result.matchedCount === 0) {
                    console.warn("User update failed: User not found in DB");
                    return res.status(404).json({ success: false, message: "User not found" });
                }

                return res.status(200).json({ success: true, message: "User updated successfully" });
            }

            case "user.deleted": {
                const result = await db.collection("users").deleteOne({
                    _id: data.id,
                });

                if (result.deletedCount === 0) {
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
    const db = getDB();

    const sig = request.headers["stripe-signature"];

    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(
            request.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );

    } catch (err) {
        return response
            .status(400)
            .send(`Webhook Error: ${err.message}`);
    }

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
                        updatedAt: new Date().toISOString()
                    }
                }
            );
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
                        updatedAt: new Date().toISOString()
                    }
                }
            );

            break;
        }

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    response.json({ received: true });
};