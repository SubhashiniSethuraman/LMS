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

app.use(express.json({
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}))
app.use(clerkMiddleware())

//Routes
app.get('/', (req, res) => res.send("API is Working"))
app.post('/clerk', clerkWebhooks)
app.use('/api/educator', educatorRouter)
app.use('/api/course', courseRouter)
app.use('/api/user', userRouter)

//Port
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})