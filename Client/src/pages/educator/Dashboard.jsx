import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import { toast } from 'sonner'
import { Breadcrumb } from '../../components/ui/breadcrumb'
import { StatCardSkeleton } from '../../components/ui/skeleton'
import { Users, BookOpen, DollarSign, TrendingUp } from 'lucide-react'
import StatCard from '../../components/educator/StatCard'
import StudentsEnrolledTable from '../../components/educator/StudentsEnrolledTable'

const Dashboard = () => {

  const { currency, URL, getToken, isEducator } = useContext(AppContext)
  const [ dashboardData, setDashboardData ] = useState(null)
  const [ loading, setLoading ] = useState(true)

  const fetchDashboardData = async () => {
    try {
      const token = await getToken()
      const res = await fetch(`${URL}/educator/dashboard`, {
        method: 'GET',
        headers: {
          "Content-type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      })
      const data = await res.json()
      if(res.status === 200) {
        setDashboardData(data.dashboardData)
      } else {
        toast.error(data.message || 'Failed to load dashboard data.')
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if(isEducator) { fetchDashboardData() }
  },[isEducator])

  const statCards = dashboardData ? [
    {
      icon: Users,
      value: dashboardData.enrolledStudentsData?.length || 0,
      label: 'Total Enrolments',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
    },
    {
      icon: BookOpen,
      value: dashboardData.totalCourses,
      label: 'Total Courses',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
    },
    {
      icon: DollarSign,
      value: `${currency}${dashboardData.totalEarnings}`,
      label: 'Total Earnings',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
    },
  ] : []

  return (
    <div className='p-6 md:p-8 space-y-8'>
      <div>
        <Breadcrumb items={[{ label: 'Dashboard' }]} className='mb-2' />
        <h1 className='text-2xl font-bold text-gray-900'>Dashboard</h1>
        <p className='text-gray-500 text-sm'>Your teaching overview at a glance.</p>
      </div>

      {/* Stat cards */}
      <div className='flex flex-wrap gap-5'>
        {loading
          ? [...Array(3)].map((_, i) => <StatCardSkeleton key={i} />)
          : statCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))
        }
      </div>

      {/* Latest enrollments table */}
      <div>
        <div className='flex items-center gap-2 mb-4'>
          <TrendingUp className='w-5 h-5 text-emerald-600' />
          <h2 className='text-lg font-bold text-gray-900'>Latest Enrolments</h2>
        </div>
        <div className='rounded-2xl border border-gray-200 overflow-hidden shadow-sm max-w-4xl'>
          <StudentsEnrolledTable
            enrolledStudents={dashboardData?.enrolledStudentsData}
            loading={loading}
            limit={5}
          />
        </div>
      </div>
    </div>
  )
}

export default Dashboard