import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
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
  const { writeContract, data: hash, isPending: isWritePending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });
  const { createCourse, isLoading: isApiLoading } = useCourseCreation();

  const [step, setStep] = useState<'form' | 'blockchain' | 'api' | 'success'>('form');
  const [onChainId, setOnChainId] = useState<number | null>(null);
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
      alert('请输入课程标题');
      return false;
    }
    if (!formData.description.trim()) {
      alert('请输入课程描述');
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      alert('请输入有效的课程价格(ETH)');
      return false;
    }
    if (!formData.category) {
      alert('请选择课程分类');
      return false;
    }
    return true;
  };

  const handleCreateCourse = async () => {
    if (!isConnected || !address) {
      alert('请先连接钱包');
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      // Step 1: 在区块链上创建课程
      setStep('blockchain');
      const priceInWei = parseEther(formData.price);
      
      writeContract({
        address: CONTRACTS.CoursePlatform,
        abi: COURSE_PLATFORM_ABI,
        functionName: 'createCourse',
        args: [priceInWei],
      });

    } catch (error) {
      console.error('创建课程失败:', error);
      alert('创建课程失败，请重试');
      setStep('form');
    }
  };

  // 监听区块链交易确认
  React.useEffect(() => {
    if (isConfirmed && hash) {
      // 从交易事件中获取课程ID
      // 这里需要解析交易日志来获取courseId
      // 暂时使用时间戳作为临时ID
      const tempOnChainId = Date.now();
      setOnChainId(tempOnChainId);
      handleApiCreateCourse(tempOnChainId);
    }
  }, [isConfirmed, hash]);

  const handleApiCreateCourse = async (chainId: number) => {
    try {
      setStep('api');
      
      const courseData = {
        ...formData,
        price: parseEther(formData.price).toString(),
        onChainId: chainId,
        instructorAddress: address!,
      };

      const result = await createCourse(courseData);
      
      if (result) {
        setStep('success');
        setTimeout(() => {
          navigate('/instructor');
        }, 3000);
      }
    } catch (error) {
      console.error('API创建课程失败:', error);
      alert('保存课程信息失败，但区块链交易已成功');
      setStep('form');
    }
  };

  if (!isConnected) {
    return (
      <div className=\"min-h-screen bg-gray-50 flex items-center justify-center\">
        <div className=\"bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center\">
          <h2 className=\"text-2xl font-bold text-gray-900 mb-4\">创建课程</h2>
          <p className=\"text-gray-600 mb-6\">请先连接您的Web3钱包以创建课程</p>
          <button 
            onClick={() => navigate('/instructor')}
            className=\"bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700\"
          >
            返回讲师中心
          </button>
        </div>
      </div>
    );
  }

  if (step === 'blockchain') {
    return (
      <div className=\"min-h-screen bg-gray-50 flex items-center justify-center\">
        <div className=\"bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center\">
          <div className=\"animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4\"></div>
          <h2 className=\"text-2xl font-bold text-gray-900 mb-4\">正在区块链上创建课程</h2>
          <p className=\"text-gray-600 mb-2\">
            {isWritePending ? '等待钱包确认...' : '等待交易确认...'}
          </p>
          {hash && (
            <p className=\"text-sm text-gray-500 break-all\">
              交易哈希: {hash}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (step === 'api') {
    return (
      <div className=\"min-h-screen bg-gray-50 flex items-center justify-center\">
        <div className=\"bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center\">
          <div className=\"animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4\"></div>
          <h2 className=\"text-2xl font-bold text-gray-900 mb-4\">保存课程信息</h2>
          <p className=\"text-gray-600\">正在保存课程详细信息到平台数据库...</p>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className=\"min-h-screen bg-gray-50 flex items-center justify-center\">
        <div className=\"bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center\">
          <div className=\"text-green-600 text-6xl mb-4\">✓</div>
          <h2 className=\"text-2xl font-bold text-gray-900 mb-4\">课程创建成功！</h2>
          <p className=\"text-gray-600 mb-6\">
            您的课程已成功创建并上传到区块链。学生现在可以购买您的课程了。
          </p>
          <p className=\"text-sm text-gray-500\">
            正在跳转到讲师中心...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className=\"min-h-screen bg-gray-50\">
      <div className=\"max-w-4xl mx-auto px-4 py-8\">
        <div className=\"mb-8\">
          <button
            onClick={() => navigate('/instructor')}
            className=\"text-blue-600 hover:text-blue-800 mb-4 flex items-center space-x-2\"
          >
            <span>←</span>
            <span>返回讲师中心</span>
          </button>
          <h1 className=\"text-3xl font-bold text-gray-900\">创建新课程</h1>
          <p className=\"text-gray-600 mt-2\">
            填写课程信息，创建您的Web3教育课程
          </p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleCreateCourse(); }} className=\"space-y-8\">
          <div className=\"bg-white p-6 rounded-lg shadow\">
            <h2 className=\"text-xl font-semibold text-gray-900 mb-4\">基本信息</h2>
            
            <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6\">
              <div>
                <label className=\"block text-sm font-medium text-gray-700 mb-2\">
                  课程标题 *
                </label>
                <input
                  type=\"text\"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className=\"w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500\"
                  placeholder=\"输入课程标题\"
                  required
                />
              </div>

              <div>
                <label className=\"block text-sm font-medium text-gray-700 mb-2\">
                  课程分类 *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className=\"w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500\"
                  required
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className=\"block text-sm font-medium text-gray-700 mb-2\">
                  课程价格 (ETH) *
                </label>
                <input
                  type=\"number\"
                  step=\"0.01\"
                  min=\"0.01\"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className=\"w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500\"
                  placeholder=\"0.1\"
                  required
                />
              </div>

              <div>
                <label className=\"block text-sm font-medium text-gray-700 mb-2\">
                  课程时长
                </label>
                <input
                  type=\"text\"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  className=\"w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500\"
                  placeholder=\"例如: 20小时\"
                />
              </div>

              <div>
                <label className=\"block text-sm font-medium text-gray-700 mb-2\">
                  难度等级
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => handleInputChange('difficulty', e.target.value as any)}
                  className=\"w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500\"
                >
                  <option value=\"BEGINNER\">初级</option>
                  <option value=\"INTERMEDIATE\">中级</option>
                  <option value=\"ADVANCED\">高级</option>
                </select>
              </div>

              <div>
                <label className=\"block text-sm font-medium text-gray-700 mb-2\">
                  课程缩略图URL
                </label>
                <input
                  type=\"url\"
                  value={formData.thumbnail}
                  onChange={(e) => handleInputChange('thumbnail', e.target.value)}
                  className=\"w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500\"
                  placeholder=\"https://example.com/image.jpg\"
                />
              </div>
            </div>

            <div className=\"mt-6\">
              <label className=\"block text-sm font-medium text-gray-700 mb-2\">
                课程描述 *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className=\"w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500\"
                placeholder=\"简要描述您的课程内容和特色\"
                required
              />
            </div>

            <div className=\"mt-6\">
              <label className=\"block text-sm font-medium text-gray-700 mb-2\">
                详细内容
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                rows={6}
                className=\"w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500\"
                placeholder=\"详细描述课程内容、学习目标、课程大纲等\"
              />
            </div>
          </div>

          {/* 标签部分 */}
          <div className=\"bg-white p-6 rounded-lg shadow\">
            <h2 className=\"text-xl font-semibold text-gray-900 mb-4\">课程标签</h2>
            
            <div className=\"flex flex-wrap gap-2 mb-4\">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className=\"bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center space-x-2\"
                >
                  <span>{tag}</span>
                  <button
                    type=\"button\"
                    onClick={() => removeTag(tag)}
                    className=\"text-blue-600 hover:text-blue-800\"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            
            <div className=\"flex space-x-2\">
              <input
                type=\"text\"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className=\"flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500\"
                placeholder=\"添加标签\"
              />
              <button
                type=\"button\"
                onClick={addTag}
                className=\"px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700\"
              >
                添加
              </button>
            </div>
          </div>

          {/* 学习要求 */}
          <div className=\"bg-white p-6 rounded-lg shadow\">
            <h2 className=\"text-xl font-semibold text-gray-900 mb-4\">学习要求</h2>
            
            <div className=\"space-y-2 mb-4\">
              {formData.requirements.map((req, index) => (
                <div
                  key={index}
                  className=\"flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg\"
                >
                  <span>{req}</span>
                  <button
                    type=\"button\"
                    onClick={() => removeRequirement(index)}
                    className=\"text-red-600 hover:text-red-800\"
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
            
            <div className=\"flex space-x-2\">
              <input
                type=\"text\"
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                className=\"flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500\"
                placeholder=\"添加学习要求\"
              />
              <button
                type=\"button\"
                onClick={addRequirement}
                className=\"px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700\"
              >
                添加
              </button>
            </div>
          </div>

          {/* 学习目标 */}
          <div className=\"bg-white p-6 rounded-lg shadow\">
            <h2 className=\"text-xl font-semibold text-gray-900 mb-4\">学习目标</h2>
            
            <div className=\"space-y-2 mb-4\">
              {formData.objectives.map((obj, index) => (
                <div
                  key={index}
                  className=\"flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg\"
                >
                  <span>{obj}</span>
                  <button
                    type=\"button\"
                    onClick={() => removeObjective(index)}
                    className=\"text-red-600 hover:text-red-800\"
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
            
            <div className=\"flex space-x-2\">
              <input
                type=\"text\"
                value={newObjective}
                onChange={(e) => setNewObjective(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addObjective())}
                className=\"flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500\"
                placeholder=\"添加学习目标\"
              />
              <button
                type=\"button\"
                onClick={addObjective}
                className=\"px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700\"
              >
                添加
              </button>
            </div>
          </div>

          {/* 提交按钮 */}
          <div className=\"bg-white p-6 rounded-lg shadow\">
            <div className=\"flex justify-between items-center\">
              <div className=\"text-sm text-gray-600\">
                <p>创建课程需要支付少量Gas费用</p>
                <p>课程创建后将在区块链上永久存储</p>
              </div>
              <button
                type=\"submit\"
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
