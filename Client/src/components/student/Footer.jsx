import React from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap, Mail } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

// Custom SVG components for brand icons that are not exported by lucide-react
const Twitter = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
)

const Github = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
)

const Linkedin = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
)

const Youtube = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <polygon points="10 15 15 12 10 9" />
  </svg>
)

const Footer = () => {
  return (
    <footer className='w-full bg-gray-950 text-white mt-10'>
      <div className='max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-14'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-10'>

          {/* Brand */}
          <div className='md:col-span-1'>
            <div className='flex items-center gap-2 mb-4'>
              <div className='w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center'>
                <GraduationCap className='w-5 h-5 text-white' />
              </div>
              <span className='text-xl font-bold'>Edu<span className='text-emerald-400'>emy</span></span>
            </div>
            <p className='text-gray-400 text-sm leading-relaxed'>
              Empowering learners worldwide with world-class courses and expert instructors.
            </p>
            <div className='flex items-center gap-3 mt-5'>
              {[Twitter, Github, Linkedin, Youtube].map((Icon, i) => (
                <a key={i} href='#' className='w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-emerald-600 transition-colors'>
                  <Icon className='w-4 h-4 text-gray-300' />
                </a>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className='font-semibold text-white mb-4 text-sm uppercase tracking-wider'>Company</h3>
            <ul className='space-y-3'>
              {[
                { label: 'Home', to: '/' },
                { label: 'About Us', to: '#' },
                { label: 'Courses', to: '/course-list' },
                { label: 'Contact Us', to: '#' },
                { label: 'Privacy Policy', to: '#' },
              ].map(item => (
                <li key={item.label}>
                  <Link to={item.to} className='text-gray-400 hover:text-emerald-400 text-sm transition-colors'>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className='font-semibold text-white mb-4 text-sm uppercase tracking-wider'>Resources</h3>
            <ul className='space-y-3'>
              {['Blog', 'Documentation', 'Community', 'Help Center', 'Terms of Service'].map(item => (
                <li key={item}>
                  <a href='#' className='text-gray-400 hover:text-emerald-400 text-sm transition-colors'>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className='font-semibold text-white mb-4 text-sm uppercase tracking-wider'>Stay Updated</h3>
            <p className='text-gray-400 text-sm mb-4'>
              Get the latest courses and articles delivered to your inbox weekly.
            </p>
            <div className='flex flex-col gap-2'>
              <Input
                type='email'
                placeholder='your@email.com'
                className='bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus-visible:ring-emerald-500 focus-visible:border-emerald-500'
              />
              <Button className='w-full bg-emerald-600 hover:bg-emerald-700 gap-2'>
                <Mail className='w-4 h-4' />
                Subscribe
              </Button>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className='border-t border-white/10'>
        <div className='max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-4 flex flex-col md:flex-row items-center justify-between gap-2'>
          <p className='text-gray-500 text-xs'>© 2026 Eduemy. All rights reserved.</p>
          <div className='flex items-center gap-4'>
            <a href='#' className='text-gray-500 hover:text-emerald-400 text-xs transition-colors'>Privacy</a>
            <a href='#' className='text-gray-500 hover:text-emerald-400 text-xs transition-colors'>Terms</a>
            <a href='#' className='text-gray-500 hover:text-emerald-400 text-xs transition-colors'>Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer