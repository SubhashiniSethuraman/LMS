import React, { useContext } from 'react'
import SearchBar from './SearchBar'
import { AppContext } from '../../context/AppContext'
import { Button } from '../ui/button'
import { BookOpen, Users, Award } from 'lucide-react'
import { useClerk, useUser } from '@clerk/clerk-react'

const stats = [
  { icon: Users, value: '50K+', label: 'Active Learners' },
  { icon: BookOpen, value: '200+', label: 'Expert Courses' },
  { icon: Award, value: '95%', label: 'Completion Rate' },
]

const Hero = () => {
  const { navigate } = useContext(AppContext)
  const { openSignIn } = useClerk()
  const { user } = useUser()

  return (
    <div className='relative w-full overflow-hidden hero-gradient'>
      {/* Decorative blobs */}
      <div className='absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none' />
      <div className='absolute bottom-0 left-0 w-[400px] h-[400px] bg-green-200/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none' />

      <div className='relative z-10 flex flex-col items-center justify-center w-full pt-16 pb-20 px-6 md:px-0 space-y-8 text-center'>

        {/* Pill badge */}
        <div className='inline-flex items-center gap-2 bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-semibold px-4 py-1.5 rounded-full animate-fade-in'>
          <span className='w-2 h-2 bg-emerald-500 rounded-full animate-pulse' />
          New courses added every week
        </div>

        {/* Headline */}
        <h1 className='md:text-home-heading-large text-home-heading-small font-extrabold text-gray-900 max-w-4xl mx-auto leading-tight animate-slide-up'>
          Empower your future with{' '}
          <span className='relative inline-block'>
            <span className='text-emerald-600'>expert-led</span>
            <svg className='absolute -bottom-1 left-0 w-full' viewBox='0 0 200 8' fill='none'>
              <path d='M0 6 Q50 0 100 5 Q150 10 200 4' stroke='#10b981' strokeWidth='2.5' fill='none' strokeLinecap='round'/>
            </svg>
          </span>{' '}
          courses.
        </h1>

        {/* Subtext */}
        <p className='text-gray-500 max-w-2xl mx-auto text-base md:text-lg leading-relaxed animate-fade-in'>
          World-class instructors, interactive content, and a supportive community — all designed to help you achieve your personal and professional goals.
        </p>

        {/* Search */}
        <div className='w-full max-w-2xl animate-fade-in'>
          <SearchBar />
        </div>

        {/* CTA buttons */}
        {!user && (
          <div className='flex items-center gap-4 animate-fade-in'>
            <Button
              size="lg"
              onClick={() => openSignIn()}
              className='bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-8 shadow-lg shadow-emerald-200'
            >
              Start Learning Free
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => navigate('/course-list')}
              className='text-gray-700 hover:text-emerald-700'
            >
              Browse Courses →
            </Button>
          </div>
        )}

        {/* Stats row */}
        <div className='flex flex-wrap justify-center gap-8 pt-6 border-t border-emerald-100 w-full max-w-2xl animate-fade-in'>
          {stats.map(({ icon: Icon, value, label }) => (
            <div key={label} className='flex items-center gap-2 text-left'>
              <div className='w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center'>
                <Icon className='w-4 h-4 text-emerald-600' />
              </div>
              <div>
                <p className='font-bold text-gray-900 text-lg leading-none'>{value}</p>
                <p className='text-gray-500 text-xs'>{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Hero