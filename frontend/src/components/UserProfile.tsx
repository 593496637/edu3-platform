import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useBalance } from 'wagmi'
import { formatEther } from 'viem'
import { CONTRACTS } from '../lib/contracts'
import type { Course } from '../types'

export function UserProfile() {
  const { address } = useAccount()
  const [activeTab, setActiveTab] = useState<'overview' | 'purchased' | 'created'>('overview')
  const [purchasedCourses, setPurchasedCourses] = useState<Course[]>([])
  const [createdCourses, setCreatedCourses] = useState<Course[]>([])

  // 获取ETH余额
  const { data: ethBalance } = useBalance({ address })

  // 获取YD余额
  const { data: ydBalance } = useReadContract({
    ...CONTRACTS.YD_TOKEN,
    functionName: 'balanceOf',
    args: address ? [address] : undefined
  })

  // 获取用户购买的课程ID列表
  const { data: purchasedCourseIds } = useReadContract({
    ...CONTRACTS.COURSE_PLATFORM,
    functionName: 'getUserPurchasedCourses',
    args: address ? [address] : undefined
  })

  // 检查是否为讲师
  const { data: isInstructor } = useReadContract({
    ...CONTRACTS.COURSE_PLATFORM,
    functionName: 'isInstructor',
    args: address ? [address] : undefined
  })

  // 获取真实的课程详情
  useEffect(() => {
    const fetchUserCourses = async () => {
      if (!address) return

      try {
        // 获取用户购买的课程
        if (purchasedCourseIds && purchasedCourseIds.length > 0) {
          const coursePromises = purchasedCourseIds.map(async (id) => {
            const response = await fetch(`/api/courses/${Number(id)}`)
            const result = await response.json()
            if (result.success) {
              return {
                id: result.data.id,
                title: result.data.title,
                description: result.data.description,
                price: BigInt(result.data.price),
                author: result.data.instructor as `0x${string}`,
                active: result.data.active,
                purchased: true
              }
            }
            return null
          })
          
          const courses = await Promise.all(coursePromises)
          setPurchasedCourses(courses.filter(course => course !== null) as Course[])
        }

        // 获取用户创建的课程 (仅讲师)
        if (isInstructor) {
          const response = await fetch(`/api/users/courses/created`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          })
          const result = await response.json()
          if (result.success) {
            const courses = result.data.courses.map((course: any) => ({
              id: course.id,
              title: course.title,
              description: course.description,
              price: BigInt(course.price),
              author: address,
              active: course.published
            }))
            setCreatedCourses(courses)
          }
        }
      } catch (error) {
        console.error('获取用户课程数据失败:', error)
      }
    }

    fetchUserCourses()
  }, [purchasedCourseIds, isInstructor, address])

  if (!address) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">用户中心</h2>
        <p className="text-gray-600">请先连接钱包</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">用户中心</h1>
        <p className="text-gray-600">
          {address.slice(0, 6)}...{address.slice(-4)}
          {isInstructor && <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 rounded text-sm">认证讲师</span>}
        </p>
      </div>

      {/* 标签页导航 */}
      <div className="border-b mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            概览
          </button>
          <button
            onClick={() => setActiveTab('purchased')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'purchased'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            已购课程 ({purchasedCourses.length})
          </button>
          {isInstructor && (
            <button
              onClick={() => setActiveTab('created')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'created'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              我的课程 ({createdCourses.length})
            </button>
          )}
        </nav>
      </div>

      {/* 概览页面 */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 钱包余额 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">钱包余额</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>ETH:</span>
                <span className="font-medium">
                  {ethBalance ? formatEther(ethBalance.value) : '0'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>YD:</span>
                <span className="font-medium">
                  {ydBalance ? formatEther(ydBalance) : '0'}
                </span>
              </div>
            </div>
          </div>

          {/* 学习统计 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">学习统计</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>已购课程:</span>
                <span className="font-medium">{purchasedCourses.length}</span>
              </div>
              <div className="flex justify-between">
                <span>学习进度:</span>
                <span className="font-medium">--</span>
              </div>
            </div>
          </div>

          {/* 讲师统计 */}
          {isInstructor && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">讲师统计</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>已创建课程:</span>
                  <span className="font-medium">{createdCourses.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>总收入:</span>
                  <span className="font-medium">-- YD</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 已购课程 */}
      {activeTab === 'purchased' && (
        <div>
          {purchasedCourses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">您还没有购买任何课程</p>
              <button className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                去浏览课程
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {purchasedCourses.map(course => (
                <div key={course.id} className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                  <p className="text-gray-600 mb-4">{course.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-bold text-green-600">已购买</span>
                    <span className="text-sm text-gray-500">
                      {formatEther(course.price)} YD
                    </span>
                  </div>
                  <button className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600">
                    开始学习
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 我创建的课程 */}
      {activeTab === 'created' && isInstructor && (
        <div>
          {createdCourses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">您还没有创建任何课程</p>
              <button className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                创建课程
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {createdCourses.map(course => (
                <div key={course.id} className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                  <p className="text-gray-600 mb-4">{course.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-bold text-blue-600">
                      {formatEther(course.price)} YD
                    </span>
                    <span className="text-sm text-green-600">活跃</span>
                  </div>
                  <div className="flex space-x-2">
                    <button className="flex-1 py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600">
                      编辑
                    </button>
                    <button className="flex-1 py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600">
                      统计
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}