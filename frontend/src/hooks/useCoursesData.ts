import { useState, useEffect } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { CONTRACTS } from '../lib/contracts'
import { graphqlRequest, GET_COURSES, GET_USER_PURCHASES, type CourseCreatedEvent, type CoursePurchasedEvent } from '../lib/graphql'
import type { Course } from '../types'

export function useCoursesData() {
  const { address } = useAccount()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 获取用户购买的课程
  const { data: purchasedCourses } = useReadContract({
    ...CONTRACTS.COURSE_PLATFORM,
    functionName: 'getUserPurchasedCourses',
    args: address ? [address] : undefined
  })

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // 使用 GraphQL 从 The Graph 获取课程数据
        const data = await graphqlRequest(GET_COURSES, {
          first: 100,
          orderBy: "blockTimestamp",
          orderDirection: "desc"
        })

        if (!data || !data.courseCreateds) {
          setCourses([])
          setLoading(false)
          return
        }

        // 如果用户已连接钱包，同时获取用户购买记录
        let userPurchases: CoursePurchasedEvent[] = []
        if (address) {
          try {
            const purchaseData = await graphqlRequest(GET_USER_PURCHASES, {
              user: address.toLowerCase()
            })
            userPurchases = purchaseData.coursePurchaseds || []
          } catch (purchaseError) {
            console.warn('获取用户购买记录失败:', purchaseError)
          }
        }

        // 转换 GraphQL 数据为前端格式
        const realCourses: Course[] = data.courseCreateds.map((courseEvent: CourseCreatedEvent) => {
          const isPurchased = userPurchases.some(
            purchase => purchase.courseId === courseEvent.courseId
          )
          
          return {
            id: parseInt(courseEvent.courseId),
            title: `课程 #${courseEvent.courseId}`,
            description: '从区块链获取的课程', // GraphQL 事件中没有描述，可以后续扩展
            price: BigInt(courseEvent.price),
            author: courseEvent.author as `0x${string}`,
            active: true, // GraphQL 只记录创建事件，默认为活跃
            purchased: isPurchased
          }
        })

        setCourses(realCourses)
        setError(null)
      } catch (err) {
        console.error('从 The Graph 获取课程数据失败:', err)
        setError('获取课程数据失败，请重试')
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [address, purchasedCourses])

  const refetch = async () => {
    setLoading(true)
    setError(null)
    // 触发重新获取数据，重新调用 useEffect
    const fetchCourses = async () => {
      try {
        const data = await graphqlRequest(GET_COURSES, {
          first: 100,
          orderBy: "blockTimestamp", 
          orderDirection: "desc"
        })

        if (!data || !data.courseCreateds) {
          setCourses([])
          setLoading(false)
          return
        }

        let userPurchases: CoursePurchasedEvent[] = []
        if (address) {
          try {
            const purchaseData = await graphqlRequest(GET_USER_PURCHASES, {
              user: address.toLowerCase()
            })
            userPurchases = purchaseData.coursePurchaseds || []
          } catch (purchaseError) {
            console.warn('获取用户购买记录失败:', purchaseError)
          }
        }

        const realCourses: Course[] = data.courseCreateds.map((courseEvent: CourseCreatedEvent) => {
          const isPurchased = userPurchases.some(
            purchase => purchase.courseId === courseEvent.courseId
          )
          
          return {
            id: parseInt(courseEvent.courseId),
            title: `课程 #${courseEvent.courseId}`,
            description: '从区块链获取的课程',
            price: BigInt(courseEvent.price),
            author: courseEvent.author as `0x${string}`,
            active: true,
            purchased: isPurchased
          }
        })

        setCourses(realCourses)
        setError(null)
      } catch (err) {
        console.error('从 The Graph 获取课程数据失败:', err)
        setError('获取课程数据失败，请重试')
      } finally {
        setLoading(false)
      }
    }
    
    await fetchCourses()
  }

  return {
    courses,
    loading,
    error,
    refetch,
    courseCount: courses.length
  }
}