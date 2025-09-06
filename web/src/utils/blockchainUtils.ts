import { parseUnits, parseAbiItem } from 'viem';
import type { PublicClient } from 'viem';

// 价格转换工具
export const convertPriceToWei = (priceInYD: string): bigint => {
  const price = parseFloat(priceInYD);
  if (isNaN(price) || price <= 0) {
    throw new Error('无效的价格');
  }
  return parseUnits(price.toString(), 18);
};

// 解析课程创建事件
export const parseCourseCreatedEvent = async (
  txHash: `0x${string}`,
  publicClient: PublicClient | undefined,
  contractAddress: string
): Promise<number> => {
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
      if (log.address.toLowerCase() !== contractAddress.toLowerCase()) {
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
};

// 错误消息处理
export const getErrorMessage = (error: any): string => {
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