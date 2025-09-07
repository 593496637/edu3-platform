import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useReadContract } from 'wagmi'
import { CONTRACTS } from '../lib/contracts'

export function InstructorApplication() {
  const { address, isConnected } = useAccount()
  const { writeContract, isPending, isSuccess, isError, error } = useWriteContract()
  
  const [applicationStatus, setApplicationStatus] = useState<'none' | 'pending' | 'approved'>('none')
  
  // 检查是否已经是讲师
  const { data: isInstructor } = useReadContract({
    address: CONTRACTS.COURSE_PLATFORM.address,
    abi: CONTRACTS.COURSE_PLATFORM.abi,
    functionName: 'isInstructor',
    args: address ? [address] : undefined,
  })

  // 处理申请讲师
  const handleApplyForInstructor = async () => {
    try {
      await writeContract({
        address: CONTRACTS.COURSE_PLATFORM.address,
        abi: CONTRACTS.COURSE_PLATFORM.abi,
        functionName: 'applyToBeInstructor',
      })
    } catch (err) {
      console.error('申请讲师失败:', err)
    }
  }

  useEffect(() => {
    if (isSuccess) {
      setApplicationStatus('pending')
    }
  }, [isSuccess])

  useEffect(() => {
    if (isInstructor) {
      setApplicationStatus('approved')
    }
  }, [isInstructor])

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                请先连接钱包
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>您需要连接钱包才能申请成为讲师。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600">
          <h1 className="text-2xl font-bold text-white">申请成为讲师</h1>
          <p className="text-blue-100 mt-1">加入 Edu3 讲师团队，分享您的知识</p>
        </div>

        <div className="p-6">
          {/* 当前状态显示 */}
          {applicationStatus === 'approved' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    恭喜！您已是认证讲师
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>您现在可以创建和发布课程了。</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {applicationStatus === 'pending' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    申请已提交，等待审核
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>您的讲师申请正在审核中，请耐心等待管理员批准。</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {applicationStatus === 'none' && (
            <>
              {/* 讲师权益介绍 */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">讲师权益</h2>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    创建和发布专业课程
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    获得课程销售收益（扣除2.5%平台手续费）
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    建立个人教学品牌
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    参与Web3教育生态建设
                  </li>
                </ul>
              </div>

              {/* 申请要求 */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">申请要求</h2>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    拥有Web3钱包地址
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    具备相关领域专业知识
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    承诺提供高质量教学内容
                  </li>
                </ul>
              </div>

              {/* 当前连接地址 */}
              <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">当前钱包地址:</p>
                <p className="font-mono text-sm text-gray-900 break-all">{address}</p>
              </div>

              {/* 申请按钮 */}
              <button
                onClick={handleApplyForInstructor}
                disabled={isPending}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isPending ? '申请中...' : '申请成为讲师'}
              </button>

              {/* 错误信息 */}
              {isError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    申请失败: {error?.message || '未知错误'}
                  </p>
                </div>
              )}

              {/* 成功信息 */}
              {isSuccess && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    申请已提交成功！请等待管理员审核。
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 流程说明 */}
      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">申请流程</h2>
        <div className="flex flex-col md:flex-row md:space-x-8 space-y-4 md:space-y-0">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
              <h3 className="ml-2 font-medium">提交申请</h3>
            </div>
            <p className="text-sm text-gray-600 ml-8">连接钱包并点击申请按钮</p>
          </div>
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-medium">2</div>
              <h3 className="ml-2 font-medium">等待审核</h3>
            </div>
            <p className="text-sm text-gray-600 ml-8">管理员审核您的申请</p>
          </div>
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">3</div>
              <h3 className="ml-2 font-medium">开始教学</h3>
            </div>
            <p className="text-sm text-gray-600 ml-8">审核通过后即可创建课程</p>
          </div>
        </div>
      </div>
    </div>
  )
}