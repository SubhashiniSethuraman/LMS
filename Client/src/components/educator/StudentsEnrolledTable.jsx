import React from 'react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/table'
import { Users } from 'lucide-react'
import { TableRowSkeleton } from '../ui/skeleton'

const StudentsEnrolledTable = ({ enrolledStudents, paginated, loading, limit, currentPage = 1, ITEMS_PER_PAGE = 10 }) => {
  const displayData = limit ? enrolledStudents?.slice(0, limit) : paginated

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className='hidden sm:table-cell w-12 text-center'>#</TableHead>
          <TableHead>Student Name</TableHead>
          <TableHead>Course Title</TableHead>
          {!limit && <TableHead className='hidden sm:table-cell'>Enrolled On</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading
          ? [...Array(limit || 6)].map((_, i) => <TableRowSkeleton key={i} cols={limit ? 3 : 4} />)
          : !displayData || displayData.length === 0
            ? (
              <TableRow>
                <TableCell colSpan={limit ? 3 : 4} className='text-center py-16'>
                  <div className='flex flex-col items-center gap-3 text-gray-400'>
                    <Users className='w-10 h-10' />
                    <p className='text-sm font-medium'>No students enrolled yet.</p>
                  </div>
                </TableCell>
              </TableRow>
            )
            : displayData.map((item, index) => {
              const globalIndex = limit ? index : (currentPage - 1) * ITEMS_PER_PAGE + index
              const initials = item.student?.name
                ? item.student.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)
                : 'S'
              return (
                <TableRow key={index}>
                  <TableCell className='hidden sm:table-cell text-center text-gray-400 font-medium'>
                    {globalIndex + 1}
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-3'>
                      {item.student?.imageUrl ? (
                        <img
                          src={item.student.imageUrl}
                          alt={item.student.name}
                          className='w-9 h-9 rounded-full object-cover ring-2 ring-emerald-100 shrink-0'
                        />
                      ) : (
                        <div className='w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0'>
                          {initials}
                        </div>
                      )}
                      <span className='font-medium text-gray-800 truncate'>{item.student?.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className='text-gray-600 truncate max-w-xs'>{item.courseTitle}</TableCell>
                  {!limit && (
                    <TableCell className='hidden sm:table-cell text-gray-400 text-sm'>
                      {new Date(item.purchaseDate).toLocaleDateString()}
                    </TableCell>
                  )}
                </TableRow>
              )
            })
        }
      </TableBody>
    </Table>
  )
}

export default StudentsEnrolledTable
