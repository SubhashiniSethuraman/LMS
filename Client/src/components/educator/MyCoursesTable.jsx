import React from 'react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/table'
import { Badge } from '../ui/badge'
import { BookOpen } from 'lucide-react'
import { TableRowSkeleton } from '../ui/skeleton'

const MyCoursesTable = ({ courses, paginated, currency, loading }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Course</TableHead>
          <TableHead>Earnings</TableHead>
          <TableHead>Students</TableHead>
          <TableHead>Published</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading
          ? [...Array(5)].map((_, i) => <TableRowSkeleton key={i} cols={5} />)
          : paginated.length === 0
            ? (
              <TableRow>
                <TableCell colSpan={5} className='text-center py-16'>
                  <div className='flex flex-col items-center gap-3 text-gray-400'>
                     <BookOpen className='w-10 h-10' />
                     <p className='text-sm font-medium'>No courses yet. Add your first course!</p>
                  </div>
                </TableCell>
              </TableRow>
            )
            : paginated.map((course) => {
              const earnings = Math.floor(
                (course.enrolledStudents?.length || 0) *
                (course.coursePrice - course.discount * course.coursePrice / 100)
              )
              return (
                <TableRow key={course._id}>
                  <TableCell>
                    <div className='flex items-center gap-3'>
                      <img
                        src={course.courseThumbnail}
                        alt={course.courseTitle}
                        className='w-14 h-10 rounded-lg object-cover shrink-0'
                      />
                      <span className='font-medium text-gray-800 line-clamp-2 max-w-xs'>
                        {course.courseTitle}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className='font-semibold text-emerald-700'>
                    {currency}{earnings}
                  </TableCell>
                  <TableCell>{course.enrolledStudents?.length || 0}</TableCell>
                  <TableCell className='text-gray-500 text-sm'>
                    {new Date(course.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="success">Published</Badge>
                  </TableCell>
                </TableRow>
              )
            })
        }
      </TableBody>
    </Table>
  )
}

export default MyCoursesTable
