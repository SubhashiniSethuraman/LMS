import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import SearchBar from '../../components/student/SearchBar'
import CourseCard from '../../components/student/CourseCard'
import Footer from '../../components/student/Footer'
import { useParams } from 'react-router-dom'
import { Breadcrumb } from '../../components/ui/breadcrumb'
import { Pagination } from '../../components/ui/pagination'
import { CourseCardSkeleton } from '../../components/ui/skeleton'
import { Button } from '../../components/ui/button'
import { X, BookOpen } from 'lucide-react'

const COURSES_PER_PAGE = 8

const CourseList = () => {

  const {navigate, allCourses} = useContext(AppContext)
  const {input} = useParams()

  const [filteredCourse, setFilteredCourse] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if(allCourses && allCourses.length > 0) {
      setIsLoading(false)
      const tempCourses = allCourses.slice()
      input
        ? setFilteredCourse(tempCourses.filter(item => item.courseTitle.toLowerCase().includes(input?.toLowerCase())))
        : setFilteredCourse(tempCourses)
      setCurrentPage(1)
    }
  },[allCourses, input])

  const totalPages = Math.ceil(filteredCourse.length / COURSES_PER_PAGE)
  const paginatedCourses = filteredCourse.slice(
    (currentPage - 1) * COURSES_PER_PAGE,
    currentPage * COURSES_PER_PAGE
  )

  const breadcrumbItems = [
    ...(input ? [{ label: 'Course List', href: '/course-list' }, { label: `"${input}"` }] : [{ label: 'Course List' }])
  ]

  return (
    <>
      <div className='relative min-h-screen md:px-24 px-6 pt-10 pb-16 text-left'>

        {/* Header */}
        <div className='flex flex-col md:flex-row gap-6 items-start md:items-end justify-between w-full mb-8'>
          <div>
            <Breadcrumb items={breadcrumbItems} className='mb-3' />
            <h1 className='text-3xl md:text-4xl font-bold text-gray-900'>
              {input ? `Results for "${input}"` : 'All Courses'}
            </h1>
            <p className='text-gray-500 mt-1 text-sm'>
              {isLoading ? 'Loading courses...' : `${filteredCourse.length} course${filteredCourse.length !== 1 ? 's' : ''} found`}
            </p>
          </div>
          <SearchBar data={input} />
        </div>

        {/* Active filter chip */}
        {input && !isLoading && (
          <div className='inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-1.5 rounded-full text-sm mb-6'>
            <span>Filtering: <strong>{input}</strong></span>
            <button
              onClick={() => navigate('/course-list')}
              className='hover:text-emerald-900 transition-colors ml-1'
              aria-label="Clear filter"
            >
              <X className='w-3.5 h-3.5' />
            </button>
          </div>
        )}

        {/* Course grid */}
        {isLoading ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5'>
            {[...Array(8)].map((_, i) => <CourseCardSkeleton key={i} />)}
          </div>
        ) : paginatedCourses.length > 0 ? (
          <>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5'>
              {paginatedCourses.map((course, index) => (
                <CourseCard key={index} course={course} />
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => { setCurrentPage(page); scrollTo(0, 0) }}
            />
          </>
        ) : (
          /* Empty state */
          <div className='flex flex-col items-center justify-center py-24 text-center'>
            <div className='w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6'>
              <BookOpen className='w-10 h-10 text-emerald-300' />
            </div>
            <h3 className='text-xl font-semibold text-gray-800 mb-2'>No courses found</h3>
            <p className='text-gray-400 mb-6 max-w-sm'>
              We couldn't find any courses matching your search. Try different keywords.
            </p>
            <Button onClick={() => navigate('/course-list')} variant="outline">
              Browse all courses
            </Button>
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}

export default CourseList