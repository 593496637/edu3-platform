import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useReadContracts } from 'wagmi'
import { CONTRACTS } from '../lib/contracts'
import type { Course } from '../types'

export function useCoursesData() {
  const { address } = useAccount()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 获取课程总数
  const { data: courseCount, isError: courseCountError } = useReadContract({
    ...CONTRACTS.COURSE_PLATFORM,
    functionName: 'getCourseCount'
  })

  // 获取用户购买的课程
  const { data: purchasedCourses } = useReadContract({
    ...CONTRACTS.COURSE_PLATFORM,
    functionName: 'getUserPurchasedCourses',
    args: address ? [address] : undefined
  })

  useEffect(() => {
    const fetchCourses = async () => {
      if (courseCountError) {
        setError('无法连接到智能合约，请检查网络连接')
        setLoading(false)
        return
      }

      if (!courseCount || courseCount === 0n) {
        setCourses([])
        setLoading(false)
        return
      }

      try {
        // 准备批量读取合约数据
        const courseContracts = []
        for (let i = 1; i <= Number(courseCount); i++) {
          courseContracts.push({
            ...CONTRACTS.COURSE_PLATFORM,
            functionName: 'getCourse',
            args: [BigInt(i)]
          })
        }

        // 使用 API 从后端获取真实的课程数据（后端从区块链获取）
        const response = await fetch('/api/courses')
        const result = await response.json()
        
        if (!result.success) {
          throw new Error(result.message || '获取课程数据失败')
        }
        
        // 转换 API 数据为前端格式
        const realCourses: Course[] = result.data.courses.map((course: any) => ({
          id: course.id,
          title: course.title,
          description: course.description,
          price: BigInt(course.price),
          author: course.instructor as `0x${string}`,
          active: course.active,
          purchased: purchasedCourses ? purchasedCourses.some((id: bigint) => id === BigInt(course.id)) : false
        }))

        setCourses(realCourses)
        setError(null)
      } catch (err) {
        console.error('获取课程数据失败:', err)
        setError('获取课程数据失败，请重试')
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [courseCount, purchasedCourses, courseCountError])

  const refetch = () => {
    setLoading(true)
    setError(null)
    // 触发重新获取数据的逻辑
  }

  return {
    courses,
    loading,
    error,
    refetch,
    courseCount: courseCount ? Number(courseCount) : 0
  }
}