import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import CourseCard from './CourseCard'
import { Button } from '../ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'
import { CourseCardSkeleton } from '../ui/skeleton'

const CourseSection = () => {

  const {allCourses} = useContext(AppContext)

  return (
    <section className='w-full py-16 md:px-24 px-6'>
      {/* Section header */}
      <div className='flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12'>
        <div>
          <div className='inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-3'>
            <Sparkles className='w-3.5 h-3.5' />
            Top Rated
          </div>
          <h2 className='text-3xl md:text-4xl font-bold text-gray-900'>Learn from the best</h2>
          <p className='text-gray-500 mt-2 max-w-lg'>
            Discover our top-rated courses across various categories — from coding and design to business and wellness.
          </p>
        </div>
        <Link to='/course-list' onClick={() => scrollTo(0,0)}>
          <Button variant="outline" className='flex items-center gap-2 shrink-0'>
            View all courses <ArrowRight className='w-4 h-4' />
          </Button>
        </Link>
      </div>

      {/* Course grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
        {allCourses.length > 0
          ? allCourses.slice(0,4).map((course, index) => (
              <CourseCard key={index} course={course} />
            ))
          : [...Array(4)].map((_, i) => <CourseCardSkeleton key={i} />)
        }
      </div>
    </section>
  )
}

export default CourseSection