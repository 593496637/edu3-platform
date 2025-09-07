// Course related types for Edu3 platform

export interface Course {
  id: number
  title: string
  description: string
  price: bigint
  author: `0x${string}`
  active: boolean
  purchased?: boolean
}

export interface CourseMetadata {
  id: number
  title: string
  description: string
  content: string
  videoUrl?: string
  materials?: string[]
  objectives?: string[]
  requirements?: string[]
  tags?: string[]
}

export interface User {
  address: `0x${string}`
  isInstructor: boolean
  purchasedCourses: number[]
  createdCourses: number[]
}

export interface TokenBalance {
  yd: bigint
  eth: bigint
}

// Default export for easier importing
export default Course