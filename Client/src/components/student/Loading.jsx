import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'

const Loading = () => {

  const {path} = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    if(path) {
      const timer = setTimeout(() => {navigate(`/${path}`)}, 5000)
      return () => clearTimeout(timer)
    }
  },[])

  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-white gap-6'>
      {/* Spinner */}
      <div className='relative w-20 h-20'>
        <div className='absolute inset-0 rounded-full border-4 border-emerald-100'></div>
        <div className='absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500 animate-spin'></div>
        <div className='absolute inset-0 flex items-center justify-center'>
          <GraduationCap className='w-7 h-7 text-emerald-600' />
        </div>
      </div>

      <div className='text-center'>
        <p className='text-gray-700 font-semibold text-lg'>Loading...</p>
        <p className='text-gray-400 text-sm mt-1'>Please wait a moment</p>
      </div>

      {/* Progress dots */}
      <div className='flex gap-1.5'>
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className='w-2 h-2 rounded-full bg-emerald-400 animate-bounce'
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}

export default Loading