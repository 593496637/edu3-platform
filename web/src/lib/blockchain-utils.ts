import { usePublicClient } from 'wagmi';
import { parseAbiItem, decodeEventLog } from 'viem';
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

          // 使用更robust的事件解析方法
          const decodedLog = decodeEventLog({
            abi: [courseCreatedEvent],
            data: log.data,
            topics: log.topics,
          });

          if (decodedLog.eventName === 'CourseCreated') {
            return {
              courseId: Number(decodedLog.args.courseId),
              author: decodedLog.args.author,
              price: decodedLog.args.price,
              blockNumber: receipt.blockNumber,
              transactionHash: txHash,
            };
          }
        } catch (parseError) {
          // 如果解析失败，继续尝试下一个日志
          console.warn('Failed to parse log:', parseError);
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

  const checkInstructorApplication = (address: string) => readContract('instructorApplications', [address]);

  return {
    readContract,
    getTotalCourses,
    getCourseInfo,
    checkInstructorStatus,
    checkPurchaseStatus,
    checkInstructorApplication,
  };
};

// 格式化工具函数
export const formatCoursePrice = (priceInWei: bigint): string => {
  return (Number(priceInWei) / 1e18).toFixed(4);
};

export const formatAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatYDPrice = (ydAmount: bigint): string => {
  const ydValue = Number(ydAmount) / 1e18;
  const ethValue = ydValue / 4000; // 按汇率转换回ETH显示
  return `${ethValue.toFixed(4)} ETH (${ydValue.toFixed(0)} YD)`;
};

// 验证工具函数
export const validateEthereumAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export const validateTransactionHash = (hash: string): boolean => {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
};

export const validateCourseForm = (formData: {
  title: string;
  description: string;
  content: string;
  price: string;
  category: string;
}) => {
  const errors: string[] = [];

  if (!formData.title.trim()) {
    errors.push('课程标题不能为空');
  } else if (formData.title.length < 5) {
    errors.push('课程标题至少需要5个字符');
  }

  if (!formData.description.trim()) {
    errors.push('课程描述不能为空');
  } else if (formData.description.length < 20) {
    errors.push('课程描述至少需要20个字符');
  }

  if (!formData.content.trim()) {
    errors.push('课程内容不能为空');
  } else if (formData.content.length < 50) {
    errors.push('课程内容至少需要50个字符');
  }

  if (!formData.price || parseFloat(formData.price) <= 0) {
    errors.push('请输入有效的课程价格');
  } else if (parseFloat(formData.price) > 100) {
    errors.push('课程价格不能超过100 ETH');
  }

  if (!formData.category) {
    errors.push('请选择课程分类');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
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
    const message = error.message;
    
    if (message.includes('Only instructors')) {
      return '只有认证讲师才能创建课程，请先申请成为讲师';
    }
    
    if (message.includes('Price must be greater than 0')) {
      return '课程价格必须大于0';
    }
    
    if (message.includes('Already an instructor')) {
      return '您已经是认证讲师了';
    }
    
    if (message.includes('Application already submitted')) {
      return '您已经提交过讲师申请，请等待审核';
    }
    
    if (message.includes('Course does not exist')) {
      return '课程不存在';
    }
    
    if (message.includes('Course is not active')) {
      return '课程已下架';
    }
    
    if (message.includes('Already purchased')) {
      return '您已经购买过这门课程';
    }
    
    if (message.includes('Insufficient YD token balance')) {
      return 'YD代币余额不足';
    }
    
    return '智能合约执行失败，请检查交易条件';
  }
  
  if (error?.message?.includes('network')) {
    return '网络连接异常，请检查网络设置';
  }
  
  if (error?.message?.includes('gas')) {
    return 'Gas费用不足，请增加Gas限制';
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

// 课程数据类型
export interface CourseData {
  id?: number;
  title: string;
  description: string;
  content: string;
  price: string;
  duration?: string;
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  category: string;
  tags?: string[];
  requirements?: string[];
  objectives?: string[];
  thumbnail?: string;
  onChainId?: number;
  instructorAddress?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 价格转换工具
export const convertETHToYD = (ethAmount: string): bigint => {
  const eth = parseFloat(ethAmount);
  const yd = eth * 4000; // 1 ETH = 4000 YD
  return BigInt(Math.floor(yd * 1e18)); // 转换为wei单位
};

export const convertYDToETH = (ydAmount: bigint): string => {
  const yd = Number(ydAmount) / 1e18;
  const eth = yd / 4000;
  return eth.toFixed(4);
};

// 等待交易确认的工具函数
export const waitForTransactionConfirmation = async (
  publicClient: any,
  txHash: `0x${string}`,
  maxWaitTime = 300000 // 5分钟
): Promise<any> => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitTime) {
    try {
      const receipt = await publicClient.getTransactionReceipt({
        hash: txHash,
      });
      
      if (receipt) {
        return receipt;
      }
    } catch (error) {
      // 继续等待
    }
    
    // 等待3秒后重试
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  throw new Error('交易确认超时');
};

// 批量读取合约数据
export const batchReadContract = async (
  publicClient: any,
  calls: Array<{
    functionName: string;
    args?: any[];
  }>
) => {
  try {
    if (!publicClient) {
      throw new Error('Public client not available');
    }

    const contracts = calls.map(call => ({
      address: CONTRACTS.CoursePlatform,
      abi: COURSE_PLATFORM_ABI,
      functionName: call.functionName,
      args: call.args || [],
    }));

    const results = await publicClient.multicall({
      contracts,
    });

    return results.map((result, index) => ({
      ...calls[index],
      result: result.status === 'success' ? result.result : null,
      error: result.status === 'failure' ? result.error : null,
    }));
  } catch (error) {
    console.error('Batch read contract error:', error);
    throw error;
  }
};
