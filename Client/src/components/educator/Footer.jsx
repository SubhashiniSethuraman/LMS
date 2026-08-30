import React from 'react'
import { GraduationCap } from 'lucide-react'

const Footer = () => {
  return (
    <footer className='border-t border-gray-200 py-4 px-8 text-center bg-white'>
      <div className='flex items-center justify-center gap-2 text-sm text-gray-400'>
        <div className='w-5 h-5 bg-emerald-600 rounded flex items-center justify-center'>
          <GraduationCap className='w-3 h-3 text-white' />
        </div>
        <span>© 2026 <span className='font-semibold text-emerald-600'>Eduemy</span>. All rights reserved.</span>
      </div>
    </footer>
  )
}

export default Footer