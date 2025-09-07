import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useReadContract } from 'wagmi'
import { formatEther, parseEther } from 'viem'
import { CONTRACTS } from '../lib/contracts'
import type { Course } from '../types'

interface CoursePurchaseProps {
  courseId: number
  onClose: () => void
  onSuccess: () => void
}

export function CoursePurchase({ courseId, onClose, onSuccess }: CoursePurchaseProps) {
  const { address } = useAccount()
  const [step, setStep] = useState<'approve' | 'purchase'>('approve')
  const [approving, setApproving] = useState(false)
  const [purchasing, setPurchasing] = useState(false)
  const [course, setCourse] = useState<Course | null>(null)

  const { writeContract } = useWriteContract()

  // 获取YD余额
  const { data: ydBalance } = useReadContract({
    ...CONTRACTS.YD_TOKEN,
    functionName: 'balanceOf',
    args: address ? [address] : undefined
  })

  // 获取当前授权额度
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    ...CONTRACTS.YD_TOKEN,
    functionName: 'allowance',
    args: address ? [address, CONTRACTS.COURSE_PLATFORM.address] : undefined
  })

  // 获取真实的课程信息
  useEffect(() => {
    const fetchCourseInfo = async () => {
      try {
        const response = await fetch(`/api/courses/${courseId}`)
        const result = await response.json()
        
        if (result.success) {
          setCourse({
            id: result.data.id,
            title: result.data.title,
            description: result.data.description,
            price: BigInt(result.data.price),
            author: result.data.instructor as `0x${string}`,
            active: result.data.active
          })
        }
      } catch (error) {
        console.error('获取课程信息失败:', error)
      }
    }

    fetchCourseInfo()
  }, [courseId])

  const handleApprove = async () => {
    if (!course || !address) return

    setApproving(true)
    try {
      await writeContract({
        ...CONTRACTS.YD_TOKEN,
        functionName: 'approve',
        args: [CONTRACTS.COURSE_PLATFORM.address, course.price]
      })

      // 等待交易确认后检查授权
      setTimeout(() => {
        refetchAllowance()
        setStep('purchase')
        setApproving(false)
      }, 3000)
    } catch (error) {
      console.error('授权失败:', error)
      setApproving(false)
    }
  }

  const handlePurchase = async () => {
    if (!course || !address) return

    setPurchasing(true)
    try {
      await writeContract({
        ...CONTRACTS.COURSE_PLATFORM,
        functionName: 'buyCourse',
        args: [BigInt(courseId)]
      })

      // 购买成功
      setTimeout(() => {
        setPurchasing(false)
        onSuccess()
      }, 3000)
    } catch (error) {
      console.error('购买失败:', error)
      setPurchasing(false)
    }
  }

  // 检查是否已有足够授权
  useEffect(() => {
    if (allowance && course && allowance >= course.price) {
      setStep('purchase')
    }
  }, [allowance, course])

  if (!course) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    )
  }

  const hasEnoughBalance = ydBalance ? ydBalance >= course.price : false
  const hasEnoughAllowance = allowance ? allowance >= course.price : false

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
        {/* 头部 */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">购买课程</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* 课程信息 */}
        <div className="mb-6 p-4 bg-gray-50 rounded">
          <h4 className="font-medium">{course.title}</h4>
          <p className="text-sm text-gray-600 mt-1">{course.description}</p>
          <p className="text-lg font-bold text-blue-600 mt-2">
            {formatEther(course.price)} YD
          </p>
        </div>

        {/* 余额检查 */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <span>您的YD余额:</span>
            <span className={hasEnoughBalance ? 'text-green-600' : 'text-red-600'}>
              {ydBalance ? formatEther(ydBalance) : '0'} YD
            </span>
          </div>
          
          {!hasEnoughBalance && (
            <p className="text-red-500 text-sm mt-2">
              余额不足，请先兑换YD币
            </p>
          )}
        </div>

        {/* 购买步骤 */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            {/* 步骤1: 授权 */}
            <div className={`flex items-center ${
              step === 'approve' ? 'text-blue-600' : 
              hasEnoughAllowance ? 'text-green-600' : 'text-gray-400'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${
                step === 'approve' ? 'bg-blue-600' : 
                hasEnoughAllowance ? 'bg-green-600' : 'bg-gray-400'
              }`}>
                {hasEnoughAllowance ? '✓' : '1'}
              </div>
              <span className="ml-2">授权</span>
            </div>

            <div className="flex-1 h-1 bg-gray-200 rounded">
              <div className={`h-full rounded transition-all ${
                hasEnoughAllowance ? 'bg-green-600 w-full' : 'bg-gray-200'
              }`}></div>
            </div>

            {/* 步骤2: 购买 */}
            <div className={`flex items-center ${
              step === 'purchase' ? 'text-blue-600' : 'text-gray-400'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${
                step === 'purchase' ? 'bg-blue-600' : 'bg-gray-400'
              }`}>
                2
              </div>
              <span className="ml-2">购买</span>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="space-y-3">
          {step === 'approve' && (
            <button
              onClick={handleApprove}
              disabled={approving || !hasEnoughBalance}
              className="w-full py-3 bg-blue-500 text-white rounded font-medium hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {approving ? '授权中...' : `授权 ${formatEther(course.price)} YD`}
            </button>
          )}

          {step === 'purchase' && (
            <button
              onClick={handlePurchase}
              disabled={purchasing || !hasEnoughBalance}
              className="w-full py-3 bg-green-500 text-white rounded font-medium hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {purchasing ? '购买中...' : '确认购买'}
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-500 text-white rounded font-medium hover:bg-gray-600"
          >
            取消
          </button>
        </div>

        {/* 说明文字 */}
        <p className="text-xs text-gray-500 mt-4 text-center">
          购买后资金将转给课程作者，平台收取少量手续费
        </p>
      </div>
    </div>
  )
}