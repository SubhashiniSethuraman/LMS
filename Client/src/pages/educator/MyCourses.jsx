import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import { toast } from 'sonner'
import { Breadcrumb } from '../../components/ui/breadcrumb'
import { Pagination } from '../../components/ui/pagination'
import MyCoursesTable from '../../components/educator/MyCoursesTable'

const ITEMS_PER_PAGE = 8

const MyCourses = () => {

  const { currency, URL, getToken, isEducator } = useContext(AppContext)
  const [ courses, setCourses ] = useState(null)
  const [ currentPage, setCurrentPage ] = useState(1)

  const fetchEducatorCourses = async () => {
    try {
      const token = await getToken()
      const res = await fetch(`${URL}/educator/courses`,{
        method: 'GET',
        headers: {
          "Content-type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      })
      const data = await res.json()
      if(res.status === 200) {
        setCourses(data.courses)
      } else {
        toast.error(data.message || 'Failed to load courses.')
      }
    } catch(error) {
      toast.error('Network error. Please try again.')
    }
  }

  useEffect(() => {
    if(isEducator){ fetchEducatorCourses() }
  },[isEducator])

  const totalPages = courses ? Math.ceil(courses.length / ITEMS_PER_PAGE) : 0
  const paginated = courses
    ? courses.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
    : []

  return (
    <div className='p-6 md:p-8'>
      <Breadcrumb items={[{ label: 'My Courses' }]} className='mb-4' />
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>My Courses</h1>
          <p className='text-gray-500 text-sm'>
            {courses != null ? `${courses.length} course${courses.length !== 1 ? 's' : ''} published` : 'Loading...'}
          </p>
        </div>
      </div>

      <div className='rounded-2xl border border-gray-200 overflow-hidden shadow-sm max-w-5xl'>
        <MyCoursesTable
          courses={courses}
          paginated={paginated}
          currency={currency}
          loading={courses === null}
        />
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(p) => { setCurrentPage(p); scrollTo(0,0) }}
      />
    </div>
  )
}

export default MyCourses