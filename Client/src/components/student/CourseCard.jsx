import React, { useContext } from 'react'
import { AppContext } from '../../context/AppContext'
import { Link } from 'react-router-dom'
import { Star, Clock, Users } from 'lucide-react'
import { Badge } from '../ui/badge'

const CourseCard = ({course}) => {

  const {currency, calculateRating} = useContext(AppContext)
  const rating = calculateRating(course)
  const discountedPrice = (course.coursePrice - course.discount * course.coursePrice / 100).toFixed(2)

  return (
    <Link
      to={`/course/${course._id}`}
      onClick={() => scrollTo(0,0)}
      className='group flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden card-hover'
    >
      {/* Thumbnail */}
      <div className='relative overflow-hidden'>
        <img
          src={course.courseThumbnail}
          alt={course.courseTitle}
          className='w-full h-44 object-cover transition-transform duration-300 group-hover:scale-105'
        />
        {course.discount > 0 && (
          <div className='absolute top-3 left-3'>
            <Badge variant="destructive" className='text-xs font-bold'>
              -{course.discount}% OFF
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className='p-4 flex flex-col flex-1'>
        <h3 className='font-semibold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors'>
          {course.courseTitle}
        </h3>
        <p className='text-gray-400 text-xs mt-1'>{course.educator.name}</p>

        {/* Rating row */}
        <div className='flex items-center gap-1.5 mt-2'>
          <span className='text-amber-500 font-bold text-sm'>{rating.toFixed(1)}</span>
          <div className='flex'>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${i < Math.floor(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-200'}`}
              />
            ))}
          </div>
          <span className='text-gray-400 text-xs'>({course.courseRatings?.length || 0})</span>
        </div>

        {/* Students */}
        <div className='flex items-center gap-1 mt-1 text-xs text-gray-400'>
          <Users className='w-3 h-3' />
          <span>{course.enrolledStudents?.length || 0} students</span>
        </div>

        {/* Price */}
        <div className='flex items-baseline gap-2 mt-auto pt-3 border-t border-gray-100'>
          <span className='font-bold text-gray-900 text-base'>{currency}{discountedPrice}</span>
          {course.discount > 0 && (
            <span className='text-gray-400 text-xs line-through'>{currency}{course.coursePrice}</span>
          )}
        </div>
      </div>
    </Link>
  )
}

export default CourseCard