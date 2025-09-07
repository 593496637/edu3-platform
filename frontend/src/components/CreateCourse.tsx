import { useState } from 'react'
import { useAccount, useWriteContract, useReadContract } from 'wagmi'
import { parseEther } from 'viem'
import { CONTRACTS } from '../lib/contracts'

export function CreateCourse() {
  const { address } = useAccount()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: ''
  })

  const { writeContract, isPending } = useWriteContract()

  // 检查用户是否为讲师
  const { data: isInstructor } = useReadContract({
    ...CONTRACTS.COURSE_PLATFORM,
    functionName: 'isInstructor',
    args: address ? [address] : undefined
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!address) {
      alert('请先连接钱包')
      return
    }

    if (!isInstructor) {
      alert('只有认证讲师才能创建课程')
      return
    }

    try {
      // 创建链上课程
      await writeContract({
        ...CONTRACTS.COURSE_PLATFORM,
        functionName: 'createCourse',
        args: [
          formData.title,
          formData.description,
          parseEther(formData.price)
        ]
      })

      // 重置表单
      setFormData({
        title: '',
        description: '',
        price: ''
      })

      alert('课程创建成功！')
    } catch (error) {
      console.error('创建课程失败:', error)
      alert('创建课程失败，请重试')
    }
  }

  const applyForInstructor = async () => {
    if (!address) return

    try {
      await writeContract({
        ...CONTRACTS.COURSE_PLATFORM,
        functionName: 'applyForInstructor'
      })
      alert('讲师申请已提交，等待审核')
    } catch (error) {
      console.error('申请讲师失败:', error)
      alert('申请失败，请重试')
    }
  }

  if (!address) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">创建课程</h2>
        <p className="text-gray-600">请先连接钱包</p>
      </div>
    )
  }

  if (isInstructor === false) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">成为讲师</h2>
        <p className="text-gray-600 mb-6">您还不是认证讲师，需要先申请讲师资格才能创建课程</p>
        <button
          onClick={applyForInstructor}
          disabled={isPending}
          className="py-3 px-6 bg-blue-500 text-white rounded font-medium hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isPending ? '申请中...' : '申请成为讲师'}
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-8">创建新课程</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本信息 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">基本信息</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">课程标题 *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="输入课程标题"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">课程简介 *</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="简要描述这门课程..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">课程价格 (YD) *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="设置课程价格 (YD币)"
              />
            </div>
          </div>
        </div>

        {/* 提交按钮 */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="py-3 px-8 bg-blue-500 text-white rounded font-medium hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isPending ? '创建中...' : '创建课程'}
          </button>
        </div>
      </form>
    </div>
  )
}