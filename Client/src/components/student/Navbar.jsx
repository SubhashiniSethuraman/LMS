import React, { useContext, useState, useEffect } from 'react'
import { assets } from '../../assets/assets'
import { Link } from 'react-router-dom'
import { useClerk, UserButton, useUser } from '@clerk/clerk-react'
import { AppContext } from '../../context/AppContext'
import { toast } from 'sonner'
import { Button } from '../ui/button'
import { GraduationCap, BookOpen, Menu, X } from 'lucide-react'

const Navbar = () => {

  const isCourseListPage = location.pathname.includes('/course-list')
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const {openSignIn} = useClerk()
  const {user} = useUser()

  const {navigate, isEducator, URL, setIsEducator, getToken} = useContext(AppContext)

  const becomeEducator = async () => {
    setMobileOpen(false)
    try {
        if(isEducator) {
          navigate('/educator')
          return;
        }

        const token = await getToken()
        const res = await fetch(`${URL}/educator/update-role`, {
          method: 'POST',
          headers: {
            "Content-type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        })

        const data = await res.json()
        if(res.status === 200) {
          setIsEducator(true)
          toast.success(data.message)
        } else {
          toast.error(data.message)
        }
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || isCourseListPage
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-emerald-100'
          : 'bg-transparent'
      }`}>
        <div className='flex items-center justify-between px-4 sm:px-8 md:px-14 lg:px-24 py-3.5'>
          
          {/* Logo */}
          <div
            onClick={() => navigate('/')}
            className='flex items-center gap-2 cursor-pointer group'
          >
            <div className='w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center shadow-md group-hover:bg-emerald-700 transition-colors'>
              <GraduationCap className='w-5 h-5 text-white' />
            </div>
            <span className='text-xl font-bold text-gray-900 tracking-tight'>
              Edu<span className='text-emerald-600'>emy</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <div className='hidden md:flex items-center gap-2'>
            {user && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={becomeEducator}
                  className='text-gray-600 hover:text-emerald-700 gap-1.5'
                >
                  <GraduationCap className='w-4 h-4' />
                  {isEducator ? 'Educator Dashboard' : 'Become Educator'}
                </Button>
                <Link to='/my-enrollments'>
                  <Button variant="ghost" size="sm" className='text-gray-600 hover:text-emerald-700 gap-1.5'>
                    <BookOpen className='w-4 h-4' />
                    My Enrollments
                  </Button>
                </Link>
              </>
            )}
            {user
              ? <div className='ml-2'><UserButton /></div>
              : (
                <Button
                  onClick={() => openSignIn()}
                  size="sm"
                  className='ml-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-5 shadow-md shadow-emerald-200'
                >
                  Get Started
                </Button>
              )
            }
          </div>

          {/* Mobile toggle */}
          <button
            className='md:hidden p-2 rounded-lg text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors'
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className='w-5 h-5' /> : <Menu className='w-5 h-5' />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className='md:hidden bg-white border-t border-emerald-100 px-4 py-4 flex flex-col gap-2 shadow-lg animate-fade-in'>
            {user ? (
              <>
                <button
                  onClick={becomeEducator}
                  className='flex items-center gap-2 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 text-sm font-medium transition-colors text-left'
                >
                  <GraduationCap className='w-4 h-4' />
                  {isEducator ? 'Educator Dashboard' : 'Become Educator'}
                </button>
                <Link
                  to='/my-enrollments'
                  onClick={() => setMobileOpen(false)}
                  className='flex items-center gap-2 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 text-sm font-medium transition-colors'
                >
                  <BookOpen className='w-4 h-4' />
                  My Enrollments
                </Link>
                <div className='px-3 py-2'>
                  <UserButton />
                </div>
              </>
            ) : (
              <Button
                onClick={() => { openSignIn(); setMobileOpen(false) }}
                className='w-full bg-emerald-600 hover:bg-emerald-700'
              >
                Get Started
              </Button>
            )}
          </div>
        )}
      </nav>
      {/* Spacer for fixed navbar */}
      <div className='h-[60px]' />
    </>
  )
}

export default Navbar