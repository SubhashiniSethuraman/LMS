import React, { useRef, useState, useEffect } from 'react'
import uniqid from 'uniqid'
import Quill from 'quill'
import { useContext } from 'react'
import { AppContext } from '../../context/AppContext'
import { toast } from 'sonner'
import { Breadcrumb } from '../../components/ui/breadcrumb'
import { Button } from '../../components/ui/button'
import { Input, Label } from '../../components/ui/input'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '../../components/ui/dialog'
import {
  ChevronDown, Trash2, Plus, PlusCircle, Upload, ImageIcon,
  Link as LinkIcon, Clock, Eye, EyeOff
} from 'lucide-react'

const AddCourse = () => {

  const quillRef = useRef(null)
  const editorRef = useRef(null)

  const { URL, getToken } = useContext(AppContext)

  const [courseTitle, setCourseTitle] = useState('')
  const [coursePrice, setCoursePrice] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [image, setImage] = useState(null)
  const [chapters, setChapters] = useState([])
  const [showLectureDialog, setShowLectureDialog] = useState(false)
  const [showChapterDialog, setShowChapterDialog] = useState(false)
  const [newChapterTitle, setNewChapterTitle] = useState('')
  const [currentChapterId, setCurrentChapterId] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const [lectureDetails, setLectureDetails] = useState({
    lectureTitle: '',
    lectureDuration: '',
    lectureUrl: '',
    isPreviewFree: false,
  })

  const handleChapter = (action, chapterId) => {
    if(action === 'add') {
      setNewChapterTitle('')
      setShowChapterDialog(true)
    } else if (action === 'remove') {
      setChapters(chapters.filter(c => c.chapterId !== chapterId))
    } else if (action === 'toggle') {
      setChapters(chapters.map(c =>
        c.chapterId === chapterId ? {...c, collapsed: !c.collapsed} : c
      ))
    }
  }

  const confirmAddChapter = () => {
    if(!newChapterTitle.trim()) return toast.error('Chapter name cannot be empty.')
    const newChapter = {
      chapterId: uniqid(),
      chapterTitle: newChapterTitle.trim(),
      chapterContent: [],
      collapsed: false,
      chapterOrder: chapters.length > 0 ? chapters.slice(-1)[0].chapterOrder + 1 : 1,
    }
    setChapters([...chapters, newChapter])
    setShowChapterDialog(false)
    setNewChapterTitle('')
    toast.success(`Chapter "${newChapterTitle}" added.`)
  }

  const handleLecture = (action, chapterId, lectureIndex) => {
    if(action === 'add') {
      setCurrentChapterId(chapterId)
      setLectureDetails({ lectureTitle: '', lectureDuration: '', lectureUrl: '', isPreviewFree: false })
      setShowLectureDialog(true)
    } else if (action === 'remove') {
      setChapters(chapters.map(chapter => {
        if(chapter.chapterId === chapterId) {
          chapter.chapterContent.splice(lectureIndex, 1)
        }
        return chapter
      }))
    }
  }

  const addLecture = () => {
    if(!lectureDetails.lectureTitle.trim()) return toast.error('Lecture title is required.')
    if(!lectureDetails.lectureDuration) return toast.error('Duration is required.')
    if(!lectureDetails.lectureUrl.trim()) return toast.error('Lecture URL is required.')

    setChapters(chapters.map(chapter => {
      if(chapter.chapterId === currentChapterId) {
        const newLecture = {
          ...lectureDetails,
          lectureOrder: chapter.chapterContent.length > 0
            ? chapter.chapterContent.slice(-1)[0].lectureOrder + 1 : 1,
          lectureId: uniqid()
        }
        chapter.chapterContent.push(newLecture)
      }
      return chapter
    }))
    setShowLectureDialog(false)
    toast.success('Lecture added successfully.')
  }

  const handleSubmit = async (e) => {
    try {
      e.preventDefault()
      if(!image) {
        toast.error('Please select a course thumbnail.')
        return
      }
      if(chapters.length === 0) {
        toast.error('Please add at least one chapter.')
        return
      }

      setSubmitting(true)
      const courseData = {
        courseTitle,
        courseDescription: quillRef.current.root.innerHTML,
        coursePrice: Number(coursePrice),
        discount: Number(discount),
        courseContent: chapters
      }
      const formData = new FormData()
      formData.append('courseData', JSON.stringify(courseData))
      formData.append('image', image)

      const token = await getToken()
      const res = await fetch(`${URL}/educator/add-course`, {
        method: 'POST',
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      })

      const data = await res.json()
      if(res.status === 200 || res.status === 201) {
        toast.success(data.message || 'Course created successfully!')
        setCourseTitle('')
        setCoursePrice(0)
        setDiscount(0)
        setImage(null)
        setChapters([])
        quillRef.current.root.innerHTML = ''
      } else {
        toast.error(data.message || 'Failed to create course.')
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    if(!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, { theme: 'snow' })
    }
  }, [])

  return (
    <div className='p-6 md:p-8 overflow-auto'>
      <Breadcrumb items={[{ label: 'Add Course' }]} className='mb-4' />
      <h1 className='text-2xl font-bold text-gray-900 mb-1'>Add New Course</h1>
      <p className='text-gray-500 text-sm mb-8'>Fill in the details to publish a new course.</p>

      <form onSubmit={handleSubmit} className='flex flex-col gap-6 max-w-2xl'>

        {/* Course Title */}
        <div className='flex flex-col gap-1.5'>
          <Label htmlFor='courseTitle'>Course Title *</Label>
          <Input
            id='courseTitle'
            onChange={e => setCourseTitle(e.target.value)}
            value={courseTitle}
            type='text'
            placeholder='e.g. Complete React Developer Course'
            required
          />
        </div>

        {/* Course Description */}
        <div className='flex flex-col gap-1.5'>
          <Label>Course Description *</Label>
          <div className='rounded-lg overflow-hidden border border-gray-300'>
            <div ref={editorRef} className='min-h-32' />
          </div>
        </div>

        {/* Price + Thumbnail row */}
        <div className='grid grid-cols-2 gap-4'>
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='coursePrice'>Course Price ($) *</Label>
            <Input
              id='coursePrice'
              onChange={e => setCoursePrice(e.target.value)}
              value={coursePrice}
              type='number'
              min='0'
              placeholder='0'
              required
            />
          </div>
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='discount'>Discount (%) *</Label>
            <Input
              id='discount'
              onChange={e => setDiscount(e.target.value)}
              value={discount}
              type='number'
              min='0'
              max='100'
              placeholder='0'
              required
            />
          </div>
        </div>

        {/* Thumbnail upload */}
        <div className='flex flex-col gap-1.5'>
          <Label>Course Thumbnail *</Label>
          <label
            htmlFor='thumbnailImage'
            className='flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-emerald-400 rounded-xl p-6 cursor-pointer transition-colors bg-gray-50 hover:bg-emerald-50 group'
          >
            {image ? (
              <div className='flex flex-col items-center gap-2'>
                <img
                  src={window.URL.createObjectURL(image)}
                  alt='thumbnail preview'
                  className='max-h-32 rounded-lg object-contain'
                />
                <span className='text-emerald-600 text-sm font-medium'>{image.name}</span>
                <span className='text-gray-400 text-xs'>Click to change</span>
              </div>
            ) : (
              <div className='flex flex-col items-center gap-2 text-gray-400 group-hover:text-emerald-600 transition-colors'>
                <ImageIcon className='w-10 h-10' />
                <span className='text-sm font-medium'>Click to upload thumbnail</span>
                <span className='text-xs'>PNG, JPG up to 5MB</span>
              </div>
            )}
            <input
              type='file'
              id='thumbnailImage'
              onChange={e => setImage(e.target.files[0])}
              accept='image/*'
              hidden
            />
          </label>
        </div>

        {/* Chapters */}
        <div className='flex flex-col gap-3'>
          <div className='flex items-center justify-between'>
            <Label>Course Content</Label>
            <span className='text-xs text-gray-400'>{chapters.length} chapter{chapters.length !== 1 ? 's' : ''}</span>
          </div>

          {chapters.map((chapter, chapterIndex) => (
            <div key={chapterIndex} className='bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm'>
              <div className='flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50'>
                <div className='flex items-center gap-2'>
                  <button
                    type='button'
                    onClick={() => handleChapter('toggle', chapter.chapterId)}
                    className='text-gray-400 hover:text-emerald-600 transition-colors'
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform ${chapter.collapsed ? '-rotate-90' : ''}`} />
                  </button>
                  <span className='font-semibold text-gray-800 text-sm'>
                    {chapterIndex + 1}. {chapter.chapterTitle}
                  </span>
                </div>
                <div className='flex items-center gap-3'>
                  <span className='text-xs text-gray-400'>{chapter.chapterContent.length} lecture{chapter.chapterContent.length !== 1 ? 's' : ''}</span>
                  <button
                    type='button'
                    onClick={() => handleChapter('remove', chapter.chapterId)}
                    className='text-gray-400 hover:text-red-500 transition-colors p-1'
                  >
                    <Trash2 className='w-4 h-4' />
                  </button>
                </div>
              </div>

              {!chapter.collapsed && (
                <div className='p-4 space-y-2'>
                  {chapter.chapterContent.map((lecture, lectureIndex) => (
                    <div key={lectureIndex} className='flex justify-between items-center py-2 px-3 rounded-lg bg-gray-50 border border-gray-100'>
                      <div className='text-sm text-gray-700 flex items-center gap-2'>
                        <span className='text-gray-400 text-xs font-mono w-5 text-right'>{lectureIndex + 1}.</span>
                        <span className='font-medium'>{lecture.lectureTitle}</span>
                        <span className='text-gray-400'>·</span>
                        <span className='text-gray-400 text-xs flex items-center gap-1'>
                          <Clock className='w-3 h-3' />{lecture.lectureDuration}m
                        </span>
                        <a href={lecture.lectureUrl} target='_blank' rel='noreferrer' className='text-emerald-500 hover:text-emerald-700 ml-1'>
                          <LinkIcon className='w-3.5 h-3.5' />
                        </a>
                        {lecture.isPreviewFree && (
                          <span className='text-xs bg-emerald-100 text-emerald-700 rounded-full px-2 py-0.5 font-medium'>Free</span>
                        )}
                      </div>
                      <button
                        type='button'
                        onClick={() => handleLecture('remove', chapter.chapterId, lectureIndex)}
                        className='text-gray-400 hover:text-red-500 transition-colors shrink-0 p-1'
                      >
                        <Trash2 className='w-3.5 h-3.5' />
                      </button>
                    </div>
                  ))}

                  <button
                    type='button'
                    onClick={() => handleLecture('add', chapter.chapterId)}
                    className='flex items-center gap-2 text-emerald-600 hover:text-emerald-800 text-sm font-medium mt-2 px-3 py-2 rounded-lg hover:bg-emerald-50 transition-colors w-full'
                  >
                    <Plus className='w-4 h-4' />
                    Add Lecture
                  </button>
                </div>
              )}
            </div>
          ))}

          <button
            type='button'
            onClick={() => handleChapter('add')}
            className='flex items-center justify-center gap-2 border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-xl py-3 text-emerald-600 hover:text-emerald-800 font-medium text-sm transition-colors hover:bg-emerald-50'
          >
            <PlusCircle className='w-5 h-5' />
            Add Chapter
          </button>
        </div>

        {/* Submit */}
        <div className='flex gap-3 pt-2'>
          <Button type='submit' disabled={submitting} size='lg' className='px-8'>
            {submitting ? 'Creating...' : 'Publish Course'}
          </Button>
          <Button type='button' variant='outline' size='lg' onClick={() => window.history.back()}>
            Cancel
          </Button>
        </div>
      </form>

      {/* Chapter Name Dialog */}
      <Dialog open={showChapterDialog} onOpenChange={setShowChapterDialog}>
        <DialogContent className='max-w-sm'>
          <DialogHeader>
            <DialogTitle>Add New Chapter</DialogTitle>
          </DialogHeader>
          <div className='flex flex-col gap-1.5 py-2'>
            <Label htmlFor='chapterName'>Chapter Name</Label>
            <Input
              id='chapterName'
              autoFocus
              placeholder='e.g. Introduction to React'
              value={newChapterTitle}
              onChange={e => setNewChapterTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && confirmAddChapter()}
            />
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setShowChapterDialog(false)}>Cancel</Button>
            <Button onClick={confirmAddChapter}>Add Chapter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Lecture Dialog */}
      <Dialog open={showLectureDialog} onOpenChange={setShowLectureDialog}>
        <DialogContent className='max-w-sm'>
          <DialogHeader>
            <DialogTitle>Add New Lecture</DialogTitle>
          </DialogHeader>

          <div className='flex flex-col gap-4 py-2'>
            <div className='flex flex-col gap-1.5'>
              <Label htmlFor='lectureTitle'>Lecture Title *</Label>
              <Input
                id='lectureTitle'
                placeholder='e.g. Setting up the environment'
                value={lectureDetails.lectureTitle}
                onChange={e => setLectureDetails({...lectureDetails, lectureTitle: e.target.value})}
              />
            </div>
            <div className='flex flex-col gap-1.5'>
              <Label htmlFor='lectureDuration'>Duration (minutes) *</Label>
              <Input
                id='lectureDuration'
                type='number'
                min='1'
                placeholder='15'
                value={lectureDetails.lectureDuration}
                onChange={e => setLectureDetails({...lectureDetails, lectureDuration: e.target.value})}
              />
            </div>
            <div className='flex flex-col gap-1.5'>
              <Label htmlFor='lectureUrl'>Lecture URL (YouTube) *</Label>
              <Input
                id='lectureUrl'
                placeholder='https://youtu.be/...'
                value={lectureDetails.lectureUrl}
                onChange={e => setLectureDetails({...lectureDetails, lectureUrl: e.target.value})}
              />
            </div>
            <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200'>
              <button
                type='button'
                onClick={() => setLectureDetails({...lectureDetails, isPreviewFree: !lectureDetails.isPreviewFree})}
                className={`relative w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                  lectureDetails.isPreviewFree ? 'bg-emerald-500' : 'bg-gray-300'
                }`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                  lectureDetails.isPreviewFree ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </button>
              <div className='flex items-center gap-1.5'>
                {lectureDetails.isPreviewFree
                  ? <Eye className='w-4 h-4 text-emerald-600' />
                  : <EyeOff className='w-4 h-4 text-gray-400' />
                }
                <Label className='cursor-pointer'>
                  {lectureDetails.isPreviewFree ? 'Free Preview' : 'Paid Only'}
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setShowLectureDialog(false)}>Cancel</Button>
            <Button onClick={addLecture}>Add Lecture</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AddCourse