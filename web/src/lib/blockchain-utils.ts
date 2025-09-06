import { usePublicClient } from 'wagmi';
import { parseAbiItem } from 'viem';
import { CONTRACTS, COURSE_PLATFORM_ABI } from './contracts';

// 解析创建课程事件，获取真实的课程ID
export const useCourseCreationEvents = () => {
  const publicClient = usePublicClient();

  const getCourseIdFromTransaction = async (txHash: `0x${string}`) => {
    try {
      if (!publicClient) {
        throw new Error('Public client not available');
      }

      // 获取交易回执
      const receipt = await publicClient.getTransactionReceipt({
        hash: txHash,
      });

      if (!receipt) {
        throw new Error('Transaction receipt not found');
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

      throw new Error('CourseCreated event not found in transaction');
    } catch (error) {
      console.error('Error parsing course creation event:', error);
      throw error;
    }
  };

  return {
    getCourseIdFromTransaction,
  };
};

// 获取合约状态的工具函数
export const useContractReader = () => {
  const publicClient = usePublicClient();

  const readContract = async (functionName: string, args: any[] = []) => {
    try {
      if (!publicClient) {
        throw new Error('Public client not available');
      }

      const result = await publicClient.readContract({
        address: CONTRACTS.CoursePlatform,
        abi: COURSE_PLATFORM_ABI,
        functionName,
        args,
      });

      return result;
    } catch (error) {
      console.error(`Error reading contract function ${functionName}:`, error);
      throw error;
    }
  };

  const getTotalCourses = () => readContract('getTotalCourses');
  
  const getCourseInfo = (courseId: number) => readContract('getCourse', [courseId]);
  
  const checkInstructorStatus = (address: string) => readContract('isInstructor', [address]);
  
  const checkPurchaseStatus = (courseId: number, userAddress: string) => 
    readContract('hasPurchased', [courseId, userAddress]);

  return {
    readContract,
    getTotalCourses,
    getCourseInfo,
    checkInstructorStatus,
    checkPurchaseStatus,
  };
};

// 格式化工具函数
export const formatCoursePrice = (priceInWei: bigint): string => {
  return (Number(priceInWei) / 1e18).toFixed(4);
};

export const formatAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// 验证工具函数
export const validateEthereumAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export const validateTransactionHash = (hash: string): boolean => {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
};

// 错误处理工具
export const handleContractError = (error: any): string => {
  if (error?.message?.includes('User rejected')) {
    return '用户取消了交易';
  }
  
  if (error?.message?.includes('insufficient funds')) {
    return '余额不足以支付交易费用';
  }
  
  if (error?.message?.includes('execution reverted')) {
    return '智能合约执行失败，可能违反了合约规则';
  }
  
  if (error?.message?.includes('network')) {
    return '网络连接异常，请检查网络设置';
  }
  
  return error?.message || '发生未知错误';
};

// 交易状态枚举
export enum TransactionStatus {
  IDLE = 'idle',
  PENDING = 'pending',
  CONFIRMING = 'confirming',
  SUCCESS = 'success',
  ERROR = 'error',
}

// 课程创建状态
export interface CourseCreationState {
  status: TransactionStatus;
  txHash?: string;
  courseId?: number;
  error?: string;
  step: 'form' | 'blockchain' | 'api' | 'success';
}
