import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { useAccount } from 'wagmi'

export function AuthButton() {
  const { isConnected } = useAccount()
  const { isAuthenticated, login, logout, isLoading, error, user } = useAuth()

  if (!isConnected) {
    return null
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center space-x-3">
        <div className="text-sm text-gray-600">
          <span className="text-green-600">✓</span> 已验证
        </div>
        <button
          onClick={logout}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          退出
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-3">
      {error && (
        <div className="text-sm text-red-600">
          验证失败
        </div>
      )}
      <button
        onClick={login}
        disabled={isLoading}
        className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isLoading ? '验证中...' : '身份验证'}
      </button>
    </div>
  )
}