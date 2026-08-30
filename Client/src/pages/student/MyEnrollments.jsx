import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import Footer from '../../components/student/Footer'
import { toast } from 'sonner'
import { Breadcrumb } from '../../components/ui/breadcrumb'
import { Progress } from '../../components/ui/progress'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Pagination } from '../../components/ui/pagination'
import { EnrollmentCardSkeleton } from '../../components/ui/skeleton'
import { BookOpen, Clock, CheckCircle2, PlayCircle } from 'lucide-react'

const ITEMS_PER_PAGE = 6

const MyEnrollments = () => {

  const {enrolledCourses, fetchUserEnrolledCourses, calculateCourseDuration, navigate,
    userData, getToken, URL, calculateNoOfLectures} = useContext(AppContext)

  const [progressArray, setProgressArray] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  const getCourseProgress = async () => {
    try {
      const token = await getToken()
      const tempProgressArray = await Promise.all(
        enrolledCourses.map(async (course) => {
          const res = await fetch(`${URL}/user/get-course-progress`, {
            method: 'POST',
            headers: {
              "Content-type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ courseId: course._id })
          })
          const data = await res.json()
          const totalLectures = calculateNoOfLectures(course)
          const lectureCompleted = data.progressData ? data.progressData.lectureCompleted.length : 0
          return { totalLectures, lectureCompleted }
        })
      )
      setProgressArray(tempProgressArray)
    } catch (error) {
      toast.error('Failed to load progress data.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if(userData) {
      fetchUserEnrolledCourses()
    }
  },[userData])

  useEffect(() => {
    if(enrolledCourses.length > 0) {
      getCourseProgress()
    } else if(userData) {
      setIsLoading(false)
    }
  },[enrolledCourses])

  const totalPages = Math.ceil(enrolledCourses.length / ITEMS_PER_PAGE)
  const paginatedCourses = enrolledCourses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  return (
    <>
      <div className='min-h-screen md:px-24 px-6 pt-10 pb-16'>

        {/* Header */}
        <Breadcrumb items={[{ label: 'My Enrollments' }]} className='mb-4' />
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>My Enrollments</h1>
            <p className='text-gray-500 mt-1 text-sm'>
              {enrolledCourses.length} course{enrolledCourses.length !== 1 ? 's' : ''} enrolled
            </p>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className='grid gap-4'>
            {[...Array(4)].map((_, i) => <EnrollmentCardSkeleton key={i} />)}
          </div>
        ) : enrolledCourses.length === 0 ? (
          /* Empty state */
          <div className='flex flex-col items-center justify-center py-24 text-center'>
            <div className='w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6'>
              <BookOpen className='w-10 h-10 text-emerald-300' />
            </div>
            <h3 className='text-xl font-semibold text-gray-800 mb-2'>No enrollments yet</h3>
            <p className='text-gray-400 mb-6 max-w-sm'>
              Start learning today by enrolling in one of our expert-led courses.
            </p>
            <Button onClick={() => navigate('/course-list')}>
              Explore Courses
            </Button>
          </div>
        ) : (
          <>
            <div className='grid gap-4'>
              {paginatedCourses.map((course, index) => {
                const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + index
                const progress = progressArray[globalIndex]
                const percent = progress
                  ? Math.round((progress.lectureCompleted / progress.totalLectures) * 100)
                  : 0
                const isCompleted = percent === 100
                const duration = calculateCourseDuration(course)

                return (
                  <div
                    key={course._id || index}
                    className='bg-white border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 hover:border-emerald-200 hover:shadow-sm transition-all duration-200'
                  >
                    {/* Thumbnail */}
                    <img
                      src={course.courseThumbnail}
                      alt={course.courseTitle}
                      className='w-full sm:w-32 md:w-44 h-28 sm:h-24 rounded-xl object-cover shrink-0'
                    />

                    {/* Info */}
                    <div className='flex-1 min-w-0 flex flex-col justify-between gap-3'>
                      <div>
                        <h3 className='font-semibold text-gray-900 text-base line-clamp-1'>{course.courseTitle}</h3>
                        <div className='flex items-center gap-3 mt-1 text-xs text-gray-400'>
                          <span className='flex items-center gap-1'>
                            <Clock className='w-3.5 h-3.5' />
                            {duration}
                          </span>
                          {progress && (
                            <span className='flex items-center gap-1'>
                              <BookOpen className='w-3.5 h-3.5' />
                              {progress.lectureCompleted}/{progress.totalLectures} lectures
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div>
                        <div className='flex items-center justify-between mb-1.5 text-xs'>
                          <span className='text-gray-500 font-medium'>Progress</span>
                          <span className={`font-bold ${isCompleted ? 'text-emerald-600' : 'text-gray-700'}`}>
                            {percent}%
                          </span>
                        </div>
                        <Progress value={percent} className='h-2' />
                      </div>

                      {/* Actions */}
                      <div className='flex items-center justify-between gap-2'>
                        {isCompleted ? (
                          <Badge variant="success" className='flex items-center gap-1'>
                            <CheckCircle2 className='w-3.5 h-3.5' />
                            Completed
                          </Badge>
                        ) : (
                          <Badge variant="warning">In Progress</Badge>
                        )}
                        <Button
                          size="sm"
                          variant={isCompleted ? 'outline' : 'default'}
                          onClick={() => navigate('/player/' + course._id)}
                          className='flex items-center gap-1.5 shrink-0'
                        >
                          <PlayCircle className='w-4 h-4' />
                          {isCompleted ? 'Review' : 'Continue'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => { setCurrentPage(page); scrollTo(0,0) }}
            />
          </>
        )}
      </div>
      <Footer />
    </>
  )
}

export default MyEnrollments