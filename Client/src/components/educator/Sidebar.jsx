import React, { useContext } from 'react'
import { AppContext } from '../../context/AppContext'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, PlusCircle, BookMarked, Users
} from 'lucide-react'

const menuItems = [
  { name: 'Dashboard', path: '/educator', icon: LayoutDashboard },
  { name: 'Add Course', path: '/educator/add-course', icon: PlusCircle },
  { name: 'My Courses', path: '/educator/my-courses', icon: BookMarked },
  { name: 'Students Enrolled', path: '/educator/student-enrolled', icon: Users },
]

const Sidebar = () => {

  const { isEducator } = useContext(AppContext)

  return isEducator && (
    <aside className='md:w-56 w-16 border-r border-gray-200 min-h-[calc(100vh-57px)] bg-white flex flex-col py-4 shrink-0'>
      {menuItems.map(({ name, path, icon: Icon }) => (
        <NavLink
          to={path}
          key={name}
          end={path === '/educator'}
          className={({ isActive }) =>
            `flex items-center md:gap-3 gap-0 md:flex-row flex-col md:px-5 px-0 py-3 mx-2 rounded-xl text-sm font-medium transition-all duration-150 group
            ${isActive
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800 border border-transparent'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${isActive ? 'bg-emerald-100' : 'bg-gray-100 group-hover:bg-gray-200'} transition-colors`}>
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-gray-500'}`} />
              </div>
              <span className='md:block hidden truncate'>{name}</span>
            </>
          )}
        </NavLink>
      ))}
    </aside>
  )
}

export default Sidebar