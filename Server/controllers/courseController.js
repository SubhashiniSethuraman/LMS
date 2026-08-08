import { ObjectId } from "mongodb";
import { getDB } from "../configs/mongodb.js";

//Get All Courses
export const getAllCourses = async (req, res) => {
    try {
        const db = getDB();

        //Course document->Filter ($match)->Attach educator information ($lookup) to course data->
        //Convert educator array → object ($unwind)->Remove unwanted fields ($project)->Return final document
        const courses = await db.collection("courses").aggregate([
            {
                $match: {
                    isPublished: true
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "educator",
                    foreignField: "_id",
                    as: "educator"
                }
            },
            {
                $unwind: "$educator"
            },
            {
                $project: {
                    courseContent: 0,
                    enrolledStudents: 0
                }
            }
        ]).toArray()

        res.json({success: true, courses})
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}

//Get Course by Id
export const getCourseById = async (req, res) => {
    try {
        const db = getDB();
        const {id} = req.params;

        const result = await db.collection("courses").aggregate([
            {
                $match: {
                    _id: new ObjectId(id)
                }
            },
            {
                $lookup:{
                    from: "users",
                    localField: "educator",
                    foreignField: "_id",
                    as: "educator"
                }
            },
            {
                $unwind: "$educator"
            }
        ]).toArray();

        const courseData = result[0];

        if(!courseData) {
            return res.status(404).json({ success: false, message: "Course not found" })
        }

        //Remove lectureUrl if isPreviewFree is false
        courseData.courseContent.forEach(chapter => {
            chapter.chapterContent.forEach(lecture => {
                if(!lecture.isPreviewFree) {
                    lecture.lectureUrl = ""
                }
            })
        })

        res.json({ success: true, courseData })
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}
