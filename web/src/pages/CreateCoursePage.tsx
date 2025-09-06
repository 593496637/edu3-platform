import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { parseUnits, parseAbiItem } from 'viem';
import { CONTRACTS, COURSE_PLATFORM_ABI } from '../lib/contracts';

export default function CreateCoursePage() {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  
  const { writeContract, data: hash, isPending: isWritePending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: confirmError } = useWaitForTransactionReceipt({
    hash,
  });

  // 表单数据
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    price: '',
    category: '',
    duration: '',
    difficulty: 'beginner',
  });

  // 状态管理
  const [step, setStep] = useState<'form' | 'blockchain' | 'success'>('form');
  const [error, setError] = useState<string | null>(null);
  const [isApiLoading, setIsApiLoading] = useState(false);

  const categories = ['Development', 'Design', 'Business', 'Security', 'DeFi', 'NFT'];

  // 表单验证
  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('请输入课程标题');
      return false;
    }
    if (!formData.description.trim()) {
      setError('请输入课程描述');
      return false;
    }
    if (!formData.price.trim()) {
      setError('请输入课程价格');
      return false;
    }
    
    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      setError('价格必须大于0');
      return false;
    }
    if (price > 1000000) {
      setError('价格不能超过1,000,000 YD币');
      return false;
    }
    
    if (!formData.category) {
      setError('请选择课程分类');
      return false;
    }
    
    return true;
  };

  // 解析课程创建事件
  const parseCourseCreatedEvent = async (txHash: `0x${string}`) => {
    try {
      if (!publicClient) {
        throw new Error('无法连接到区块链网络');
      }

      const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
      if (!receipt) {
        throw new Error('无法获取交易回执');
      }

      const courseCreatedEvent = parseAbiItem(
        'event CourseCreated(uint256 indexed courseId, address indexed author, uint256 price)'
      );

      for (const log of receipt.logs) {
        try {
          if (log.address.toLowerCase() !== CONTRACTS.CoursePlatform.toLowerCase()) {
            continue;
          }

          const decodedLog = publicClient.parseEventLogs({
            abi: [courseCreatedEvent],
            logs: [log],
          });

          if (decodedLog.length > 0) {
            const event = decodedLog[0];
            return Number(event.args.courseId);
          }
        } catch (parseError) {
          continue;
        }
      }

      throw new Error('未找到课程创建事件');
    } catch (error) {
      console.error('解析课程创建事件失败:', error);
      throw error;
    }
  };

  // 保存课程到API
  const saveCourseToAPI = async (courseId: number) => {
    try {
      setIsApiLoading(true);
      
      // 这里应该调用你的API来保存课程详细信息
      // 由于没有看到具体的API实现，我用模拟的方式
      const courseData = {
        ...formData,
        onChainId: courseId,
        instructorAddress: address,
      };

      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      console.log('课程数据已保存:', courseData);
      return true;
    } catch (error) {
      console.error('保存课程数据失败:', error);
      throw error;
    } finally {
      setIsApiLoading(false);
    }
  };

  // 创建课程
  const handleCreateCourse = async () => {
    if (!isConnected || !address) {
      setError('请先连接您的Web3钱包');
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setError(null);
      setStep('blockchain');
      
      // 直接使用YD币价格，不需要ETH转换
      const priceInYD = parseFloat(formData.price);
      const priceInWei = parseUnits(priceInYD.toString(), 18);
      
      writeContract({
        address: CONTRACTS.CoursePlatform,
        abi: COURSE_PLATFORM_ABI,
        functionName: 'createCourse',
        args: [priceInWei],
      });

    } catch (error) {
      console.error('创建课程失败:', error);
      setError('创建课程失败，请重试');
      setStep('form');
    }
  };

  // 处理交易成功
  const handleTransactionSuccess = async (txHash: `0x${string}`) => {
    try {
      const courseId = await parseCourseCreatedEvent(txHash);
      await saveCourseToAPI(courseId);
      
      setStep('success');
      setTimeout(() => {
        navigate('/instructor');
      }, 3000);
    } catch (error) {
      console.error('处理交易成功事件失败:', error);
      setError('课程在区块链上创建成功，但保存详细信息失败');
      setStep('form');
    }
  };

  // 获取错误信息
  const getErrorMessage = (error: any): string => {
    if (error?.message?.includes('User rejected')) {
      return '用户取消了交易';
    }
    if (error?.message?.includes('insufficient funds')) {
      return '余额不足以支付交易费用';
    }
    if (error?.message?.includes('Only instructors')) {
      return '只有认证讲师才能创建课程，请先申请成为讲师';
    }
    return '交易失败，请重试';
  };

  // 监听区块链交易确认
  useEffect(() => {
    if (isConfirmed && hash) {
      handleTransactionSuccess(hash);
    }
  }, [isConfirmed, hash]);

  // 监听错误
  useEffect(() => {
    if (writeError) {
      setError(getErrorMessage(writeError));
      setStep('form');
    }
  }, [writeError]);

  useEffect(() => {
    if (confirmError) {
      setError('交易确认失败，请重试');
      setStep('form');
    }
  }, [confirmError]);

  // 钱包未连接提示
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">连接钱包</h2>
          <p className="text-gray-600 mb-6">
            创建课程需要连接Web3钱包来进行区块链交易
          </p>
          <div className="text-sm text-gray-500">
            请点击右上角的连接钱包按钮
          </div>
        </div>
      </div>
    );
  }

  // 进度展示
  if (step !== 'form') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          {step === 'blockchain' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">创建中...</h2>
              <p className="text-gray-600 mb-4">
                {isWritePending && '正在发送交易...'}
                {isConfirming && '等待区块链确认...'}
                {isApiLoading && '保存课程信息...'}
              </p>
              {hash && (
                <p className="text-sm text-blue-600 break-all">
                  交易哈希: {hash}
                </p>
              )}
            </>
          )}
          
          {step === 'success' && (
            <>
              <div className="text-green-600 text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">创建成功！</h2>
              <p className="text-gray-600 mb-4">
                您的课程已成功创建，即将跳转到讲师中心...
              </p>
            </>
          )}
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 主表单
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">创建新课程</h1>
          <p className="text-gray-600">分享您的知识，建立去中心化的教育生态</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex justify-between items-start">
              <div className="flex">
                <div className="text-red-600 mr-3">⚠️</div>
                <div>
                  <h3 className="text-red-800 font-medium">创建失败</h3>
                  <p className="text-red-600 mt-1">{error}</p>
                </div>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6">
          <form onSubmit={(e) => { e.preventDefault(); handleCreateCourse(); }} className="space-y-6">
            {/* 课程标题 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                课程标题 *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="输入课程标题"
                required
              />
            </div>

            {/* 课程描述 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                课程描述 *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="简要描述您的课程内容和目标"
                required
              />
            </div>

            {/* 课程内容 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                课程内容
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="详细的课程内容，支持Markdown格式"
              />
            </div>

            {/* 价格和分类 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  价格 (YD币) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例如: 100"
                  min="0"
                  step="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  分类 *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">选择分类</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 时长和难度 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  课程时长
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例如: 2小时"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  难度等级
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="beginner">初级</option>
                  <option value="intermediate">中级</option>
                  <option value="advanced">高级</option>
                </select>
              </div>
            </div>

            {/* 提交按钮 */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isWritePending || isConfirming || isApiLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isWritePending || isConfirming || isApiLoading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    创建中...
                  </span>
                ) : (
                  '创建课程'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* 创建须知 */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">创建须知</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• 课程创建需要支付Gas费用</p>
            <p>• 课程信息将存储在区块链上</p>
            <p>• 只有认证讲师才能创建课程</p>
            <p>• 价格设置后无法修改，请谨慎设置</p>
            <p>• 学生购买后您将获得YD币收益</p>
          </div>
        </div>
      </div>
    </div>
  );
}