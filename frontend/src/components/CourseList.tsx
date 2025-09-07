import { useAccount } from 'wagmi'
import type { Course } from '../types'
import { formatEther } from 'viem'
import { useCoursesData } from '../hooks/useCoursesData'

interface CourseCardProps {
  course: Course
  onPurchase: (courseId: number) => void
  onViewDetails: (courseId: number) => void
}

function CourseCard({ course, onPurchase, onViewDetails }: CourseCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
      <p className="text-gray-600 mb-4 line-clamp-3">{course.description}</p>
      
      <div className="flex items-center justify-between mb-4">
        <span className="text-lg font-bold text-blue-600">
          {formatEther(course.price)} YD
        </span>
        <span className="text-sm text-gray-500">
          作者: {course.author.slice(0, 6)}...{course.author.slice(-4)}
        </span>
      </div>

      <div className="flex space-x-2">
        {course.purchased ? (
          <button
            onClick={() => onViewDetails(course.id)}
            className="flex-1 py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600"
          >
            查看课程
          </button>
        ) : (
          <>
            <button
              onClick={() => onViewDetails(course.id)}
              className="flex-1 py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              详情
            </button>
            <button
              onClick={() => onPurchase(course.id)}
              className="flex-1 py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              购买
            </button>
          </>
        )}
      </div>
    </div>
  )
}

interface CourseListProps {
  onPurchaseCourse?: (courseId: number) => void
}

export function CourseList({ onPurchaseCourse }: CourseListProps = {}) {
  const { address, isConnected } = useAccount()
  const { courses, loading, error, refetch, courseCount } = useCoursesData()

  const handlePurchase = (courseId: number) => {
    if (!isConnected) {
      alert('请先连接钱包')
      return
    }
    
    if (onPurchaseCourse) {
      onPurchaseCourse(courseId)
    } else {
      console.log('购买课程:', courseId)
      // 这里可以打开购买模态框
    }
  }

  const handleViewDetails = (courseId: number) => {
    console.log('查看课程详情:', courseId)
    // 这里可以跳转到课程详情页或打开详情模态框
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-600">正在加载课程列表...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            重试
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">课程列表</h1>
            <p className="text-gray-600">发现优质的Web3学习课程</p>
          </div>
          <div className="text-right">
            <div className="bg-blue-50 px-4 py-2 rounded-lg">
              <p className="text-sm text-gray-600">总共</p>
              <p className="text-2xl font-bold text-blue-600">{courseCount}</p>
              <p className="text-sm text-gray-600">门课程</p>
            </div>
          </div>
        </div>
        
        {!isConnected && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-700">
              💡 连接钱包后可查看您已购买的课程和进行购买操作
            </p>
          </div>
        )}
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">暂无课程</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              onPurchase={handlePurchase}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}
    </div>
  )
}