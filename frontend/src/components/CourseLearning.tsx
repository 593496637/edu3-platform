import React, { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useAuth } from '../hooks/useAuth'

interface CourseModule {
  id: number
  title: string
  duration: string
  completed: boolean
  content: {
    video?: string
    description: string
    materials: string[]
  }
}

interface CourseData {
  id: number
  title: string
  description: string
  instructor: string
  modules: CourseModule[]
  progress: number
}

interface CourseLearningProps {
  courseId: string
}

export function CourseLearning({ courseId }: CourseLearningProps) {
  const { address, isConnected } = useAccount()
  const { isAuthenticated, getAuthHeaders, login, isLoading: authLoading, error: authError } = useAuth()
  
  const [courseData, setCourseData] = useState<CourseData | null>(null)
  const [currentModule, setCurrentModule] = useState(0)
  const [loading, setLoading] = useState(true)
  const [completingModule, setCompletingModule] = useState<number | null>(null)

  // 从 API 获取课程数据和学习进度
  useEffect(() => {
    const fetchCourseData = async () => {
      if (!address || !courseId || !isAuthenticated) return
      
      try {
        // 获取用户已购买的课程（包含进度信息）
        const enrolledResponse = await fetch('/api/users/courses/enrolled', {
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          }
        })
        
        if (!enrolledResponse.ok) {
          throw new Error('Failed to fetch enrolled courses')
        }
        
        const enrolledData = await enrolledResponse.json()
        const course = enrolledData.data.enrollments.find(
          (enrollment: any) => enrollment.course.id === courseId
        )
        
        if (!course) {
          throw new Error('Course not found or not purchased')
        }
        
        // 转换为前端格式
        const courseData: CourseData = {
          id: parseInt(courseId),
          title: course.course.title,
          description: course.course.description,
          instructor: course.course.instructor.address,
          progress: course.progress.percentage,
          modules: [] // 需要根据实际的课程结构设置
        }
        
        setCourseData(courseData)
      } catch (error) {
        console.error('Failed to fetch course data:', error)
        // 回退到模拟数据进行演示
        const mockCourseData: CourseData = {
          id: parseInt(courseId || '1'),
          title: `课程 #${courseId}`,
          description: '从区块链获取的课程 - 演示版本',
          instructor: '0x...instructor',
          progress: 0,
          modules: [
            {
              id: 1,
              title: '课程介绍',
              duration: '10分钟',
              completed: false,
              content: {
                description: '欢迎来到这门课程',
                materials: []
              }
            }
          ]
        }
        setCourseData(mockCourseData)
      } finally {
        setLoading(false)
      }
    }
    
    fetchCourseData()
  }, [courseId, address, isAuthenticated])

  const handleModuleComplete = async (moduleId: number) => {
    if (!courseData || !address || completingModule === moduleId) return
    
    setCompletingModule(moduleId)
    
    try {
      // 调用 API 更新学习进度
      const response = await fetch('/api/users/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          courseId: courseData.id,
          lessonId: moduleId, // 假设 moduleId 就是 lessonId
          completed: true,
          watchTime: 0 // 可以根据实际播放时间设置
        })
      })
      
      if (response.ok) {
        // 更新本地状态
        setCourseData(prev => ({
          ...prev!,
          modules: prev!.modules.map(module => 
            module.id === moduleId ? { ...module, completed: true } : module
          ),
          progress: Math.min(100, prev!.progress + (100 / prev!.modules.length))
        }))
      } else {
        console.error('Failed to update progress')
      }
    } catch (error) {
      console.error('Error updating progress:', error)
      // 降级处理：仅更新本地状态
      setCourseData(prev => ({
        ...prev!,
        modules: prev!.modules.map(module => 
          module.id === moduleId ? { ...module, completed: true } : module
        ),
        progress: Math.min(100, prev!.progress + 25)
      }))
    } finally {
      setCompletingModule(null)
    }
  }

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">请先连接钱包</h2>
          <p className="text-gray-600">需要连接钱包来验证课程购买状态</p>
        </div>
      </div>
    )
  }

  if (isConnected && !isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">需要身份验证</h2>
          <p className="text-gray-600 mb-6">请签名验证您的钱包身份以访问课程</p>
          
          {authError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{authError}</p>
            </div>
          )}
          
          <button
            onClick={login}
            disabled={authLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {authLoading ? '验证中...' : '签名验证身份'}
          </button>
          
          <p className="text-sm text-gray-500 mt-4">
            * 签名验证不会产生任何费用
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="ml-4 text-gray-600">正在加载课程内容...</p>
        </div>
      </div>
    )
  }

  if (!courseData) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">课程未找到</h2>
          <p className="text-gray-600 mb-4">请检查您是否已购买此课程</p>
          <p className="text-sm text-gray-500">请使用上方的"返回课程列表"按钮返回</p>
        </div>
      </div>
    )
  }

  const currentModuleData = courseData.modules[currentModule]

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* 侧边栏 - 课程大纲 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">{courseData.title}</h2>
              <p className="text-gray-600 text-sm mb-4">{courseData.description}</p>
              
              {/* 进度条 */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>学习进度</span>
                  <span>{courseData.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${courseData.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* 模块列表 */}
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-800 mb-3">课程模块</h3>
              {courseData.modules.map((module, index) => (
                <button
                  key={module.id}
                  onClick={() => setCurrentModule(index)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    currentModule === index
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        module.completed ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                      <span className="text-sm font-medium">{module.title}</span>
                    </div>
                    {module.completed && (
                      <span className="text-green-500 text-xs">✓</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{module.duration}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 主内容区 */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            
            {/* 视频播放区 */}
            <div className="aspect-video bg-black relative">
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <div className="text-center">
                  <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-lg">点击播放视频</p>
                  <p className="text-sm opacity-75">模拟视频播放器</p>
                </div>
              </div>
            </div>

            {/* 课程内容 */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold">{currentModuleData.title}</h3>
                {!currentModuleData.completed && (
                  <button
                    onClick={() => handleModuleComplete(currentModuleData.id)}
                    disabled={completingModule === currentModuleData.id}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                  >
                    {completingModule === currentModuleData.id ? '处理中...' : '标记完成'}
                  </button>
                )}
              </div>
              
              <p className="text-gray-700 mb-6 leading-relaxed">
                {currentModuleData.content.description}
              </p>

              {/* 学习材料 */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">学习材料</h4>
                <div className="space-y-2">
                  {currentModuleData.content.materials.map((material, index) => (
                    <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <svg className="w-5 h-5 text-blue-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1V4zm2 2V5h1v1h-1z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium">{material}</span>
                      <button className="ml-auto text-blue-600 hover:text-blue-800 text-sm">
                        下载
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 导航按钮 */}
              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentModule(Math.max(0, currentModule - 1))}
                  disabled={currentModule === 0}
                  className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  上一节
                </button>
                <button
                  onClick={() => setCurrentModule(Math.min(courseData.modules.length - 1, currentModule + 1))}
                  disabled={currentModule === courseData.modules.length - 1}
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  下一节
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}