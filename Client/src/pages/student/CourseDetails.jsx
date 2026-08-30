import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import { CourseDetailsSkeleton } from '../../components/ui/skeleton'
import { assets } from '../../assets/assets'
import humanizeDuration from "humanize-duration";
import Footer from '../../components/student/Footer'
import YouTube from "react-youtube"
import { toast } from 'sonner'
import { Breadcrumb } from '../../components/ui/breadcrumb'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import {
  Clock, Users, Star, BookOpen, ChevronDown, Play,
  ShieldCheck, Download, RefreshCw, Award, Timer
} from 'lucide-react'

const CourseDetails = () => {

  const {id} = useParams()

  const [courseData, setCourseData] = useState(null)
  const [openSections, setOpenSections] = useState({})
  const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false)
  const [playerData, setPlayerData] = useState(null)
  const [enrolling, setEnrolling] = useState(false)

  const {allCourses, calculateRating, calculateChapterTime, calculateCourseDuration,
    calculateNoOfLectures, currency, URL, userData, getToken} = useContext(AppContext)

  const fetchCourseData = async () => {
    try {
      const token = await getToken()
      const res = await fetch(`${URL}/course/${id}`,{
        method: 'GET',
        headers: {
          "Content-type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      })
      const data = await res.json()
      if(res.status === 200) {
        setCourseData(data.courseData)
      } else {
        toast.error(data.message || 'Failed to load course')
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
    }
  }

  const enrollCourse = async () => {
    try {
      if(!userData) {
        return toast.warning('Please sign in to enroll in this course.')
      }
      if(isAlreadyEnrolled) {
        return toast.info('You are already enrolled in this course.')
      }

      setEnrolling(true)
      const token = await getToken()
      const res = await fetch(`${URL}/user/purchase`, {
        method: 'POST',
        headers: {
          "Content-type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ courseId: courseData._id })
      })

      const data = await res.json()
      if(data.success) {
        window.location.replace(data.session_url)
      } else {
        toast.error(data.message || 'Enrollment failed. Please try again.')
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
    } finally {
      setEnrolling(false)
    }
  }

  useEffect(() => { fetchCourseData() }, [])

  useEffect(() => {
    if(userData && courseData){
      setIsAlreadyEnrolled(userData.enrolledCourses.includes(courseData._id))
    }
  }, [userData, courseData])

  const toggleSection = (index) => {
    setOpenSections(prev => ({...prev, [index]: !prev[index]}))
  }

  const rating = courseData ? calculateRating(courseData) : 0
  const discountedPrice = courseData
    ? (courseData.coursePrice - courseData.discount * courseData.coursePrice / 100).toFixed(2)
    : '0.00'

  return courseData ? (
    <>
      {/* Hero band */}
      <div className='bg-gradient-to-br from-gray-950 via-emerald-950 to-gray-900 pt-10 pb-16 px-6 md:px-24'>
        <Breadcrumb
          items={[{ label: 'Courses', href: '/course-list' }, { label: courseData.courseTitle }]}
          className='mb-5 [&_a]:text-emerald-400 [&_a]:hover:text-emerald-300 [&_span]:text-gray-300 [&_svg]:text-gray-500'
        />
        <div className='max-w-2xl'>
          <h1 className='text-3xl md:text-4xl font-extrabold text-white leading-tight mb-4'>
            {courseData.courseTitle}
          </h1>
          <p
            className='text-gray-300 text-sm md:text-base line-clamp-3'
            dangerouslySetInnerHTML={{__html: courseData.courseDescription.slice(0, 220)}}
          />
          {/* Rating row */}
          <div className='flex flex-wrap items-center gap-3 mt-5 text-sm'>
            <div className='flex items-center gap-1'>
              <span className='text-amber-400 font-bold text-base'>{rating.toFixed(1)}</span>
              <div className='flex'>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-600 fill-gray-600'}`} />
                ))}
              </div>
              <span className='text-emerald-400 ml-1'>({courseData.courseRatings.length} ratings)</span>
            </div>
            <div className='flex items-center gap-1 text-gray-300'>
              <Users className='w-4 h-4' />
              <span>{courseData.enrolledStudents.length} students</span>
            </div>
          </div>
          <p className='text-gray-400 text-sm mt-2'>
            Created by <span className='text-emerald-400 font-medium'>{courseData.educator.name}</span>
          </p>
        </div>
      </div>

      {/* Content area */}
      <div className='relative flex md:flex-row flex-col-reverse gap-8 md:px-24 px-6 -mt-6 pb-16'>

        {/* Left column */}
        <div className='flex-1 min-w-0 z-10'>

          {/* Course Structure */}
          <div className='bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mt-6'>
            <div className='flex items-center gap-2 mb-1'>
              <BookOpen className='w-5 h-5 text-emerald-600' />
              <h2 className='text-xl font-bold text-gray-900'>Course Structure</h2>
            </div>
            <p className='text-gray-400 text-sm mb-5'>
              {courseData.courseContent.length} chapters •{' '}
              {calculateNoOfLectures(courseData)} lectures •{' '}
              {calculateCourseDuration(courseData)} total
            </p>
            <div className='space-y-2'>
              {courseData.courseContent.map((chapter, index) => (
                <div key={index} className='border border-gray-200 rounded-xl overflow-hidden'>
                  <button
                    onClick={() => toggleSection(index)}
                    className='w-full flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-emerald-50 transition-colors text-left'
                  >
                    <div className='flex items-center gap-3'>
                      <ChevronDown
                        className={`w-4 h-4 text-emerald-600 transition-transform duration-200 ${openSections[index] ? 'rotate-180' : ''}`}
                      />
                      <span className='font-semibold text-gray-800 text-sm md:text-base'>{chapter.chapterTitle}</span>
                    </div>
                    <div className='flex items-center gap-2 text-xs text-gray-400 shrink-0'>
                      <Badge variant="secondary" className='text-xs'>
                        {chapter.chapterContent.length} lectures
                      </Badge>
                      <span>{calculateChapterTime(chapter)}</span>
                    </div>
                  </button>

                  <div className={`overflow-hidden transition-all duration-300 ${openSections[index] ? 'max-h-96' : 'max-h-0'}`}>
                    <ul className='divide-y divide-gray-100 bg-gray-50 px-4'>
                      {chapter.chapterContent.map((lecture, i) => (
                        <li key={i} className='flex items-center justify-between py-2.5 text-sm'>
                          <div className='flex items-center gap-2.5 text-gray-700'>
                            <Play className='w-3.5 h-3.5 text-emerald-500 shrink-0' />
                            <span>{lecture.lectureTitle}</span>
                          </div>
                          <div className='flex items-center gap-3 shrink-0 ml-2'>
                            {lecture.isPreviewFree && (
                              <button
                                onClick={() => setPlayerData({ videoId: lecture.lectureUrl.split('/').pop() })}
                                className='text-xs text-emerald-600 font-medium hover:text-emerald-800 transition-colors border border-emerald-200 bg-emerald-50 rounded-full px-2.5 py-0.5'
                              >
                                Preview
                              </button>
                            )}
                            <span className='text-gray-400 text-xs'>
                              {humanizeDuration(lecture.lectureDuration * 60 * 1000, {units:["h","m"]})}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className='bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mt-6'>
            <h3 className='text-xl font-bold text-gray-900 mb-4'>Course Description</h3>
            <div
              className='rich-text'
              dangerouslySetInnerHTML={{__html: courseData.courseDescription}}
            />
          </div>
        </div>

        {/* Right sticky card */}
        <div className='md:w-96 w-full shrink-0 z-10 md:sticky md:top-24 md:self-start'>
          <div className='rounded-2xl border border-gray-200 shadow-xl overflow-hidden bg-white'>
            {/* Preview video / thumbnail */}
            {playerData
              ? <YouTube videoId={playerData.videoId} opts={{playerVars:{autoplay:1}}} iframeClassName='w-full aspect-video' />
              : <img src={courseData.courseThumbnail} alt={courseData.courseTitle} className='w-full aspect-video object-cover' />
            }

            <div className='p-6'>
              {/* Timer badge */}
              <div className='flex items-center gap-2 bg-red-50 text-red-600 rounded-lg px-3 py-2 text-sm font-medium mb-4'>
                <Timer className='w-4 h-4' />
                <span><strong>5 days</strong> left at this price!</span>
              </div>

              {/* Price */}
              <div className='flex items-baseline gap-3 mb-1'>
                <span className='text-3xl font-extrabold text-gray-900'>{currency}{discountedPrice}</span>
                {courseData.discount > 0 && (
                  <>
                    <span className='text-gray-400 line-through text-lg'>{currency}{courseData.coursePrice}</span>
                    <Badge variant="destructive">{courseData.discount}% off</Badge>
                  </>
                )}
              </div>

              {/* Meta */}
              <div className='flex flex-wrap items-center gap-4 text-sm text-gray-500 py-4 border-y border-gray-100 mt-3'>
                <div className='flex items-center gap-1.5'>
                  <Star className='w-4 h-4 text-amber-400 fill-amber-400' />
                  <span>{rating.toFixed(1)} rating</span>
                </div>
                <div className='flex items-center gap-1.5'>
                  <Clock className='w-4 h-4 text-emerald-500' />
                  <span>{calculateCourseDuration(courseData)}</span>
                </div>
                <div className='flex items-center gap-1.5'>
                  <BookOpen className='w-4 h-4 text-emerald-500' />
                  <span>{calculateNoOfLectures(courseData)} lessons</span>
                </div>
              </div>

              {/* Enroll button */}
              {isAlreadyEnrolled ? (
                <div className='mt-4 w-full py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold text-center text-sm flex items-center justify-center gap-2'>
                  <ShieldCheck className='w-4 h-4' />
                  Already Enrolled
                </div>
              ) : (
                <Button
                  onClick={enrollCourse}
                  disabled={enrolling}
                  size="lg"
                  className='mt-4 w-full rounded-xl text-base font-bold bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200'
                >
                  {enrolling ? 'Redirecting...' : 'Enroll Now'}
                </Button>
              )}

              {/* Includes */}
              <div className='mt-5'>
                <p className='font-semibold text-gray-800 text-sm mb-3'>This course includes:</p>
                <ul className='space-y-2 text-sm text-gray-600'>
                  {[
                    [RefreshCw, 'Lifetime access with free updates'],
                    [BookOpen, 'Step-by-step, hands-on project guidance'],
                    [Download, 'Downloadable resources and source code'],
                    [Star, 'Quizzes to test your knowledge'],
                    [Award, 'Certificate of completion'],
                  ].map(([Icon, text], i) => (
                    <li key={i} className='flex items-center gap-2.5'>
                      <Icon className='w-4 h-4 text-emerald-500 shrink-0' />
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

      </div>
      <Footer />
    </>
  ) : (
    <CourseDetailsSkeleton />
  )
}

export default CourseDetails