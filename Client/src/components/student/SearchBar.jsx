import React, { useState } from 'react'
import { Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'

const SearchBar = ({data}) => {

  const navigate = useNavigate()
  const [input, setInput] = useState(data ? data : '')

  const onSearchHandler = (e) => {
    e.preventDefault()
    navigate('/course-list/' + input)
  }

  return (
    <form
      onSubmit={onSearchHandler}
      className='w-full flex items-center bg-white border-2 border-emerald-200 rounded-2xl shadow-md shadow-emerald-100/50 overflow-hidden transition-all duration-200 focus-within:border-emerald-500 focus-within:shadow-emerald-200'
    >
      <div className='pl-4 pr-2 flex items-center'>
        <Search className='w-5 h-5 text-emerald-400' />
      </div>
      <input
        onChange={e => setInput(e.target.value)}
        value={input}
        type='text'
        placeholder='Search for courses, topics, or skills...'
        className='flex-1 h-12 md:h-14 text-gray-700 text-sm md:text-base outline-none bg-transparent placeholder:text-gray-400'
      />
      <div className='p-1.5'>
        <Button
          type='submit'
          className='h-9 md:h-11 px-5 md:px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium'
        >
          Search
        </Button>
      </div>
    </form>
  )
}

export default SearchBar