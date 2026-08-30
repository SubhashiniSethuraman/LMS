import React from 'react'
import { UserButton, useUser } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { GraduationCap, Bell } from 'lucide-react'

const Navbar = () => {
  const { user } = useUser()

  return (
    <div className='flex items-center justify-between px-4 md:px-8 border-b border-gray-200 py-3 bg-white sticky top-0 z-50'>
      <Link to='/' className='flex items-center gap-2 group'>
        <div className='w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-emerald-700 transition-colors'>
          <GraduationCap className='w-4.5 h-4.5 text-white' />
        </div>
        <span className='text-lg font-bold text-gray-900 tracking-tight'>
          Edu<span className='text-emerald-600'>emy</span>
        </span>
        <span className='ml-2 text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full'>
          Educator
        </span>
      </Link>

      <div className='flex items-center gap-4'>
        <button className='relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors'>
          <Bell className='w-4.5 h-4.5' />
        </button>
        <div className='flex items-center gap-2.5'>
          <div className='text-right hidden sm:block'>
            <p className='text-sm font-semibold text-gray-900 leading-none'>
              {user ? user.fullName : 'Educator'}
            </p>
            <p className='text-xs text-emerald-600 mt-0.5'>Instructor</p>
          </div>
          {user
            ? <UserButton />
            : <div className='w-8 h-8 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-sm'>E</div>
          }
        </div>
      </div>
    </div>
  )
}

export default Navbar