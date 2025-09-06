import { useState } from 'react';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { CONTRACTS, COURSE_PLATFORM_ABI } from '../lib/contracts';

export interface InstructorStatus {
  isInstructor: boolean;
  hasApplied: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useInstructorApplication = () => {
  const { address, isConnected } = useAccount();
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 检查是否已经是讲师
  const { data: isInstructor = false, refetch: refetchInstructorStatus } = useReadContract({
    address: CONTRACTS.CoursePlatform,
    abi: COURSE_PLATFORM_ABI,
    functionName: 'isInstructor',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // 检查是否已经申请过
  const { data: hasApplied = false, refetch: refetchApplicationStatus } = useReadContract({
    address: CONTRACTS.CoursePlatform,
    abi: COURSE_PLATFORM_ABI,
    functionName: 'instructorApplications',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // 申请成为讲师的合约调用
  const { writeContract } = useWriteContract();

  const applyToBeInstructor = async () => {
    if (!isConnected || !address) {
      setError('请先连接钱包');
      return;
    }

    if (isInstructor) {
      setError('您已经是讲师了');
      return;
    }

    if (hasApplied) {
      setError('您已经提交过申请，请等待审核');
      return;
    }

    try {
      setIsApplying(true);
      setError(null);

      await writeContract({
        address: CONTRACTS.CoursePlatform,
        abi: COURSE_PLATFORM_ABI,
        functionName: 'applyToBeInstructor',
        args: [],
      });

      // 等待交易确认后刷新状态
      setTimeout(() => {
        refetchApplicationStatus();
        refetchInstructorStatus();
      }, 3000);

    } catch (err: any) {
      console.error('申请讲师失败:', err);
      setError(err.message || '申请失败，请重试');
    } finally {
      setIsApplying(false);
    }
  };

  return {
    isInstructor,
    hasApplied,
    isApplying,
    error,
    applyToBeInstructor,
    refetchStatus: () => {
      refetchInstructorStatus();
      refetchApplicationStatus();
    },
  };
};