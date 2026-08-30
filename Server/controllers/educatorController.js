import { clerkClient } from "@clerk/express"
import { getDB } from "../configs/mongodb.js";
import { cloudinary } from "../configs/cloudinary.js";
import { courseSchema } from "../models/courseModel.js";
import { ObjectId } from "mongodb";

//Update role to educator
export const updateRoleToEducator = async (req, res) => {
    try {
        const { userId } = req.auth();

        await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata: {
                role: 'educator'
            }
        });

        return res.status(200).json({ success: true, message: 'You can publish a course now' })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

//Add new course
export const addCourse = async (req, res) => {
    try {
        const db = getDB();
        const { courseData } = req.body;
        const imageFile = req.file;
        const { userId } = req.auth();

        if (!imageFile) {
            return res.status(400).json({ success: false, message: 'Thumbnail Not Attached' })
        }

        const parsedCourseData = JSON.parse(courseData)
        parsedCourseData.educator = userId

        let imageUpload;
        try {
            imageUpload = await cloudinary.uploader.upload(imageFile.path);
            parsedCourseData.courseThumbnail = imageUpload.secure_url;
        } catch (uploadError) {
            return res.status(500).json({
                success: false,
                message: uploadError.message,
                http_code: uploadError.http_code
            });
        }

        const { error, value } = courseSchema.validate(parsedCourseData);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message })
        }

        const now = new Date().toISOString()
        value.createdAt = now
        value.updatedAt = now

        const result = await db.collection("courses").insertOne(value)

        return res.status(201).json({ success: true, message: 'Course Added Successfully', courseId: result.insertedId })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

//Get Educator Courses
export const getEducatorCourses = async (req, res) => {
    try {
        const db = getDB();
        const { userId } = req.auth();

        const courses = await db.collection("courses").find({ educator: userId }).toArray()

        return res.status(200).json({ success: true, courses })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

//Get Educator Dashboard data (Total Earning, Enrolled Students, No. of Courses)
export const educatorDashboardData = async (req, res) => {
    try {
        const db = getDB();
        const { userId } = req.auth();

        // Aggregation pipeline:
        // 1. Match educator's courses
        // 2. Lookup completed purchases for those courses
        // 3. Lookup students per course
        // 4. Group to compute totalEarnings, totalCourses, and enrolledStudentsData
        const [result] = await db.collection("courses").aggregate([
            {
                $match: { educator: userId }
            },
            {
                // Lookup completed purchases for this course
                $lookup: {
                    from: "purchases",
                    let: { courseIdStr: { $toString: "$_id" } },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$courseId", "$$courseIdStr"] },
                                        { $eq: ["$status", "completed"] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "purchases"
                }
            },
            {
                // Lookup user documents for each enrolled student
                $lookup: {
                    from: "users",
                    localField: "enrolledStudents",
                    foreignField: "_id",
                    as: "enrolledStudentDocs"
                }
            },
            {
                $group: {
                    _id: null,
                    totalCourses: { $sum: 1 },
                    totalEarnings: {
                        $sum: {
                            $reduce: {
                                input: "$purchases",
                                initialValue: 0,
                                in: { $add: ["$$value", { $toDouble: "$$this.amount" }] }
                            }
                        }
                    },
                    enrolledStudentsData: {
                        $push: {
                            $map: {
                                input: "$enrolledStudentDocs",
                                as: "student",
                                in: {
                                    courseTitle: "$courseTitle",
                                    student: {
                                        _id: "$$student._id",
                                        name: "$$student.name",
                                        imageUrl: "$$student.imageUrl"
                                    }
                                }
                            }
                        }
                    }
                }
            },
            {
                // Flatten the nested arrays into a single array
                $project: {
                    _id: 0,
                    totalCourses: 1,
                    totalEarnings: { $round: ["$totalEarnings", 2] },
                    enrolledStudentsData: {
                        $reduce: {
                            input: "$enrolledStudentsData",
                            initialValue: [],
                            in: { $concatArrays: ["$$value", "$$this"] }
                        }
                    }
                }
            }
        ]).toArray();

        const dashboardData = result || { totalCourses: 0, totalEarnings: 0, enrolledStudentsData: [] }

        return res.status(200).json({ success: true, dashboardData })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

//Get Enrolled Students Data with Purchase Data
export const getEnrolledStudentsData = async (req, res) => {
    try {
        const db = getDB();
        const { userId } = req.auth();

        // Get educator's course IDs (as strings, matching how they are stored in purchases)
        const courses = await db.collection("courses").find({ educator: userId }).toArray()
        const courseIdStrings = courses.map(course => course._id.toString())

        const enrolledStudents = await db.collection("purchases").aggregate([
            {
                $match: {
                    courseId: { $in: courseIdStrings },
                    status: 'completed'
                }
            },
            {
                // Lookup user document for the student
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "student"
                }
            },
            {
                $unwind: "$student"
            },
            {
                // Lookup course using courseId string converted to ObjectId
                $addFields: {
                    courseObjectId: { $toObjectId: "$courseId" }
                }
            },
            {
                $lookup: {
                    from: "courses",
                    localField: "courseObjectId",
                    foreignField: "_id",
                    as: "course"
                }
            },
            {
                $unwind: "$course"
            },
            {
                $project: {
                    _id: 0,
                    student: {
                        _id: "$student._id",
                        name: "$student.name",
                        imageUrl: "$student.imageUrl"
                    },
                    courseTitle: "$course.courseTitle",
                    purchaseDate: "$createdAt"
                }
            },
            {
                $sort: { purchaseDate: -1 }
            }
        ]).toArray();

        return res.status(200).json({ success: true, enrolledStudents })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}
