import { ObjectId } from "mongodb"
import { getDB } from "../configs/mongodb.js"
import Stripe from 'stripe'
import Joi from 'joi'

// ─── Validation schemas ────────────────────────────────────────────────────────

const courseIdSchema = Joi.object({
    courseId: Joi.string().trim().required().messages({
        'string.empty': 'courseId is required',
        'any.required': 'courseId is required'
    })
})

const progressSchema = Joi.object({
    courseId: Joi.string().trim().required(),
    lectureId: Joi.string().trim().required()
})

const ratingSchema = Joi.object({
    courseId: Joi.string().trim().required(),
    rating: Joi.number().min(1).max(5).required().messages({
        'number.min': 'Rating must be between 1 and 5',
        'number.max': 'Rating must be between 1 and 5',
        'any.required': 'rating is required'
    })
})

// ─── Controllers ───────────────────────────────────────────────────────────────

export const getUserData = async (req, res) => {
    try {
        const db = getDB()
        const { userId } = req.auth()

        const user = await db.collection("users").findOne({ _id: userId })

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }

        return res.status(200).json({ success: true, user })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

//Users Enrolled Courses with Lecture Links
export const userEnrolledCourses = async (req, res) => {
    try {
        const db = getDB()
        const { userId } = req.auth()

        const result = await db.collection("users").aggregate([
            {
                $match: { _id: userId }
            },
            {
                $lookup: {
                    from: "courses",
                    localField: "enrolledCourses",
                    foreignField: "_id",
                    as: "enrolledCourses"
                }
            }
        ]).toArray()

        const userData = result[0]

        if (!userData) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }

        return res.status(200).json({ success: true, enrolledCourses: userData.enrolledCourses })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

// Purchase Course
export const purchaseCourse = async (req, res) => {
    // Validate input
    const { error, value } = courseIdSchema.validate(req.body)
    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message })
    }

    try {
        const db = getDB()
        const { courseId } = value
        const { origin } = req.headers
        const { userId } = req.auth()

        const [userData, courseData] = await Promise.all([
            db.collection("users").findOne({ _id: userId }),
            db.collection("courses").findOne({ _id: new ObjectId(courseId) })
        ])

        if (!userData) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }
        if (!courseData) {
            return res.status(404).json({ success: false, message: 'Course not found' })
        }

        const now = new Date().toISOString()
        const purchaseData = {
            courseId: courseData._id.toString(),
            userId,
            amount: Number(courseData.coursePrice - (courseData.discount * courseData.coursePrice) / 100).toFixed(2),
            status: 'pending',
            createdAt: now,
            updatedAt: now
        }

        const result = await db.collection("purchases").insertOne(purchaseData)

        // Stripe Gateway Initialize
        const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)
        const currency = process.env.CURRENCY.toLowerCase()

        // Creating line items for Stripe
        const line_items = [{
            price_data: {
                currency,
                product_data: {
                    name: courseData.courseTitle,
                },
                unit_amount: Math.floor(purchaseData.amount) * 100
            },
            quantity: 1
        }]

        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/loading/my-enrollments`,
            cancel_url: `${origin}/`,
            line_items,
            mode: 'payment',
            metadata: {
                purchaseId: result.insertedId.toString()
            }
        })

        return res.status(200).json({ success: true, session_url: session.url })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

//Update User Course Progress
export const updateUserCourseProgress = async (req, res) => {
    const { error, value } = progressSchema.validate(req.body)
    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message })
    }

    try {
        const db = getDB()
        const { userId } = req.auth()
        const { courseId, lectureId } = value

        const progressData = await db.collection("courseProgress").findOne({ userId, courseId })

        if (progressData) {
            if (progressData.lectureCompleted.includes(lectureId)) {
                return res.status(200).json({ success: true, message: "Lecture Already Completed" })
            }

            await db.collection("courseProgress").updateOne(
                { _id: progressData._id },
                {
                    $addToSet: { lectureCompleted: lectureId },
                    $set: { updatedAt: new Date().toISOString() }
                }
            )
        } else {
            const now = new Date().toISOString()
            await db.collection("courseProgress").insertOne({
                userId,
                courseId,
                lectureCompleted: [lectureId],
                createdAt: now,
                updatedAt: now
            })
        }

        return res.status(200).json({ success: true, message: "Progress Updated" })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

//Get User Course Progress
export const getUserCourseProgress = async (req, res) => {
    const { error, value } = courseIdSchema.validate(req.body)
    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message })
    }

    try {
        const db = getDB()
        const { userId } = req.auth()
        const { courseId } = value

        const progressData = await db.collection("courseProgress").findOne({ userId, courseId })

        return res.status(200).json({ success: true, progressData })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

//Add User Ratings to Course
export const addUserRating = async (req, res) => {
    const { error, value } = ratingSchema.validate(req.body)
    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message })
    }

    try {
        const db = getDB()
        const { userId } = req.auth()
        const { courseId, rating } = value

        const course = await db.collection("courses").findOne({ _id: new ObjectId(courseId) })
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' })
        }

        const user = await db.collection("users").findOne({ _id: userId })
        const enrolledCoursesStrings = user?.enrolledCourses
            ? user.enrolledCourses.map(id => id.toString())
            : []

        if (!user || !enrolledCoursesStrings.includes(courseId)) {
            return res.status(403).json({ success: false, message: 'User has not purchased this course' })
        }

        const existingRatingIndex = course.courseRatings.findIndex(r => r.userId === userId)

        if (existingRatingIndex > -1) {
            // Update existing rating
            await db.collection("courses").updateOne(
                {
                    _id: course._id,
                    [`courseRatings.${existingRatingIndex}.userId`]: userId
                },
                {
                    $set: {
                        [`courseRatings.${existingRatingIndex}.rating`]: rating
                    }
                }
            )
        } else {
            // Add new rating
            await db.collection("courses").updateOne(
                { _id: course._id },
                {
                    $push: {
                        courseRatings: { userId, rating }
                    }
                }
            )
        }

        return res.status(200).json({ success: true, message: 'Rating Added' })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}