import { useState } from 'react'

interface InstructorApplication {
  id: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  appliedAt: string
  reviewedAt?: string
  notes?: string
}

export function useInstructorAPI() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 申请成为讲师（API部分）
  const applyToBeInstructorAPI = async (token?: string) => {
    if (!token) return null // 如果没有token，跳过API调用
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/users/instructor/apply', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || '申请失败')
      }
      
      return data.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '申请失败'
      setError(errorMessage)
      console.warn('API申请失败:', errorMessage)
      return null // API失败不影响主流程
    } finally {
      setIsLoading(false)
    }
  }

  // 获取申请状态（API部分）
  const getApplicationStatus = async (token?: string): Promise<InstructorApplication | null> => {
    if (!token) return null
    
    try {
      const response = await fetch('/api/users/instructor/application', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      return data.success ? data.data : null
    } catch (err) {
      console.warn('获取申请状态失败:', err)
      return null
    }
  }

  return {
    applyToBeInstructorAPI,
    getApplicationStatus,
    isLoading,
    error
  }
}