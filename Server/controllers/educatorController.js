import { clerkClient } from "@clerk/express"
import { getDB } from "../configs/mongodb.js";
// import { v2 as cloudinary } from 'cloudinary';
import { cloudinary } from "../configs/cloudinary.js";
import { courseSchema } from "../models/courseModel.js";
import { ObjectId } from "mongodb";

//Update role to educator
export const updateRoleToEducator = async (req, res) => {
    try{
        //req.auth is a function (new) not object. So req.auth()
        // const userId = req.auth.userId
        const { userId } = req.auth();

        await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata: {
                role: 'educator'
            }
        });

        res.status(200).json({ success: true, message: 'You can publish a course now' })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

//Add new course
export const addCourse = async (req, res) => {
    try {
        console.log("Entered addCourse Controller")
        const db = getDB();
        //Refer Cloudinary, Multer notes
        //Directly comes for frontend (FormData)
        const { courseData } = req.body;
        //Comes from Multer contains fileName, path, size...
        const imageFile = req.file;
        console.log("Image FIleee", imageFile)
        //Comes from Clerk
        const { userId } = req.auth();

        if(!imageFile) {
            return res.status(400).json({ success: false, message: 'Thumbnail Not Attached' })
        }

        //Why Parse?
        //Because when sending FormData, everything except files is transmitted as strings.
        //CourseData -> "{\"title\":\"React\",\"price\":499}"
        //So convert back to Object. That's why parse used
        //Now the course becomes {"title": "React", "price": "499"...}
        const parsedCourseData = JSON.parse(courseData)

        console.log(parsedCourseData, "parsed course dataaaaa")
        parsedCourseData.educator = userId

        console.log("Uploading to Cloudinary...");

        console.log("Uploading to Cloudinary...");
console.log("About to upload:", imageFile.path);

try {
    const imageUpload = await cloudinary.uploader.upload(imageFile.path);

    console.log("Cloudinary upload completed!");
    console.log("Cloudinary response:", imageUpload);

    parsedCourseData.courseThumbnail = imageUpload.secure_url;

} catch (error) {
    console.log("CLOUDINARY UPLOAD ERROR:", error);

    return res.status(500).json({
        success: false,
        message: error.message,
        http_code: error.http_code
    });
}

        // const imageUpload = await cloudinary.uploader.upload(imageFile.path)

        // console.log("Cloudinary response:", imageUpload.secure_url);
        // parsedCourseData.courseThumbnail = imageUpload.secure_url

        const { error, value } = courseSchema.validate(parsedCourseData);

        if (error) {
            return res.status(400).json({ success: false, message: error.message})
        }
        
        value.createdAt = new Date()
        value.updatedAt = new Date()
        const result = await db.collection("courses").insertOne(value)

        return res.status(201).json({success: true, message: 'Course Added Successfully', courseId: result.insertedId })   
    } catch (error) {
        return res.status(500).json({success: false, message: error.message })
    }
}

//Get Educator Courses
export const getEducatorCourses = async (req, res) => {
    try {
        const db = getDB();
        const { userId } = req.auth();
        
        //why find({educator: userId})? 
        //await db.collection("courses").find({}).toArray();
        //find expects key and value (ie) educator: "user_3Gg7f"
        //For findOne await db.collection("users").findOne({ _id }); is enough 
        const courses = await db.collection("courses").find({educator: userId}).toArray()

        return res.json({success: true, courses})
    } catch (error) {
        return res.json({success: false, message: error.message})
    }
}

//Get Educator Dashboard data (Total Earning, Enrolled Students, No. of Courses)
export const educatorDashboardData = async (req, res) => {
    try {
        const db = getDB();
        const { userId } = req.auth();

        const courses = await db.collection("courses").find({educator: userId}).toArray()
        const totalCourses = courses.length;

        const courseIds = courses.map( course => course._id);

        //Calculate total earnings from purchases
        const purchases = await db.collection("purchases").find({
            courseId: {$in: courseIds},
            status: 'completed'
        }).toArray()

        const totalEarnings = purchases.reduce((sum, purchase) => sum + purchase.amount, 0)

        //Collect unique enrolled student IDs with their course titles
        const enrolledStudentsData = []
        for(const course of courses) {
            const students = await db.collection("users").find({
                _id: {$in: course.enrolledStudents}
            }, {
                projection: {
                    name: 1, imageUrl: 1
                }
            }).toArray()

            students.forEach( student => {
                enrolledStudentsData.push({
                    courseTitle: course.courseTitle,
                    student
                })
            })
        }

        res.json({success: true, dashboardData: { totalEarnings, enrolledStudentsData, totalCourses }})
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

//Get Enrolled Students Data with Purchase Data
//Suppose frontend expect something like
//[
//   {
//     "student": {
//       "name": "Buddy",
//       "imageUrl": "..."
//     },
//     "courseTitle": "Complete React",
//     "purchaseDate": "2026-07-30"
//   },
//   {
//     "student": {
//       "name": "John",
//       "imageUrl": "..."
//     },
//     "courseTitle": "Node.js",
//     "purchaseDate": "2026-08-01"
//   }
// ]
//This response contains data from three different collections users, courses, purchases
//So use $lookup (same as JOIN in SQL)
export const getEnrolledStudentsData = async (req, res) => {
    try{
        const db = getDB();
        const { userId } = req.auth();

        //Why do we first query the courses collection?
        //Because we don't want every purchase.
        //We only want purchases for this educator's courses.
        const courses = await db.collection("courses").find({ educator: userId }).toArray()
        const courseIds = courses.map( course => course._id )

        //MANUAL
        // const purchases = await db.collection("purchases").find({
        //     courseId: {$in: courseIds},
        //     status: 'completed'
        // }).populate('userId', 'name  imageUrl').populate('courseId', 'courseTitle')

        // const enrolledStudents = purchases.map(purchase => ({
        //     student: purchase.userId,
        //     courseTitle: purchase.courseId.courseTitle,
        //     purchaseDate: purchase.createdAt
        // }))

        //MONGODB AGGREGATION
        const enrolledStudents = await db.collection("purchases").aggregate([
            {
                $match: {
                    courseId: { $in: courseIds },
                    status: 'completed'
                }
            },
            {
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
                $lookup: {
                    from: "courses",
                    localField: "courseId",
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
            }
        ]).toArray();

        res.json({ success: true, enrolledStudents })
    } catch (error) {
        res.json({ success: false, message: error.message})
    }
}


