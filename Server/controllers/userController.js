import { getDB } from "../configs/mongodb.js"

export const getUserData = async (req, res) => {
    try {
        const db = getDB()
        const { userId } = req.auth()

        const user = await db.collection("users").findOne({ _id: userId})

        if(!user) {
            return res.status(404).json({ success: false, message: 'User not found'})
        }

        return res.status(200).json({ success: true, user})
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
                $match: {
                    _id: userId
                }
            },
            {
                $lookup: {
                    from: "courses", //Which collection should MongoDB search?
                    localField: "enrolledCourses", //Which field from the current document should MongoDB use to search?
                    foreignField: "_id", //Which field in the courses collection should be compared?
                    as: "enrolledCourses" //Where should MongoDB store the matched documents? inside "enrolledCourses" field
                }
            }
        ]).toArray()

        const userData = result[0]

        if(!userData) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }

        res.json({ success: true, enrolledCourses: userData.enrolledCourses })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}


// Purchase Course
export const purchaseCourse = async (req, res) => {
    try{
        const db = getDB()
        const { courseId } = req.body
        const { origin } = req.headers
        const { userId } = req.auth()

        const userData = await db.collection("users").findOne({_id: userId})
        const courseData = await db.collection("courses").findOne({_id: new ObjectId(courseId)})

        if(!userData || !courseData) {
            return res.json({ success: false, message: 'Data not found' })
        }

        const purchaseData = {
            courseId: courseData._id.toString(),
            userId,
            amount: Number(courseData.coursePrice - (courseData.discount * courseData.coursePrice) / 100).toFixed(2),
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        }

        const result = await db.collection("purchases").insertOne(purchaseData)

        // Stripe Gateway Initialize
        const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)
        
        const currency = process.env.CURRENCY.toLowerCase()

        // Creating line items for Stripe
        const line_items = [{
            price_data:{
                currency,
                product_data: {
                    name: courseData.courseTitle,
                },
                unit_amount: Math.floor(amount) * 100
            },
            quantity: 1
        }]

        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/loading/my-enrollments`,
            cancel_url: `${origin}/`,
            line_items: line_items,
            mode: 'payment',
            metadata: {
                purchaseId: result.insertedId.toString()
            }
        })

        res.json({ success: true, session_url: session.url })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

//Update User Course Progress
export const updateUserCourseProgress = async (req, res) => {
    try {
        const db = getDB();
        const { userId } = req.auth();
        const { courseId, lectureId } =req.body;
        const progressData = await db.collection("courseProgress").findOne({userId, courseId})

        if(progressData) {
            if(progressData.lectureCompleted.includes(lectureId)) {
                return res.json({success: true, message: "Lecture Already Completed"})
            }

            await db.collection("courseProgress").updateOne(
                {
                    _id: progressData._id
                },
                {
                    $addToSet: {
                        lectureCompleted: lectureId
                    }
                },
                {
                    upsert: true
                }
            )

        } else {
            await db.collection("courseProgress").insertOne({
                userId, 
                courseId,
                lectureCompleted: [lectureId],
                createdAt: new Date(),
                updatedAt: new Date()
            })
        }

        res.json({success: true, message: "Progress Updated"})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

//Get User Course Progress
export const getUserCourseProgress = async (req, res) => {
    try {
        const db = getDB();
        const { userId } = req.auth();
        const { courseId } =req.body;
        const progressData = await db.collection("courseProgress").findOne({userId, courseId})

        res.json({success: true, progressData})

    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

//Add User Ratings to Course
export const  addUserRating = async (req, res) => {
    try {
        const db = getDB();
        const { userId } = req.auth();
        const { courseId, rating } = req.body;

        if(!courseId || !userId || !rating || rating < 1 || rating > 5) {
            return res.json({ success: false, message: 'Invalid Details' })
        }

        const course = await db.collection("courses").findOne({_id: courseId})

        if(!course) {
            return res.json({ success: false, message: 'Course not found' })
        }

        const user = await db.collection("users").findOne({_id: userId})

        if(!user || !user.enrolledCourses.includes(courseId)) {
            return res.json({ success: false, message: 'User has not purchased this course' })
        }

        const existingRatingIndex = course.courseRatings.findIndex(r => r.userId === userId)
        //Rating already available
        if(existingRatingIndex > -1) {
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
            );
        } else {
            await db.collection("courses").updateOne(
                {
                    _id: course._id
                },
                {
                    $push: {
                        courseRatings: {
                            userId,
                            rating
                        }
                    }
                }
            );
        }
        
        return res.json({success: true, message: 'Rating Added'})

    } catch (error) {
        res.json({success: false, message: error.message})
    }
}