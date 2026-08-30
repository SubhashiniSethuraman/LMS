import React from 'react'
import { assets } from '../../assets/assets'

const logos = [
  { src: assets.microsoft_logo, alt: 'Microsoft' },
  { src: assets.walmart_logo, alt: 'Walmart' },
  { src: assets.accenture_logo, alt: 'Accenture' },
  { src: assets.adobe_logo, alt: 'Adobe' },
  { src: assets.paypal_logo, alt: 'PayPal' },
]

const Companies = () => {
  return (
    <div className='w-full py-12 px-6 md:px-0'>
      <p className='text-center text-sm font-medium text-gray-400 uppercase tracking-widest mb-8'>
        Trusted by learners from top companies
      </p>
      <div className='relative overflow-hidden'>
        {/* Fade edges */}
        <div className='absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none' />
        <div className='absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none' />

        <div className='flex animate-marquee whitespace-nowrap'>
          {[...logos, ...logos].map((logo, i) => (
            <div
              key={i}
              className='flex-shrink-0 mx-10 flex items-center justify-center opacity-50 hover:opacity-80 transition-opacity grayscale hover:grayscale-0 duration-300'
            >
              <img src={logo.src} alt={logo.alt} className='h-7 md:h-9 object-contain' />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Companies