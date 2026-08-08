import { createContext, useEffect } from "react";
import { dummyCourses } from "../assets/assets";
import { useState } from "react"
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration";
import { useAuth, useUser } from "@clerk/clerk-react"
import { toast } from "react-toastify";

export const AppContext = createContext()

export const AppContextProvider = (props) => {

    const currency = import.meta.env.VITE_CURRENCY
    const navigate = useNavigate()

    const {getToken} = useAuth()
    const {user} = useUser()

    const [allCourses, setAllCourses] = useState([])
    const [isEducator, setIsEducator] = useState(false)
    const [enrolledCourses, setEnrolledCourses] = useState([])
    const [userData, setUserData] = useState(null)

    const URL = import.meta.env.VITE_BACKEND_URL

    //Fetch all courses
    const fetchAllCourses = async () => {
        try {
            const token = await getToken()
            const res = await fetch(`${URL}/course/all`, {
                method: 'GET',
                headers: {
                    "Content-type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            })

            if(!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to load courses')
            }

            const data = await res.json()
            if(res.status === 200) {
                setAllCourses(data.courses)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    //Fetch User data
    const fetchUserData = async () => {

        if(user.publicMetadata.role === 'educator') {
            setIsEducator(true)
        }

        try{
            const token = await getToken()
            const res = await fetch(`${URL}/user/data`,{
                method: 'GET',
                headers: {
                    "Content-type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            })

            const data = await res.json()
            if(res.status === 200) {
                setUserData(data.user)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    //Calculate average rating of course
    const calculateRating = (course) => {
        if(course.courseRatings.length === 0)
            return 0
        let totalRating = 0
        course.courseRatings.forEach(rating => {
            totalRating += rating.rating
        });
        return Math.floor(totalRating / course.courseRatings.length)
    }

    //Calculate course chapter time
    const calculateChapterTime = (chapter) => {
        let time = 0
        chapter.chapterContent.map((lecture) => {
            time += lecture.lectureDuration
        })
        return humanizeDuration(time * 60 * 1000, {units: ["h", "m"]})
    }

    //Calculate course duration
    const calculateCourseDuration = (course) => {
        let time = 0
        course.courseContent.map((chapter) => {
            chapter.chapterContent.map((lecture) => {
                time += lecture.lectureDuration
            })
        })
        return humanizeDuration(time * 60 * 1000, {units: ["h", "m"]})

    }

    //Calculate No. of lectures in the course
    const calculateNoOfLectures = (course) => {
        let totalLectures = 0
        course.courseContent.forEach(chapter => {
            if(Array.isArray(chapter.chapterContent)) {
                totalLectures += chapter.chapterContent.length
            }
        })
        return totalLectures
    }

    //Fetch User Enrolled Courses
    const fetchUserEnrolledCourses = async () => {
        try {
            const token = await getToken()
            const res = await fetch(`${URL}/user/enrolled-courses`, {
                method: 'GET',
                headers: {
                    "Content-type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            })

            const data = await res.json()
            if(res.status === 200) {
                setEnrolledCourses(data.enrolledCourses.reverse())
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        fetchAllCourses() 
    }, [])

    useEffect(() => {
        if(user) {
            fetchUserData()
            fetchUserEnrolledCourses()
        }
    },[user])

    const value = {currency, allCourses, navigate, calculateRating, isEducator, setIsEducator, 
        calculateChapterTime, calculateCourseDuration, calculateNoOfLectures, enrolledCourses, 
        fetchUserEnrolledCourses, userData, setUserData, getToken, fetchAllCourses, URL}
    
    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}