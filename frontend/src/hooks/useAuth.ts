import { useState, useEffect } from 'react'
import { useAccount, useSignMessage } from 'wagmi'

interface User {
  id: string
  address: string
  username?: string
  isInstructor: boolean
  createdAt: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export function useAuth() {
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  })

  // 从 localStorage 加载认证状态
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token')
    const savedUser = localStorage.getItem('auth_user')
    
    if (savedToken && savedUser && isConnected) {
      try {
        const user = JSON.parse(savedUser)
        // 检查保存的用户地址是否与当前连接的钱包地址匹配
        if (user.address.toLowerCase() === address?.toLowerCase()) {
          setAuthState({
            user,
            token: savedToken,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
        } else {
          // 地址不匹配，清除认证状态
          clearAuth()
        }
      } catch (error) {
        console.error('Failed to parse saved user data:', error)
        clearAuth()
      }
    }
  }, [address, isConnected])

  // 清除认证状态
  const clearAuth = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    })
  }

  // 钱包认证登录
  const login = async () => {
    if (!address || !isConnected) {
      throw new Error('请先连接钱包')
    }

    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // 创建签名消息
      const timestamp = Date.now()
      const message = `请签名以验证您的身份\n\n地址: ${address}\n时间戳: ${timestamp}\n\n此操作不会产生任何费用。`

      // 请求用户签名
      const signature = await signMessageAsync({ message })

      // 发送到后端验证
      const response = await fetch('/api/auth/wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          message,
          signature,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '认证失败')
      }

      const data = await response.json()
      
      if (data.success) {
        const { user, token } = data.data
        
        // 保存认证信息
        localStorage.setItem('auth_token', token)
        localStorage.setItem('auth_user', JSON.stringify(user))
        
        setAuthState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null
        })

        return { user, token }
      } else {
        throw new Error(data.message || '认证失败')
      }
    } catch (error: any) {
      console.error('Authentication failed:', error)
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || '认证失败，请重试'
      }))
      throw error
    }
  }

  // 退出登录
  const logout = () => {
    clearAuth()
  }

  // 获取认证头
  const getAuthHeaders = () => {
    if (!authState.token) {
      return {}
    }
    return {
      'Authorization': `Bearer ${authState.token}`
    }
  }

  // 检查钱包地址变化
  useEffect(() => {
    if (authState.isAuthenticated && authState.user && address) {
      if (authState.user.address.toLowerCase() !== address.toLowerCase()) {
        // 钱包地址已更改，清除认证状态
        clearAuth()
      }
    }
  }, [address, authState.isAuthenticated, authState.user])

  // 钱包断开时清除认证状态
  useEffect(() => {
    if (!isConnected && authState.isAuthenticated) {
      clearAuth()
    }
  }, [isConnected, authState.isAuthenticated])

  return {
    ...authState,
    login,
    logout,
    getAuthHeaders,
    clearAuth
  }
}