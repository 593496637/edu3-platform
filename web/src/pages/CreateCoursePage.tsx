import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { parseEther, parseAbiItem } from 'viem';
import { CONTRACTS, COURSE_PLATFORM_ABI } from '../lib/contracts';
import { useCourseCreation } from '../hooks/useApi';
import { useCourseForm } from '../hooks/useCourseForm';

// 导入拆分的组件
import { WalletConnectionPrompt } from '../components/course/WalletConnectionPrompt';
import { FormHeader } from '../components/course/FormHeader';
import { BasicInfoForm } from '../components/course/BasicInfoForm';
import { TagsForm } from '../components/course/TagsForm';
import { RequirementsForm } from '../components/course/RequirementsForm';
import { ObjectivesForm } from '../components/course/ObjectivesForm';
import { CreationProgress } from '../components/course/CreationProgress';
import { SubmitSection } from '../components/course/SubmitSection';

type CreationStep = 'form' | 'blockchain' | 'api' | 'success';

export default function CreateCoursePage() {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { writeContract, data: hash, isPending: isWritePending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: confirmError } = useWaitForTransactionReceipt({
    hash,
  });
  const { createCourse, isLoading: isApiLoading } = useCourseCreation();
  
  // 使用自定义 hook 管理表单
  const {
    formData,
    errors,
    handleInputChange,
    handleTagsChange,
    handleRequirementsChange,
    handleObjectivesChange,
    validateFormData,
    clearErrors
  } = useCourseForm();

  const [step, setStep] = useState<CreationStep>('form');
  const [onChainId, setOnChainId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  // 清除错误的处理函数
  const handleClearError = () => {
    if (error) {
      setError(null);
      clearErrors();
    }
  };

  // 解析交易事件获取课程ID
  const parseCourseCreatedEvent = async (txHash: `0x${string}`) => {
    try {
      if (!publicClient) {
        throw new Error('无法连接到区块链网络');
      }

      const receipt = await publicClient.getTransactionReceipt({
        hash: txHash,
      });

      if (!receipt) {
        throw new Error('无法获取交易回执');
      }

      const courseCreatedEvent = parseAbiItem(
        'event CourseCreated(uint256 indexed courseId, address indexed author, uint256 price)'
      );

      const logs = receipt.logs;
      for (const log of logs) {
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
            return {
              courseId: Number(event.args.courseId),
              author: event.args.author,
              price: event.args.price,
              blockNumber: receipt.blockNumber,
              transactionHash: txHash,
            };
          }
        } catch (parseError) {
          continue;
        }
      }

      throw new Error('未找到课程创建事件，请检查交易是否成功');
    } catch (error) {
      console.error('解析课程创建事件失败:', error);
      throw error;
    }
  };

  // 处理课程创建
  const handleCreateCourse = async () => {
    if (!isConnected || !address) {
      setError('请先连接您的Web3钱包');
      return;
    }

    // 验证表单
    if (!validateFormData()) {
      setError('请修正表单中的错误后再提交');
      return;
    }

    try {
      setError(null);
      setStep('blockchain');
      
      // 将价格转换为YD代币单位（1 ETH = 4000 YD）
      const priceInETH = parseFloat(formData.price);
      const priceInYD = priceInETH * 4000;
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

  // 处理交易成功
  const handleTransactionSuccess = async (txHash: `0x${string}`) => {
    try {
      const eventData = await parseCourseCreatedEvent(txHash);
      setOnChainId(eventData.courseId);
      
      await handleApiCreateCourse(eventData.courseId);
    } catch (error) {
      console.error('处理交易成功事件失败:', error);
      setError('课程在区块链上创建成功，但保存详细信息失败');
      setStep('form');
    }
  };

  // 调用API保存课程详细信息
  const handleApiCreateCourse = async (chainId: number) => {
    try {
      setStep('api');
      
      const courseData = {
        title: formData.title,
        description: formData.description,
        content: formData.content,
        price: formData.price,
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

  // 如果没有连接钱包，显示连接提示
  if (!isConnected) {
    return <WalletConnectionPrompt />;
  }

  // 显示进度状态
  if (step !== 'form') {
    return (
      <CreationProgress 
        step={step}
        hash={hash}
        onChainId={onChainId}
        error={error}
      />
    );
  }

  // 主表单界面
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <FormHeader />

        {/* 错误提示 */}
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
                onClick={handleClearError}
                className="text-red-400 hover:text-red-600"
                aria-label="关闭错误提示"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleCreateCourse(); }} className="space-y-8">
          {/* 基本信息表单 */}
          <BasicInfoForm
            formData={formData}
            onInputChange={handleInputChange}
            categories={categories}
            errors={errors}
          />

          {/* 标签表单 */}
          <TagsForm
            tags={formData.tags}
            onTagsChange={handleTagsChange}
          />

          {/* 学习要求表单 */}
          <RequirementsForm
            requirements={formData.requirements}
            onRequirementsChange={handleRequirementsChange}
          />

          {/* 学习目标表单 */}
          <ObjectivesForm
            objectives={formData.objectives}
            onObjectivesChange={handleObjectivesChange}
          />

          {/* 提交部分 */}
          <SubmitSection
            isLoading={isWritePending || isConfirming || isApiLoading}
            onSubmit={handleCreateCourse}
          />
        </form>
      </div>
    </div>
  );
}
