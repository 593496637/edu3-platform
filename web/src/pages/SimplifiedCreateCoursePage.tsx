import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { CONTRACTS, COURSE_PLATFORM_ABI } from '../lib/contracts';
import { useSimpleCourseForm } from '../hooks/useSimpleCourseForm';
import { useSimpleCourseApi } from '../hooks/useSimpleCourseApi';
import { SimpleCourseProgress } from '../components/SimpleCourseProgress';
import { SimpleWalletPrompt } from '../components/SimpleWalletPrompt';
import { SimpleCourseForm } from '../components/SimpleCourseForm';
import { parseCourseCreatedEvent, convertPriceToWei, getErrorMessage } from '../utils/courseHelpers';

type CreationStep = 'form' | 'blockchain' | 'api' | 'success';

export default function SimplifiedCreateCoursePage() {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  
  const { writeContract, data: hash, isPending: isWritePending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: confirmError } = useWaitForTransactionReceipt({
    hash,
  });

  const { formData, errors, handleInputChange, validateForm, clearErrors } = useSimpleCourseForm();
  const { createCourse: createCourseAPI, isLoading: isApiLoading, error: apiError } = useSimpleCourseApi();

  const [step, setStep] = useState<CreationStep>('form');
  const [onChainId, setOnChainId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const categories = ['Development', 'Design', 'Business', 'Security', 'DeFi', 'NFT'];

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
      clearErrors();
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

  const handleTransactionSuccess = async (txHash: `0x${string}`) => {
    try {
      const courseId = await parseCourseCreatedEvent(txHash, publicClient, CONTRACTS.CoursePlatform);
      setOnChainId(courseId);
      
      setStep('api');
      
      const success = await createCourseAPI({
        ...formData,
        onChainId: courseId,
        instructorAddress: address!,
      });
      
      if (success) {
        setStep('success');
        setTimeout(() => navigate('/instructor'), 3000);
      } else {
        throw new Error(apiError || '保存课程信息失败');
      }
    } catch (error) {
      console.error('处理交易成功事件失败:', error);
      setError('课程在区块链上创建成功，但保存详细信息失败');
      setStep('form');
    }
  };

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

  const handleRetry = () => {
    setError(null);
    setStep('form');
  };

  if (!isConnected) {
    return <SimpleWalletPrompt />;
  }

  if (step !== 'form') {
    return (
      <SimpleCourseProgress
        step={step}
        hash={hash}
        onChainId={onChainId}
        error={error}
        onRetry={handleRetry}
      />
    );
  }

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

        <SimpleCourseForm
          formData={formData}
          onInputChange={handleInputChange}
          errors={errors}
          categories={categories}
        />

        <div className="mt-6">
          <button
            onClick={handleCreateCourse}
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
      </div>
    </div>
  );
}