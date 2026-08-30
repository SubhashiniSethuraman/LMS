import React, { useEffect, useState } from 'react'
import { Star } from 'lucide-react'

const Rating = ({initialRating, onRate}) => {

  const [rating, setRating] = useState(initialRating || 0)
  const [hovered, setHovered] = useState(0)

  const handleRating = (value) => {
    setRating(value)
    if(onRate) {
      onRate(value)
    }
  }

  useEffect(() => {
    if(initialRating) {
      setRating(initialRating)
    }
  },[initialRating])

  const displayRating = hovered || rating

  return (
    <div className='flex items-center gap-1'>
      {Array.from({length: 5}, (_, index) => {
        const starValue = index + 1
        const isActive = starValue <= displayRating
        return (
          <button
            key={index}
            type='button'
            onClick={() => handleRating(starValue)}
            onMouseEnter={() => setHovered(starValue)}
            onMouseLeave={() => setHovered(0)}
            className='transition-all duration-150 hover:scale-125 focus:outline-none focus:scale-125'
            aria-label={`Rate ${starValue} stars`}
          >
            <Star
              className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors duration-150 ${
                isActive
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-gray-300 fill-gray-200 hover:text-amber-300'
              }`}
            />
          </button>
        )
      })}
      {rating > 0 && (
        <span className='ml-2 text-sm font-medium text-gray-600'>
          {rating}/5
        </span>
      )}
    </div>
  )
}

export default Rating