import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { parseEther, parseAbiItem } from 'viem';
import { CONTRACTS, COURSE_PLATFORM_ABI } from '../lib/contracts';
import { useCourseCreation } from '../hooks/useApi';

interface CourseFormData {
  title: string;
  description: string;
  content: string;
  price: string;
  duration: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  category: string;
  tags: string[];
  requirements: string[];
  objectives: string[];
  thumbnail: string;
}

export default function CreateCoursePage() {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { writeContract, data: hash, isPending: isWritePending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: confirmError } = useWaitForTransactionReceipt({
    hash,
  });
  const { createCourse, isLoading: isApiLoading } = useCourseCreation();

  const [step, setStep] = useState<'form' | 'blockchain' | 'api' | 'success'>('form');
  const [onChainId, setOnChainId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    content: '',
    price: '',
    duration: '',
    difficulty: 'BEGINNER',
    category: 'Development',
    tags: [],
    requirements: [],
    objectives: [],
    thumbnail: '',
  });

  const [newTag, setNewTag] = useState('');
  const [newRequirement, setNewRequirement] = useState('');
  const [newObjective, setNewObjective] = useState('');

  const categories = [
    'Development',
    'Design',
    'Business',
    'Security',
    'DeFi',
    'NFT',
    'GameFi',
    'Infrastructure',
  ];

  const handleInputChange = (field: keyof CourseFormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除错误状态
    if (error) setError(null);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }));
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const addObjective = () => {
    if (newObjective.trim()) {
      setFormData(prev => ({
        ...prev,
        objectives: [...prev.objectives, newObjective.trim()]
      }));
      setNewObjective('');
    }
  };

  const removeObjective = (index: number) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('请输入课程标题');
      return false;
    }
    if (formData.title.length < 5) {
      setError('课程标题至少需要5个字符');
      return false;
    }
    if (!formData.description.trim()) {
      setError('请输入课程描述');
      return false;
    }
    if (formData.description.length < 20) {
      setError('课程描述至少需要20个字符');
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('请输入有效的课程价格');
      return false;
    }
    if (parseFloat(formData.price) > 100) {
      setError('课程价格不能超过100 ETH');
      return false;
    }
    if (!formData.category) {
      setError('请选择课程分类');
      return false;
    }
    if (!formData.content.trim()) {
      setError('请输入课程内容');
      return false;
    }
    if (formData.content.length < 50) {
      setError('课程内容描述至少需要50个字符');
      return false;
    }
    return true;
  };

  // 解析交易事件获取课程ID
  const parseCourseCreatedEvent = async (txHash: `0x${string}`) => {
    try {
      if (!publicClient) {
        throw new Error('无法连接到区块链网络');
      }

      // 获取交易回执
      const receipt = await publicClient.getTransactionReceipt({
        hash: txHash,
      });

      if (!receipt) {
        throw new Error('无法获取交易回执');
      }

      // 解析 CourseCreated 事件
      const courseCreatedEvent = parseAbiItem(
        'event CourseCreated(uint256 indexed courseId, address indexed author, uint256 price)'
      );

      const logs = receipt.logs;
      for (const log of logs) {
        try {
          // 检查是否是来自我们合约的日志
          if (log.address.toLowerCase() !== CONTRACTS.CoursePlatform.toLowerCase()) {
            continue;
          }

          // 尝试解析为 CourseCreated 事件
          const decodedLog = publicClient.parseEventLogs({
            abi: [courseCreatedEvent],
            logs: [log],
          });

          if (decodedLog.length > 0) {
            const event = decodedLog[0];
            return {
              courseId: Number(event.args.courseId),
              author: event.args.author,
              price: event.args.price,
              blockNumber: receipt.blockNumber,
              transactionHash: txHash,
            };
          }
        } catch (parseError) {
          // 如果解析失败，继续尝试下一个日志
          continue;
        }
      }

      throw new Error('未找到课程创建事件，请检查交易是否成功');
    } catch (error) {
      console.error('解析课程创建事件失败:', error);
      throw error;
    }
  };

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
      
      // 将价格转换为YD代币单位（假设1 ETH = 4000 YD）
      const priceInETH = parseFloat(formData.price);
      const priceInYD = priceInETH * 4000; // 根据汇率转换
      const priceInWei = parseEther(priceInYD.toString());
      
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

  // 监听区块链交易确认
  useEffect(() => {
    if (isConfirmed && hash) {
      handleTransactionSuccess(hash);
    }
  }, [isConfirmed, hash]);

  // 监听写入错误
  useEffect(() => {
    if (writeError) {
      console.error('Write contract error:', writeError);
      let errorMessage = '交易失败';
      
      if (writeError.message.includes('User rejected')) {
        errorMessage = '用户取消了交易';
      } else if (writeError.message.includes('insufficient funds')) {
        errorMessage = '余额不足以支付交易费用';
      } else if (writeError.message.includes('Only instructors')) {
        errorMessage = '只有认证讲师才能创建课程，请先申请成为讲师';
      }
      
      setError(errorMessage);
      setStep('form');
    }
  }, [writeError]);

  // 监听确认错误
  useEffect(() => {
    if (confirmError) {
      console.error('Transaction confirmation error:', confirmError);
      setError('交易确认失败，请重试');
      setStep('form');
    }
  }, [confirmError]);

  const handleTransactionSuccess = async (txHash: `0x${string}`) => {
    try {
      // 解析交易事件获取真实的课程ID
      const eventData = await parseCourseCreatedEvent(txHash);
      setOnChainId(eventData.courseId);
      
      // 调用API保存课程详细信息
      await handleApiCreateCourse(eventData.courseId);
    } catch (error) {
      console.error('处理交易成功事件失败:', error);
      setError('课程在区块链上创建成功，但保存详细信息失败');
      setStep('form');
    }
  };

  const handleApiCreateCourse = async (chainId: number) => {
    try {
      setStep('api');
      
      const courseData = {
        title: formData.title,
        description: formData.description,
        content: formData.content,
        price: formData.price, // 保持ETH单位用于显示
        duration: formData.duration,
        difficulty: formData.difficulty,
        category: formData.category,
        tags: formData.tags,
        requirements: formData.requirements,
        objectives: formData.objectives,
        thumbnail: formData.thumbnail,
        onChainId: chainId,
        instructorAddress: address!,
      };

      const result = await createCourse(courseData);
      
      if (result) {
        setStep('success');
        setTimeout(() => {
          navigate('/instructor');
        }, 3000);
      } else {
        throw new Error('API返回失败结果');
      }
    } catch (error) {
      console.error('API创建课程失败:', error);
      setError('课程在区块链上创建成功，但保存详细信息失败。您可以稍后在讲师中心重试。');
      setStep('form');
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">创建课程</h2>
          <p className="text-gray-600 mb-6">请先连接您的Web3钱包以创建课程</p>
          <button 
            onClick={() => navigate('/instructor')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            返回讲师中心
          </button>
        </div>
      </div>
    );
  }

  if (step === 'blockchain') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">正在区块链上创建课程</h2>
          <p className="text-gray-600 mb-2">
            {isWritePending ? '等待钱包确认...' : '等待交易确认...'}
          </p>
          {hash && (
            <p className="text-sm text-gray-500 break-all">
              交易哈希: {hash}
            </p>
          )}
          <div className="mt-4 text-sm text-gray-500">
            <p>请不要关闭此页面</p>
            <p>区块链交易可能需要几分钟时间</p>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'api') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">保存课程信息</h2>
          <p className="text-gray-600">正在保存课程详细信息到平台数据库...</p>
          {onChainId && (
            <p className="text-sm text-green-600 mt-2">
              课程ID: {onChainId}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-green-600 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">课程创建成功！</h2>
          <p className="text-gray-600 mb-6">
            您的课程已成功创建并上传到区块链。学生现在可以购买您的课程了。
          </p>
          {onChainId && (
            <p className="text-sm text-green-600 mb-4">
              课程ID: {onChainId}
            </p>
          )}
          <p className="text-sm text-gray-500">
            正在跳转到讲师中心...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/instructor')}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center space-x-2"
          >
            <span>←</span>
            <span>返回讲师中心</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">创建新课程</h1>
          <p className="text-gray-600 mt-2">
            填写课程信息，创建您的Web3教育课程
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <div className="text-red-600 mr-3">⚠️</div>
              <div>
                <h3 className="text-red-800 font-medium">创建失败</h3>
                <p className="text-red-600 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleCreateCourse(); }} className="space-y-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">基本信息</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  课程标题 * <span className="text-gray-500">(至少5个字符)</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="例如：区块链开发入门教程"
                  required
                  minLength={5}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  课程分类 *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  课程价格 (ETH) * <span className="text-gray-500">(0.01-100 ETH)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="100"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  课程时长
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="例如: 20小时或10节课"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  难度等级
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => handleInputChange('difficulty', e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="BEGINNER">初级</option>
                  <option value="INTERMEDIATE">中级</option>
                  <option value="ADVANCED">高级</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  课程缩略图URL
                </label>
                <input
                  type="url"
                  value={formData.thumbnail}
                  onChange={(e) => handleInputChange('thumbnail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                课程描述 * <span className="text-gray-500">(至少20个字符)</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="简要描述您的课程内容和特色，让学生了解课程价值"
                required
                minLength={20}
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                详细内容 * <span className="text-gray-500">(至少50个字符)</span>
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="详细描述课程内容、学习目标、课程大纲等。这将帮助学生更好地了解课程内容。"
                required
                minLength={50}
              />
            </div>
          </div>

          {/* 标签部分 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">课程标签</h2>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            
            <div className="flex space-x-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="添加标签，例如：JavaScript, 区块链, 入门"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                添加
              </button>
            </div>
          </div>

          {/* 学习要求 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">学习要求</h2>
            
            <div className="space-y-2 mb-4">
              {formData.requirements.map((req, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg"
                >
                  <span>{req}</span>
                  <button
                    type="button"
                    onClick={() => removeRequirement(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
            
            <div className="flex space-x-2">
              <input
                type="text"
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="例如：具备基础编程知识"
              />
              <button
                type="button"
                onClick={addRequirement}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                添加
              </button>
            </div>
          </div>

          {/* 学习目标 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">学习目标</h2>
            
            <div className="space-y-2 mb-4">
              {formData.objectives.map((obj, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg"
                >
                  <span>{obj}</span>
                  <button
                    type="button"
                    onClick={() => removeObjective(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
            
            <div className="flex space-x-2">
              <input
                type="text"
                value={newObjective}
                onChange={(e) => setNewObjective(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addObjective())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="例如：能够独立开发智能合约"
              />
              <button
                type="button"
                onClick={addObjective}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                添加
              </button>
            </div>
          </div>

          {/* 提交按钮 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <p>创建课程需要支付少量Gas费用</p>
                <p>课程创建后将在区块链上永久存储</p>
                <p className="text-blue-600 mt-1">价格将按 1 ETH = 4000 YD 币的汇率转换</p>
              </div>
              <button
                type="submit"
                disabled={isWritePending || isConfirming || isApiLoading}
                className={`px-8 py-3 rounded-lg font-medium ${
                  isWritePending || isConfirming || isApiLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white`}
              >
                {isWritePending || isConfirming || isApiLoading ? '创建中...' : '创建课程'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
