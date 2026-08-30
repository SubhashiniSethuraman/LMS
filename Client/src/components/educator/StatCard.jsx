import React from 'react'

const StatCard = ({ icon: Icon, value, label, color, bg, border }) => {
  return (
    <div className={`flex items-center gap-4 border ${border} ${bg} p-5 rounded-2xl min-w-52 shadow-sm`}>
      <div className={`w-12 h-12 rounded-xl ${bg} border ${border} flex items-center justify-center shrink-0`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div>
        <p className='text-2xl font-bold text-gray-900'>{value}</p>
        <p className='text-sm text-gray-500 mt-0.5'>{label}</p>
      </div>
    </div>
  )
}

export default StatCard
