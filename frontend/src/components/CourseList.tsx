import React, { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import type { Course } from '../types'
import { formatEther } from 'viem'
import { useCoursesData } from '../hooks/useCoursesData'
import { useTokenApproval } from '../hooks/useTokenApproval'
import { CONTRACTS } from '../lib/contracts'

interface CourseCardProps {
  course: Course
  onViewDetails: (courseId: number) => void
  onPurchaseSuccess?: () => void
  onStartLearning?: (courseId: string) => void
}

function CourseCard({ course, onViewDetails, onPurchaseSuccess, onStartLearning }: CourseCardProps) {
  const { address, isConnected } = useAccount()
  const [isPurchasing, setIsPurchasing] = useState(false)

  // 检查是否为课程作者
  const isAuthor = address && course.author.toLowerCase() === address.toLowerCase()

  // Token 授权管理
  const {
    needsApproval,
    isApproving,
    handleApprove,
  } = useTokenApproval(CONTRACTS.COURSE_PLATFORM.address, course.price)

  // 购买课程交易
  const { writeContract: buyCourse, data: purchaseHash, isPending: isPurchasePending } = useWriteContract()
  
  // 等待购买交易确认
  const { isLoading: isPurchaseLoading, isSuccess: isPurchaseSuccess } = useWaitForTransactionReceipt({
    hash: purchaseHash,
  })

  // 处理购买课程
  const handlePurchase = async () => {
    if (!isConnected || !address) {
      alert('请先连接钱包')
      return
    }

    setIsPurchasing(true)
    try {
      await buyCourse({
        ...CONTRACTS.COURSE_PLATFORM,
        functionName: 'buyCourse',
        args: [BigInt(course.id)],
      })
    } catch (error) {
      console.error('Purchase failed:', error)
      setIsPurchasing(false)
    }
  }

  // 监听购买完成
  useEffect(() => {
    if (isPurchaseSuccess) {
      setIsPurchasing(false)
      onPurchaseSuccess?.()
    }
  }, [isPurchaseSuccess, onPurchaseSuccess])

  // 点击卡片查看详情
  const handleCardClick = () => {
    onViewDetails(course.id)
  }

  // 渲染按钮区域
  const renderActions = () => {
    if (!isConnected) {
      return (
        <div className="text-center py-2">
          <span className="text-gray-500 text-sm">请先连接钱包</span>
        </div>
      )
    }

    // 作者自己的课程
    if (isAuthor) {
      return (
        <div className="flex justify-center">
          <span className="py-2 px-4 bg-purple-100 text-purple-700 rounded font-medium">
            我的课程
          </span>
        </div>
      )
    }

    // 已购买的课程
    if (course.purchased) {
      return (
        <div className="space-y-2">
          <div className="flex justify-center">
            <span className="py-1 px-3 bg-green-100 text-green-700 rounded text-sm font-medium">
              已购买
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              // 使用回调函数跳转到学习页面
              onStartLearning?.(course.id.toString())
            }}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
          >
            开始学习
          </button>
        </div>
      )
    }

    // 未购买的课程 - 显示授权和购买按钮
    return (
      <div className="flex space-x-2">
        {needsApproval && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleApprove()
            }}
            disabled={isApproving}
            className="flex-1 py-2 px-4 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isApproving ? '授权中...' : '授权'}
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation()
            handlePurchase()
          }}
          disabled={needsApproval || isPurchasing || isPurchasePending || isPurchaseLoading}
          className="flex-1 py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isPurchasing || isPurchasePending || isPurchaseLoading ? '购买中...' : '购买'}
        </button>
      </div>
    )
  }

  return (
    <div 
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
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

      {renderActions()}
    </div>
  )
}

interface CourseListProps {
  onPurchaseCourse?: (courseId: number) => void
  onStartLearning?: (courseId: string) => void
}

export function CourseList({ onPurchaseCourse, onStartLearning }: CourseListProps = {}) {
  const { address, isConnected } = useAccount()
  const { courses, loading, error, refetch, courseCount } = useCoursesData()

  const handleViewDetails = (courseId: number) => {
    console.log('查看课程详情:', courseId)
    // 这里可以跳转到课程详情页或打开详情模态框
  }

  const handlePurchaseSuccess = () => {
    // 购买成功后刷新课程列表
    refetch()
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
        
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-700">
            ⚡ 数据来源于 The Graph，实时同步区块链状态
          </p>
          {!isConnected && (
            <p className="text-yellow-700 mt-2">
              💡 连接钱包后可查看您已购买的课程和进行购买操作
            </p>
          )}
        </div>
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
              onViewDetails={handleViewDetails}
              onPurchaseSuccess={handlePurchaseSuccess}
              onStartLearning={onStartLearning}
            />
          ))}
        </div>
      )}
    </div>
  )
}