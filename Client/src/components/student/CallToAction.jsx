import React from 'react'
import { useClerk, useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'
import { ArrowRight, Zap } from 'lucide-react'

const CallToAction = () => {
  const { openSignIn } = useClerk()
  const { user } = useUser()
  const navigate = useNavigate()

  return (
    <section className='w-full px-6 md:px-24 py-8 pb-20'>
      <div className='relative bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 rounded-3xl overflow-hidden px-8 md:px-16 py-16 text-center'>
        {/* Background decoration */}
        <div className='absolute top-0 left-0 w-full h-full opacity-10'>
          <div className='absolute top-4 left-12 w-40 h-40 bg-white rounded-full blur-2xl' />
          <div className='absolute bottom-4 right-12 w-52 h-52 bg-emerald-300 rounded-full blur-2xl' />
        </div>

        {/* Badge */}
        <div className='relative inline-flex items-center gap-2 bg-white/20 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6 border border-white/30 backdrop-blur-sm'>
          <Zap className='w-3.5 h-3.5 fill-yellow-400 text-yellow-400' />
          Start your journey today
        </div>

        <h2 className='relative text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight'>
          Learn anything, anytime,
          <br />anywhere
        </h2>
        <p className='relative text-emerald-100 max-w-xl mx-auto mb-10 text-base'>
          Join over 50,000 learners who are advancing their skills and careers. Access 200+ courses from industry experts.
        </p>

        <div className='relative flex flex-col sm:flex-row items-center justify-center gap-4'>
          <Button
            size="xl"
            onClick={() => user ? navigate('/course-list') : openSignIn()}
            className='bg-white text-emerald-700 hover:bg-emerald-50 font-bold rounded-full px-10 shadow-xl shadow-emerald-900/30 h-13'
          >
            {user ? 'Explore Courses' : 'Get Started for Free'}
            <ArrowRight className='w-4 h-4 ml-1' />
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onClick={() => navigate('/course-list')}
            className='text-white hover:bg-white/10 hover:text-white border border-white/30 rounded-full'
          >
            Browse all courses
          </Button>
        </div>
      </div>
    </section>
  )
}

export default CallToAction