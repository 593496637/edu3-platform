// GraphQL queries for The Graph
export const SUBGRAPH_URL = import.meta.env.VITE_SUBGRAPH_URL || 'https://api.studio.thegraph.com/query/119458/edu-3/version/latest'

// 获取所有课程的 GraphQL 查询
export const GET_COURSES = `
  query GetCourses($first: Int = 100, $orderBy: String = "blockTimestamp", $orderDirection: String = "desc") {
    courseCreateds(first: $first, orderBy: $orderBy, orderDirection: $orderDirection) {
      id
      courseId
      author
      price
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`

// 获取用户购买记录的查询
export const GET_USER_PURCHASES = `
  query GetUserPurchases($user: String!) {
    coursePurchaseds(where: { student: $user }) {
      id
      courseId
      student
      author
      price
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`

// 获取单个课程详情
export const GET_COURSE_DETAILS = `
  query GetCourseDetails($courseId: String!) {
    courseCreateds(where: { courseId: $courseId }) {
      id
      courseId
      author
      price
      blockNumber
      blockTimestamp
      transactionHash
    }
    coursePurchaseds(where: { courseId: $courseId }) {
      id
      student
      price
      blockTimestamp
    }
  }
`

// GraphQL 请求工具函数
export async function graphqlRequest(query: string, variables: Record<string, any> = {}) {
  try {
    const response = await fetch(SUBGRAPH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    
    if (result.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`)
    }

    return result.data
  } catch (error) {
    console.error('GraphQL request failed:', error)
    throw error
  }
}

// 类型定义
export interface CourseCreatedEvent {
  id: string
  courseId: string
  author: string
  price: string
  blockNumber: string
  blockTimestamp: string
  transactionHash: string
}

export interface CoursePurchasedEvent {
  id: string
  courseId: string
  student: string
  author: string
  price: string
  blockNumber: string
  blockTimestamp: string
  transactionHash: string
}

export interface CourseDetailsResponse {
  courseCreateds: CourseCreatedEvent[]
  coursePurchaseds: CoursePurchasedEvent[]
}