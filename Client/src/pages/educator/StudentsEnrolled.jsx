import React, { useEffect, useState, useContext } from 'react'
import { AppContext } from '../../context/AppContext'
import { toast } from 'sonner'
import { Breadcrumb } from '../../components/ui/breadcrumb'
import { Pagination } from '../../components/ui/pagination'
import StudentsEnrolledTable from '../../components/educator/StudentsEnrolledTable'

const ITEMS_PER_PAGE = 10

const StudentsEnrolled = () => {

  const [ enrolledStudents, setEnrolledStudents ] = useState(null)
  const [ currentPage, setCurrentPage ] = useState(1)

  const { URL, getToken, isEducator } = useContext(AppContext)

  const fetchEnrolledStudents = async () => {
    try {
      const token = await getToken()
      const res = await fetch(`${URL}/educator/enrolled-students`, {
        method: 'GET',
        headers: {
          "Content-type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      })
      const data = await res.json()
      if(data.success) {
        setEnrolledStudents(data.enrolledStudents.reverse())
      } else {
        toast.error(data.message || 'Failed to load enrolled students.')
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
    }
  }

  useEffect(() => {
    if(isEducator) { fetchEnrolledStudents() }
  }, [isEducator])

  const totalPages = enrolledStudents ? Math.ceil(enrolledStudents.length / ITEMS_PER_PAGE) : 0
  const paginated = enrolledStudents
    ? enrolledStudents.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
    : []

  return (
    <div className='p-6 md:p-8'>
      <Breadcrumb items={[{ label: 'Students Enrolled' }]} className='mb-4' />
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Students Enrolled</h1>
          <p className='text-gray-500 text-sm'>
            {enrolledStudents !== null
              ? `${enrolledStudents.length} student${enrolledStudents.length !== 1 ? 's' : ''} enrolled`
              : 'Loading...'}
          </p>
        </div>
      </div>

      <div className='rounded-2xl border border-gray-200 overflow-hidden shadow-sm max-w-5xl'>
        <StudentsEnrolledTable
          enrolledStudents={enrolledStudents}
          paginated={paginated}
          loading={enrolledStudents === null}
          currentPage={currentPage}
          ITEMS_PER_PAGE={ITEMS_PER_PAGE}
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

export default StudentsEnrolled