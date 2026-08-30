import React from 'react'
import { dummyTestimonial } from '../../assets/assets'
import { Star, Quote } from 'lucide-react'

const Testimonials = () => {
  return (
    <section className='w-full py-16 md:px-24 px-6'>
      {/* Header */}
      <div className='text-center mb-12'>
        <div className='inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-3'>
          <Quote className='w-3.5 h-3.5' />
          Success Stories
        </div>
        <h2 className='text-3xl md:text-4xl font-bold text-gray-900'>What our learners say</h2>
        <p className='text-gray-500 mt-3 max-w-2xl mx-auto'>
          Hear from our community as they share their journeys of transformation and how our platform has made a difference.
        </p>
      </div>

      {/* Cards grid */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {dummyTestimonial.map((t, i) => (
          <div
            key={i}
            className='relative flex flex-col bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-300 overflow-hidden p-6'
          >
            {/* Quote mark */}
            <div className='absolute top-5 right-5 opacity-10'>
              <Quote className='w-10 h-10 text-emerald-600' />
            </div>

            {/* Stars */}
            <div className='flex gap-0.5 mb-4'>
              {[...Array(5)].map((_, j) => (
                <Star
                  key={j}
                  className={`w-4 h-4 ${j < Math.floor(t.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`}
                />
              ))}
            </div>

            {/* Feedback */}
            <p className='text-gray-600 text-sm leading-relaxed flex-1'>"{t.feedback}"</p>

            {/* Author */}
            <div className='flex items-center gap-3 mt-6 pt-5 border-t border-gray-100'>
              <img
                src={t.image}
                alt={t.name}
                className='w-11 h-11 rounded-full object-cover ring-2 ring-emerald-200'
              />
              <div>
                <p className='font-semibold text-gray-900 text-sm'>{t.name}</p>
                <p className='text-emerald-600 text-xs font-medium'>{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Testimonials