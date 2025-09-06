import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { CONTRACTS, COURSE_PLATFORM_ABI } from '../lib/contracts';

// 导入Hook和组件
import { useCourseForm } from '../hooks/useCourseForm';
import { convertPriceToWei, parseCourseCreatedEvent, getErrorMessage } from '../utils/blockchainUtils';
import CreateCourseForm from '../components/CreateCourseForm';
import CreationProgress from '../components/CreationProgress';

type CreationStep = 'form' | 'blockchain' | 'success';

export default function CreateCoursePage() {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  
  const { writeContract, data: hash, isPending: isWritePending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: confirmError } = useWaitForTransactionReceipt({
    hash,
  });

  // 使用自定义Hook管理表单
  const { formData, errors, handleInputChange, validateForm, clearErrors } = useCourseForm();

  // 状态管理
  const [step, setStep] = useState<CreationStep>('form');
  const [error, setError] = useState<string | null>(null);
  const [isApiLoading, setIsApiLoading] = useState(false);

  const categories = ['Development', 'Design', 'Business', 'Security', 'DeFi', 'NFT'];

  // API保存函数
  const saveCourseToAPI = async (courseId: number) => {
    try {
      setIsApiLoading(true);
      
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

  // 创建课程主函数
  const handleCreateCourse = async () => {
    if (!isConnected || !address) {
      setError('请先连接您的Web3钱包');
      return;
    }

    if (!validateForm()) {
      setError('请修正表单中的错误后再提交');
      return;
    }

    try {
      setError(null);
      setStep('blockchain');
      
      const priceInWei = convertPriceToWei(formData.price);
      
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
      const courseId = await parseCourseCreatedEvent(txHash, publicClient, CONTRACTS.CoursePlatform);
      await saveCourseToAPI(courseId);
      
      setStep('success');
      setTimeout(() => navigate('/instructor'), 3000);
    } catch (error) {
      console.error('处理交易成功事件失败:', error);
      setError('课程在区块链上创建成功，但保存详细信息失败');
      setStep('form');
    }
  };

  // 重试处理
  const handleRetry = () => {
    setError(null);
    clearErrors();
    setStep('form');
  };

  // 副作用监听
  useEffect(() => {
    if (isConfirmed && hash) {
      handleTransactionSuccess(hash);
    }
  }, [isConfirmed, hash]);

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

  // 钱包未连接
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
      <CreationProgress
        step={step}
        isWritePending={isWritePending}
        isConfirming={isConfirming}
        isApiLoading={isApiLoading}
        hash={hash}
        error={error}
        onRetry={handleRetry}
      />
    );
  }

  // 主表单界面
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
          <form onSubmit={(e) => { e.preventDefault(); handleCreateCourse(); }}>
            <CreateCourseForm
              formData={formData}
              errors={errors}
              categories={categories}
              onInputChange={handleInputChange}
            />

            <div className="mt-6">
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