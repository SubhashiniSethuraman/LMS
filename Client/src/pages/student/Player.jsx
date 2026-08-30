import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import { useParams } from 'react-router-dom'
import humanizeDuration from 'humanize-duration'
import YouTube from 'react-youtube'
import Footer from '../../components/student/Footer'
import Rating from '../../components/student/Rating'
import { toast } from 'sonner'
import Loading from '../../components/student/Loading'
import { Breadcrumb } from '../../components/ui/breadcrumb'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Progress } from '../../components/ui/progress'
import {
  ChevronDown, Play, CheckCircle2, Circle, Star, Lock
} from 'lucide-react'

const Player = () => {

  const {enrolledCourses, calculateChapterTime, URL, getToken, userData, fetchUserEnrolledCourses, calculateNoOfLectures} = useContext(AppContext)

  const {courseId} = useParams()

  const [courseData, setCourseData] = useState(null)
  const [openSections, setOpenSections] = useState({0: true})
  const [playerData, setPlayerData] = useState(null)
  const [progressData, setProgressData] = useState(null)
  const [initialRating, setInitialRating] = useState(0)
  const [marking, setMarking] = useState(false)

  const getCourseData = () => {
    enrolledCourses.map((course) => {
      if(course._id === courseId) {
        setCourseData(course)
        course.courseRatings.map((item) => {
          if(item.userId === userData._id)
            setInitialRating(item.rating)
        })
      }
    })
  }

  const toggleSection = (index) => {
    setOpenSections(prev => ({...prev, [index]: !prev[index]}))
  }

  useEffect(() => {
    if(enrolledCourses.length > 0) { getCourseData() }
  },[enrolledCourses, courseId])

  const markLectureAsCompleted = async (lectureId) => {
    if(marking) return
    try {
      setMarking(true)
      const token = await getToken()
      const res = await fetch(`${URL}/user/update-course-progress`,{
        method: 'POST',
        headers: {
          "Content-type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ courseId, lectureId })
      })
      const data = await res.json()
      if(res.status === 200){
        toast.success(data.message)
        getCourseProgress()
      } else {
        toast.error(data.message || 'Failed to update progress.')
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
    } finally {
      setMarking(false)
    }
  }

  const getCourseProgress = async () => {
    try {
      const token = await getToken()
      const res = await fetch(`${URL}/user/get-course-progress`,{
        method: 'POST',
        headers: {
          "Content-type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ courseId })
      })
      const data = await res.json()
      if(res.status === 200) {
        setProgressData(data.progressData)
      } else {
        toast.error(data.message || 'Failed to load progress.')
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
    }
  }

  const handleRate = async (rating) => {
    try {
      const token = await getToken()
      const res = await fetch(`${URL}/user/add-rating`, {
        method: 'POST',
        headers: {
          "Content-type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ courseId, rating })
      })
      const data = await res.json()
      if(res.status === 200) {
        toast.success(data.message)
        fetchUserEnrolledCourses()
      } else {
        toast.error(data.message || 'Failed to submit rating.')
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
    }
  }

  useEffect(() => { getCourseProgress() }, [])

  // Compute progress %
  const totalLectures = courseData ? calculateNoOfLectures(courseData) : 0
  const completedCount = progressData?.lectureCompleted?.length || 0
  const progressPercent = totalLectures > 0 ? Math.round((completedCount / totalLectures) * 100) : 0

  return courseData ? (
    <>
      {/* Top breadcrumb + progress */}
      <div className='bg-white border-b border-gray-100 px-4 md:px-24 py-3 flex flex-col sm:flex-row sm:items-center gap-3 justify-between'>
        <Breadcrumb
          items={[
            { label: 'My Enrollments', href: '/my-enrollments' },
            { label: courseData.courseTitle }
          ]}
        />
        <div className='flex items-center gap-3 min-w-48'>
          <Progress value={progressPercent} className='h-2 flex-1' />
          <span className='text-xs font-semibold text-emerald-700 shrink-0'>{progressPercent}%</span>
        </div>
      </div>

      <div className='flex flex-col md:grid md:grid-cols-[1fr_380px] min-h-[calc(100vh-120px)]'>

        {/* Right: Video player */}
        <div className='md:order-2 bg-gray-950'>
          {playerData ? (
            <div>
              <YouTube
                videoId={(() => {
                  const url = playerData.lectureUrl
                  // Handle youtu.be/ID and youtube.com/watch?v=ID formats
                  try {
                    const u = new URL(url)
                    if (u.hostname === 'youtu.be') return u.pathname.slice(1).split('?')[0]
                    return u.searchParams.get('v') || u.pathname.split('/').pop().split('?')[0]
                  } catch {
                    return url.split('/').pop().split('?')[0]
                  }
                })()}
                iframeClassName='w-full aspect-video'
              />
              <div className='flex justify-between items-center p-4 bg-gray-900'>
                <div>
                  <p className='text-white text-sm font-medium'>
                    {playerData.chapter}.{playerData.lecture} {playerData.lectureTitle}
                  </p>
                  <p className='text-gray-400 text-xs mt-0.5'>
                    {humanizeDuration(playerData.lectureDuration * 60 * 1000, {units:["h","m"]})}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => markLectureAsCompleted(playerData.lectureId)}
                  disabled={marking || (progressData?.lectureCompleted?.includes(playerData.lectureId))}
                  variant={progressData?.lectureCompleted?.includes(playerData.lectureId) ? 'secondary' : 'default'}
                  className='shrink-0'
                >
                  {progressData?.lectureCompleted?.includes(playerData.lectureId) ? (
                    <><CheckCircle2 className='w-4 h-4' /> Completed</>
                  ) : (
                    'Mark Complete'
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className='relative'>
              <img
                src={courseData.courseThumbnail}
                alt={courseData.courseTitle}
                className='w-full aspect-video object-cover opacity-60'
              />
              <div className='absolute inset-0 flex flex-col items-center justify-center gap-2 text-white'>
                <Play className='w-14 h-14 text-emerald-400 drop-shadow-lg' />
                <p className='text-sm font-medium'>Select a lecture to begin</p>
              </div>
            </div>
          )}
        </div>

        {/* Left: Course sidebar */}
        <div className='md:order-1 bg-white border-r border-gray-100 overflow-y-auto'>
          {/* Stats bar */}
          <div className='px-4 py-3 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between'>
            <span className='text-xs font-semibold text-emerald-700'>
              {completedCount}/{totalLectures} lectures completed
            </span>
            {progressPercent === 100 && (
              <Badge variant="success" className='flex items-center gap-1'>
                <CheckCircle2 className='w-3.5 h-3.5' /> Course Complete!
              </Badge>
            )}
          </div>

          <h2 className='px-4 py-3 font-bold text-gray-900 text-base border-b border-gray-100'>
            Course Content
          </h2>

          {/* Chapter accordion */}
          <div className='divide-y divide-gray-100'>
            {courseData.courseContent.map((chapter, index) => (
              <div key={index}>
                <button
                  onClick={() => toggleSection(index)}
                  className='w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left'
                >
                  <div className='flex items-center gap-2'>
                    <ChevronDown
                      className={`w-4 h-4 text-emerald-600 transition-transform duration-200 shrink-0 ${openSections[index] ? 'rotate-180' : ''}`}
                    />
                    <span className='font-semibold text-gray-800 text-sm'>{chapter.chapterTitle}</span>
                  </div>
                  <span className='text-xs text-gray-400 shrink-0 ml-2'>
                    {chapter.chapterContent.length} • {calculateChapterTime(chapter)}
                  </span>
                </button>

                <div className={`overflow-hidden transition-all duration-300 ${openSections[index] ? 'max-h-[1000px]' : 'max-h-0'}`}>
                  {chapter.chapterContent.map((lecture, i) => {
                    const isCompleted = progressData?.lectureCompleted?.includes(lecture.lectureId)
                    const isActive = playerData?.lectureId === lecture.lectureId
                    return (
                      <button
                        key={i}
                        onClick={() => setPlayerData({ ...lecture, chapter: index + 1, lecture: i + 1 })}
                        className={`w-full flex items-start gap-3 px-5 py-2.5 text-left transition-colors text-sm
                          ${isActive ? 'bg-emerald-50 border-l-2 border-emerald-500' : 'hover:bg-gray-50'}
                        `}
                      >
                        <div className='mt-0.5 shrink-0'>
                          {isCompleted ? (
                            <CheckCircle2 className='w-4 h-4 text-emerald-500' />
                          ) : (
                            <Circle className='w-4 h-4 text-gray-300' />
                          )}
                        </div>
                        <div className='flex-1 min-w-0'>
                          <p className={`font-medium line-clamp-2 ${isActive ? 'text-emerald-700' : 'text-gray-700'}`}>
                            {lecture.lectureTitle}
                          </p>
                          <p className='text-gray-400 text-xs mt-0.5'>
                            {humanizeDuration(lecture.lectureDuration * 60 * 1000, {units:["h","m"]})}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Rating section */}
          <div className='px-4 py-5 border-t border-gray-100 mt-2'>
            <h3 className='font-bold text-gray-900 text-sm mb-1'>Rate this course</h3>
            <p className='text-gray-400 text-xs mb-3'>Share your experience to help others.</p>
            <Rating initialRating={initialRating} onRate={handleRate} />
          </div>
        </div>

      </div>
      <Footer />
    </>
  ) : (
    <Loading />
  )
}

export default Player