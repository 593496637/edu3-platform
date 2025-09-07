import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useReadContract } from 'wagmi'
import { CONTRACTS } from '../lib/contracts'

// 合约Owner地址
const CONTRACT_OWNER = '0xd0d30720cb6741e00d743073cb1794bbdd9da345'

interface ApplicationData {
  address: string
  appliedAt: Date
  status: 'pending' | 'approved' | 'rejected'
  isInstructor: boolean
  hasApplied: boolean
}

export function AdminPanel() {
  const { address, isConnected } = useAccount()
  const { writeContract, isPending, isSuccess, isError, error } = useWriteContract()
  
  const [applications, setApplications] = useState<ApplicationData[]>([])
  const [logs, setLogs] = useState<string[]>([])
  const [processingAddress, setProcessingAddress] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // 添加日志
  const addLog = (message: string) => {
    console.log(message)
    setLogs(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`])
  }

  // 检查是否为合约Owner
  const isOwner = address?.toLowerCase() === CONTRACT_OWNER.toLowerCase()

  // 读取合约的总课程数（用于验证连接）
  const { data: totalCourses } = useReadContract({
    address: CONTRACTS.COURSE_PLATFORM.address,
    abi: CONTRACTS.COURSE_PLATFORM.abi,
    functionName: 'getTotalCourses',
  })

  // 获取真实的申请数据
  const fetchApplications = async () => {
    if (!isOwner) return
    
    setIsLoading(true)
    addLog('🔄 开始获取申请数据...')
    
    try {
      // 直接调用新的API接口获取所有申请数据
      const response = await fetch('/api/users/instructor/applications')
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(`API返回错误: ${result.error || '未知错误'}`)
      }
      
      addLog(`✅ 成功获取 ${result.data.length} 个申请记录`)
      
      // 转换数据格式
      const applicationData: ApplicationData[] = result.data.map((app: any) => ({
        address: app.address,
        appliedAt: new Date(app.appliedAt),
        status: app.status,
        isInstructor: app.isInstructor,
        hasApplied: app.hasApplied,
      }))
      
      addLog(`📊 待审核: ${applicationData.filter(a => a.status === 'pending').length} | 已批准: ${applicationData.filter(a => a.status === 'approved').length}`)
      
      setApplications(applicationData)
      
    } catch (error) {
      addLog(`❌ 获取数据失败: ${error}`)
      console.error('获取申请数据失败:', error)
      setApplications([])
      addLog('❌ 数据获取失败，请检查网络连接或刷新重试')
    }
    
    setIsLoading(false)
  }

  // 页面加载时获取数据
  useEffect(() => {
    if (isOwner && isConnected) {
      fetchApplications()
    }
  }, [isOwner, isConnected])

  // 批准讲师申请
  const handleApproveInstructor = async (instructorAddress: string) => {
    if (!isOwner) {
      addLog('❌ 权限不足：只有合约Owner可以批准申请')
      return
    }

    addLog(`🔄 开始批准讲师申请: ${instructorAddress}`)
    setProcessingAddress(instructorAddress)

    try {
      await writeContract({
        address: CONTRACTS.COURSE_PLATFORM.address,
        abi: CONTRACTS.COURSE_PLATFORM.abi,
        functionName: 'approveInstructor',
        args: [instructorAddress as `0x${string}`],
      })

      addLog('✅ 批准交易已发送，等待确认...')
    } catch (err) {
      addLog(`❌ 批准失败: ${err}`)
      setProcessingAddress(null)
    }
  }

  // 监听交易成功
  useEffect(() => {
    if (isSuccess && processingAddress) {
      addLog(`🎉 成功批准讲师: ${processingAddress}`)
      
      // 更新本地状态
      setApplications(prev => 
        prev.map(app => 
          app.address.toLowerCase() === processingAddress.toLowerCase()
            ? { ...app, status: 'approved', isInstructor: true }
            : app
        )
      )
      
      setProcessingAddress(null)
      addLog('🔄 建议刷新数据以获取最新状态')
    }
  }, [isSuccess, processingAddress])

  // 监听交易错误
  useEffect(() => {
    if (isError && processingAddress) {
      addLog(`❌ 批准失败: ${error?.message}`)
      setProcessingAddress(null)
    }
  }, [isError, error, processingAddress])

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-medium text-yellow-800">请先连接钱包</h3>
          <p className="text-sm text-yellow-600 mt-1">管理员需要连接钱包才能审核申请</p>
        </div>
      </div>
    )
  }

  if (!isOwner) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-medium text-red-800">访问被拒绝</h3>
          <p className="text-sm text-red-600 mt-1">
            只有合约Owner ({CONTRACT_OWNER}) 可以访问管理面板
          </p>
          <p className="text-sm text-gray-500 mt-2">
            当前地址: {address}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600">
          <h1 className="text-2xl font-bold text-white">管理员面板</h1>
          <p className="text-purple-100 mt-1">讲师申请审核系统 - 真实数据版</p>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：系统信息 */}
          <div className="lg:col-span-1">
            <h3 className="font-medium text-gray-900 mb-4">系统信息</h3>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  <span className="text-sm">Owner身份已验证</span>
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600">合约地址:</p>
                <p className="font-mono text-xs break-all">{CONTRACTS.COURSE_PLATFORM.address}</p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">当前课程总数: {totalCourses?.toString() || '加载中...'}</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">
                    待审核: <span className="text-orange-600 font-semibold">{applications.filter(a => a.status === 'pending').length}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    已批准: <span className="text-green-600 font-semibold">{applications.filter(a => a.status === 'approved').length}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    总申请: <span className="font-semibold">{applications.length}</span>
                  </p>
                </div>
              </div>

              {/* 刷新按钮 */}
              <button
                onClick={fetchApplications}
                disabled={isLoading}
                className="w-full px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {isLoading ? '加载中...' : '刷新数据'}
              </button>
            </div>

            {/* 操作日志 */}
            <div className="mt-6">
              <h3 className="font-medium text-gray-900 mb-3">操作日志</h3>
              <div className="bg-black text-green-400 p-3 rounded-lg font-mono text-xs h-40 overflow-y-auto">
                {logs.length === 0 ? (
                  <p className="text-gray-500">等待操作...</p>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="mb-1">{log}</div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 右侧：申请列表 */}
          <div className="lg:col-span-2">
            <h3 className="font-medium text-gray-900 mb-4">
              讲师申请列表 {isLoading && <span className="text-sm text-gray-500">(加载中...)</span>}
            </h3>
            
            {applications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {isLoading ? '正在加载申请数据...' : '暂无申请数据'}
              </div>
            ) : (
              <div className="space-y-3">
                {/* 先显示待审核的 */}
                {applications.filter(app => app.status === 'pending').map((app, index) => (
                  <div key={`pending-${index}`} className="border-2 border-orange-200 rounded-lg p-4 bg-orange-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
                          <div>
                            <p className="font-mono text-sm font-medium">{app.address}</p>
                            <p className="text-xs text-gray-500">
                              申请时间: {app.appliedAt.toLocaleString()}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs px-2 py-1 rounded bg-orange-100 text-orange-700">
                                🕐 待审核
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleApproveInstructor(app.address)}
                          disabled={isPending || processingAddress === app.address}
                          className="px-4 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingAddress === app.address ? '处理中...' : '✅ 批准'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* 然后显示已批准的 */}
                {applications.filter(app => app.status === 'approved').map((app, index) => (
                  <div key={`approved-${index}`} className="border rounded-lg p-4 bg-green-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <div>
                            <p className="font-mono text-sm font-medium">{app.address}</p>
                            <p className="text-xs text-gray-500">
                              申请时间: {app.appliedAt.toLocaleString()}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">
                                ✅ 已批准
                              </span>
                              <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                                👨‍🏫 讲师
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 使用说明 */}
        <div className="px-6 pb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">数据来源说明</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 申请数据：从 API (/api/users/instructor/applications) 获取</li>
              <li>• 单次调用：避免循环API请求，提高性能</li>
              <li>• 实时状态：显示数据库中真实的申请状态</li>
              <li>• 批准操作：直接调用合约 approveInstructor() 函数</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}