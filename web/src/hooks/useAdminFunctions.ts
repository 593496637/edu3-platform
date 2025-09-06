import { useState } from 'react';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { CONTRACTS, COURSE_PLATFORM_ABI } from '../lib/contracts';

interface PendingApplication {
  applicant: string;
  hasApplied: boolean;
  isAlreadyInstructor: boolean;
}

export const useAdminFunctions = () => {
  const { address, isConnected } = useAccount();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 检查当前用户是否是合约owner
  const { data: owner } = useReadContract({
    address: CONTRACTS.CoursePlatform,
    abi: COURSE_PLATFORM_ABI,
    functionName: 'owner',
    query: {
      enabled: !!address,
    },
  });

  const isOwner = address && owner && address.toLowerCase() === owner.toLowerCase();

  // 审核讲师申请
  const { writeContract } = useWriteContract();

  const approveInstructor = async (instructorAddress: string) => {
    if (!isConnected || !address) {
      setError('请先连接钱包');
      return;
    }

    if (!isOwner) {
      setError('只有合约管理员可以审核申请');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      await writeContract({
        address: CONTRACTS.CoursePlatform,
        abi: COURSE_PLATFORM_ABI,
        functionName: 'approveInstructor',
        args: [instructorAddress as `0x${string}`],
      });

      console.log(`已批准讲师申请: ${instructorAddress}`);
    } catch (err: any) {
      console.error('批准讲师申请失败:', err);
      setError(err.message || '审核失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  // 检查指定地址的申请状态
  const checkApplicationStatus = async (applicantAddress: string) => {
    try {
      // 这里需要你根据实际情况实现
      // 可能需要通过事件日志或其他方式获取申请列表
      return {
        hasApplied: false,
        isInstructor: false,
      };
    } catch (err) {
      console.error('检查申请状态失败:', err);
      return null;
    }
  };

  // 设置平台手续费率
  const setPlatformFeeRate = async (newFeeRate: number) => {
    if (!isOwner) {
      setError('只有合约管理员可以设置手续费率');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      await writeContract({
        address: CONTRACTS.CoursePlatform,
        abi: COURSE_PLATFORM_ABI,
        functionName: 'setPlatformFeeRate',
        args: [BigInt(newFeeRate)],
      });

    } catch (err: any) {
      console.error('设置手续费率失败:', err);
      setError(err.message || '设置失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isOwner: Boolean(isOwner),
    owner,
    isProcessing,
    error,
    approveInstructor,
    checkApplicationStatus,
    setPlatformFeeRate,
    setError,
  };
};