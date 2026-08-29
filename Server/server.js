import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { connectDB } from './configs/mongodb.js'
import { clerkWebhooks, stripeWebhooks } from './controllers/webhooks.js'
import educatorRouter from './routes/educatorRoutes.js'
import { clerkMiddleware } from '@clerk/express'
import connectCloudinary, { cloudinary } from './configs/cloudinary.js'
import courseRouter from './routes/courseRoutes.js'
import userRouter from './routes/userRoutes.js'

//Initialize Express
const app = express()

//Connect to database
await connectDB()
await connectCloudinary()

//Middlewares
app.use(cors())

// Stripe webhook first
app.post( "/stripe", express.raw({ type: "application/json" }), stripeWebhooks );

app.use(express.json())
app.use(clerkMiddleware())

//Routes
app.get('/', (req, res) => res.send("API is Working"))
app.post('/clerk', clerkWebhooks)
app.use('/api/educator', educatorRouter)
app.use('/api/course', courseRouter)
app.use('/api/user', userRouter)

app.get('/test-cloudinary-upload', async (req, res) => {
    try {

        const result = await cloudinary.uploader.upload(
            'D:/dev/projects/LMS/Server/img1.jpg',
            {
                resource_type: 'image'
            }
        );

        console.log("UPLOAD RESULT:", result);

        res.json({
            success: true,
            url: result.secure_url
        });

    } catch (error) {

        console.log("========== CLOUDINARY ERROR ==========");
        console.log("message:", error.message);
        console.log("http_code:", error.http_code);
        console.log("name:", error.name);
        console.log("error object:", error);
        console.log("response:", error.response);
        console.log("response body:", error.response?.body);
        console.log("response headers:", error.response?.headers);
        console.log("======================================");

        res.status(500).json({
            success: false,
            message: error.message,
            http_code: error.http_code,
            name: error.name,
            response: error.response?.body
        });
    }
});


//Port
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})