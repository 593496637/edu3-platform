import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useBalance, useReadContracts } from 'wagmi'
import { formatEther } from 'viem'
import { CONTRACTS } from '../lib/contracts'
import type { Course } from '../types'

export function UserProfile() {
  const { address } = useAccount()
  const [activeTab, setActiveTab] = useState<'overview' | 'purchased' | 'created'>('overview')
  const [purchasedCourses, setPurchasedCourses] = useState<Course[]>([])
  const [createdCourses, setCreatedCourses] = useState<Course[]>([])
  const [totalInstructorEarnings, setTotalInstructorEarnings] = useState<bigint>(0n)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [editForm, setEditForm] = useState({ title: '', description: '', price: '' })

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

  // 获取用户创建的课程ID列表（仅讲师）
  const { data: authorCourseIds } = useReadContract({
    ...CONTRACTS.COURSE_PLATFORM,
    functionName: 'getAuthorCourses',
    args: address && isInstructor ? [address] : undefined
  })

  // 批量获取购买课程的合约数据
  const purchasedCourseContracts = purchasedCourseIds?.map((courseId: bigint) => ({
    ...CONTRACTS.COURSE_PLATFORM,
    functionName: 'getCourse',
    args: [courseId]
  })) || []

  const { data: purchasedCoursesData } = useReadContracts({
    contracts: purchasedCourseContracts
  })

  // 批量获取创建课程的合约数据
  const authorCourseContracts = authorCourseIds?.map((courseId: bigint) => ({
    ...CONTRACTS.COURSE_PLATFORM,
    functionName: 'getCourse',
    args: [courseId]
  })) || []

  const { data: authorCoursesData } = useReadContracts({
    contracts: authorCourseContracts
  })

  // 处理购买的课程数据
  useEffect(() => {
    if (!purchasedCoursesData || !address) {
      setPurchasedCourses([])
      return
    }

    const courses: Course[] = []
    purchasedCoursesData.forEach((result, index) => {
      if (result.status === 'success' && result.result) {
        const courseData = result.result as any
        courses.push({
          id: Number(courseData.id || courseData[0]),
          title: `课程 #${courseData.id || courseData[0]}`,
          description: `这是一门精心设计的课程，价格 ${formatEther(courseData.price || courseData[2])} YD`,
          price: courseData.price || courseData[2],
          author: courseData.author || courseData[1],
          active: courseData.isActive !== undefined ? courseData.isActive : (courseData[3] !== undefined ? courseData[3] : true),
          purchased: true
        })
      }
    })
    setPurchasedCourses(courses)
  }, [purchasedCoursesData, address])

  // 处理创建的课程数据和收入计算
  useEffect(() => {
    if (!authorCoursesData || !address) {
      setCreatedCourses([])
      setTotalInstructorEarnings(0n)
      return
    }

    const courses: Course[] = []
    let totalEarnings = 0n

    authorCoursesData.forEach((result, index) => {
      if (result.status === 'success' && result.result) {
        const courseData = result.result as any
        const courseId = courseData.id || courseData[0]
        const coursePrice = courseData.price || courseData[2]
        const courseTotalSales = courseData.totalSales || courseData[5] || 0n
        const studentCount = courseData.studentCount || courseData[6] || 0
        
        courses.push({
          id: Number(courseId),
          title: `我的课程 #${courseId}`,
          description: `已有 ${studentCount} 名学生购买，总销售额 ${formatEther(courseTotalSales)} YD`,
          price: coursePrice,
          author: address,
          active: courseData.isActive !== undefined ? courseData.isActive : (courseData[3] !== undefined ? courseData[3] : true),
          purchased: false
        })

        // 计算收入：总销售额减去平台手续费 (2.5%)
        const totalSales = BigInt(courseTotalSales)
        const platformFee = (totalSales * 25n) / 1000n
        const instructorEarning = totalSales - platformFee
        totalEarnings += instructorEarning
      }
    })

    setCreatedCourses(courses)
    setTotalInstructorEarnings(totalEarnings)
  }, [authorCoursesData, address])

  // 编辑功能处理函数
  const handleEditCourse = (course: Course) => {
    setEditingCourse(course)
    setEditForm({
      title: course.title,
      description: course.description,
      price: formatEther(course.price)
    })
  }

  const handleSaveEdit = () => {
    if (!editingCourse) return
    
    // 更新本地课程列表中的数据
    setCreatedCourses(prev => 
      prev.map(course => 
        course.id === editingCourse.id 
          ? {
              ...course,
              title: editForm.title,
              description: editForm.description,
              // 注意：价格更新需要智能合约调用，这里暂时只更新UI
            }
          : course
      )
    )
    
    console.log('保存课程编辑:', editForm)
    // TODO: 实现智能合约调用来更新价格
    
    setEditingCourse(null)
    setEditForm({ title: '', description: '', price: '' })
  }

  const handleCancelEdit = () => {
    setEditingCourse(null)
    setEditForm({ title: '', description: '', price: '' })
  }

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
                  <span className="font-medium">{formatEther(totalInstructorEarnings)} YD</span>
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
                  {editingCourse?.id === course.id ? (
                    // 编辑模式
                    <div>
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                        className="w-full mb-3 p-2 border border-gray-300 rounded text-lg font-semibold"
                        placeholder="课程标题"
                      />
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                        className="w-full mb-3 p-2 border border-gray-300 rounded text-gray-600 h-20 resize-none"
                        placeholder="课程描述"
                      />
                      <input
                        type="number"
                        value={editForm.price}
                        onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                        className="w-full mb-2 p-2 border border-gray-300 rounded"
                        placeholder="价格 (YD)"
                        step="0.001"
                        disabled
                      />
                      <p className="text-xs text-gray-500 mb-4">
                        注意：当前智能合约不支持修改价格，标题和描述的修改仅在本地生效
                      </p>
                      <div className="flex space-x-2">
                        <button 
                          onClick={handleSaveEdit}
                          className="flex-1 py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          保存
                        </button>
                        <button 
                          onClick={handleCancelEdit}
                          className="flex-1 py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  ) : (
                    // 显示模式
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                      <p className="text-gray-600 mb-4">{course.description}</p>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-lg font-bold text-blue-600">
                          {formatEther(course.price)} YD
                        </span>
                        <span className="text-sm text-green-600">活跃</span>
                      </div>
                      <button 
                        onClick={() => handleEditCourse(course)}
                        className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        编辑课程
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}