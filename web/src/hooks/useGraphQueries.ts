import { useQuery } from '@apollo/client';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import {
  GET_USER_BALANCE,
  GET_USER_TOKEN_TRANSACTIONS,
  GET_USER_COURSE_PURCHASES,
  CHECK_COURSE_PURCHASE,
  GET_USER_TOKEN_TRANSFERS,
  GET_PLATFORM_STATS,
  GET_RECENT_ACTIVITY,
  GET_INSTRUCTOR_STATS,
  GET_COURSE_PURCHASES,
} from '../lib/graphql-queries';
import {
  TokenPurchase,
  TokenSale,
  CoursePurchase,
  TokenTransfer,
  UserTokenBalance,
  PlatformStats,
  handleGraphError,
} from '../lib/graph-client';

// 用户余额查询 (The Graph)
export function useGraphBalance() {
  const { address } = useAccount();
  
  const { data, loading, error, refetch } = useQuery(GET_USER_BALANCE, {
    variables: { userAddress: address?.toLowerCase() || '' },
    skip: !address,
    pollInterval: 30000, // 每30秒轮询一次
  });

  const balance = data?.userTokenBalance;
  
  return {
    balance: balance?.balance ? BigInt(balance.balance) : 0n,
    formatted: balance?.balance ? formatEther(BigInt(balance.balance)) : '0',
    lastUpdated: balance?.lastUpdated,
    isLoading: loading,
    error: error ? handleGraphError(error) : null,
    refetch,
  };
}

// 用户代币交易历史
export function useTokenTransactionHistory(first = 20, skip = 0) {
  const { address } = useAccount();
  
  const { data, loading, error, fetchMore } = useQuery(GET_USER_TOKEN_TRANSACTIONS, {
    variables: { 
      userAddress: address?.toLowerCase() || '', 
      first, 
      skip 
    },
    skip: !address,
  });

  // 合并购买和出售记录，按时间排序
  const transactions = [
    ...(data?.tokenPurchases || []).map((tx: TokenPurchase) => ({
      ...tx,
      type: 'purchase' as const,
      amount: tx.tokenAmount,
      ethAmount: tx.ethAmount,
    })),
    ...(data?.tokenSales || []).map((tx: TokenSale) => ({
      ...tx,
      type: 'sale' as const,
      amount: tx.tokenAmount,
      ethAmount: tx.ethAmount,
    })),
  ].sort((a, b) => parseInt(b.blockTimestamp) - parseInt(a.blockTimestamp));

  const loadMore = () => {
    fetchMore({
      variables: { skip: transactions.length },
    });
  };

  return {
    transactions,
    purchases: data?.tokenPurchases || [],
    sales: data?.tokenSales || [],
    isLoading: loading,
    error: error ? handleGraphError(error) : null,
    loadMore,
    hasMore: transactions.length >= first, // 简单判断是否还有更多
  };
}

// 用户课程购买记录
export function useCoursePurchaseHistory() {
  const { address } = useAccount();
  
  const { data, loading, error, refetch } = useQuery(GET_USER_COURSE_PURCHASES, {
    variables: { userAddress: address?.toLowerCase() || '' },
    skip: !address,
  });

  return {
    purchases: (data?.coursePurchaseds || []) as CoursePurchase[],
    isLoading: loading,
    error: error ? handleGraphError(error) : null,
    refetch,
  };
}

// 检查用户是否购买了特定课程
export function useCoursePurchaseStatus(courseId?: number) {
  const { address } = useAccount();
  
  const { data, loading, error } = useQuery(CHECK_COURSE_PURCHASE, {
    variables: { 
      userAddress: address?.toLowerCase() || '',
      courseId: courseId?.toString() || ''
    },
    skip: !address || !courseId,
  });

  const hasPurchased = (data?.coursePurchaseds?.length || 0) > 0;
  const purchaseInfo = data?.coursePurchaseds?.[0];

  return {
    hasPurchased,
    purchaseInfo,
    isLoading: loading,
    error: error ? handleGraphError(error) : null,
  };
}

// 用户所有代币转账记录
export function useTokenTransferHistory(first = 20, skip = 0) {
  const { address } = useAccount();
  
  const { data, loading, error, fetchMore } = useQuery(GET_USER_TOKEN_TRANSFERS, {
    variables: { 
      userAddress: address?.toLowerCase() || '', 
      first, 
      skip 
    },
    skip: !address,
  });

  // 合并接收和发送的转账记录
  const transfers = [
    ...(data?.tokenTransfersReceived || []).map((tx: TokenTransfer) => ({
      ...tx,
      direction: 'received' as const,
    })),
    ...(data?.tokenTransfersSent || []).map((tx: TokenTransfer) => ({
      ...tx,
      direction: 'sent' as const,
    })),
  ].sort((a, b) => parseInt(b.blockTimestamp) - parseInt(a.blockTimestamp));

  const loadMore = () => {
    fetchMore({
      variables: { skip: transfers.length },
    });
  };

  return {
    transfers,
    received: data?.tokenTransfersReceived || [],
    sent: data?.tokenTransfersSent || [],
    isLoading: loading,
    error: error ? handleGraphError(error) : null,
    loadMore,
    hasMore: transfers.length >= first,
  };
}

// 平台统计数据
export function usePlatformStats() {
  const { data, loading, error, refetch } = useQuery(GET_PLATFORM_STATS, {
    pollInterval: 60000, // 每分钟轮询一次
  });

  // 计算统计数据
  const stats = data ? {
    token: data.ydtoken,
    totalPurchases: data.tokenPurchases?.length || 0,
    totalSales: data.tokenSales?.length || 0,
    totalCoursePurchases: data.coursePurchaseds?.length || 0,
    totalInstructors: data.instructorApproveds?.length || 0,
    totalVolume: {
      eth: data.tokenPurchases?.reduce((sum: number, tx: TokenPurchase) => 
        sum + parseFloat(formatEther(BigInt(tx.ethAmount))), 0
      ) || 0,
      yd: data.tokenPurchases?.reduce((sum: number, tx: TokenPurchase) => 
        sum + parseFloat(formatEther(BigInt(tx.tokenAmount))), 0
      ) || 0,
    },
    courseRevenue: data.coursePurchaseds?.reduce((sum: number, tx: CoursePurchase) => 
      sum + parseFloat(formatEther(BigInt(tx.price))), 0
    ) || 0,
  } : null;

  return {
    stats,
    isLoading: loading,
    error: error ? handleGraphError(error) : null,
    refetch,
  };
}

// 最近平台活动
export function useRecentActivity(first = 10) {
  const { data, loading, error, refetch } = useQuery(GET_RECENT_ACTIVITY, {
    variables: { first },
    pollInterval: 30000, // 每30秒轮询
  });

  // 合并所有活动并按时间排序
  const activities = [
    ...(data?.recentTokenPurchases || []).map((activity: any) => ({
      ...activity,
      type: 'token_purchase',
    })),
    ...(data?.recentCoursePurchases || []).map((activity: any) => ({
      ...activity,
      type: 'course_purchase',
    })),
    ...(data?.recentCourses || []).map((activity: any) => ({
      ...activity,
      type: 'course_created',
    })),
  ].sort((a, b) => parseInt(b.blockTimestamp) - parseInt(a.blockTimestamp));

  return {
    activities,
    tokenPurchases: data?.recentTokenPurchases || [],
    coursePurchases: data?.recentCoursePurchases || [],
    coursesCreated: data?.recentCourses || [],
    isLoading: loading,
    error: error ? handleGraphError(error) : null,
    refetch,
  };
}

// 讲师统计数据
export function useInstructorStats(instructorAddress?: string) {
  const { address } = useAccount();
  const targetAddress = instructorAddress || address;
  
  const { data, loading, error, refetch } = useQuery(GET_INSTRUCTOR_STATS, {
    variables: { instructorAddress: targetAddress?.toLowerCase() || '' },
    skip: !targetAddress,
  });

  const stats = data ? {
    coursesCreated: data.courseCreateds?.length || 0,
    totalSales: data.coursePurchaseds?.length || 0,
    totalRevenue: data.coursePurchaseds?.reduce((sum: number, sale: CoursePurchase) => 
      sum + parseFloat(formatEther(BigInt(sale.price))), 0
    ) || 0,
    courses: data.courseCreateds || [],
    sales: data.coursePurchaseds || [],
  } : null;

  return {
    stats,
    isLoading: loading,
    error: error ? handleGraphError(error) : null,
    refetch,
  };
}

// 特定课程的购买统计
export function useCoursePurchaseStats(courseId?: number) {
  const { data, loading, error } = useQuery(GET_COURSE_PURCHASES, {
    variables: { courseId: courseId?.toString() || '' },
    skip: !courseId,
  });

  const stats = data ? {
    totalPurchases: data.coursePurchaseds?.length || 0,
    totalRevenue: data.coursePurchaseds?.reduce((sum: number, purchase: CoursePurchase) => 
      sum + parseFloat(formatEther(BigInt(purchase.price))), 0
    ) || 0,
    purchases: data.coursePurchaseds || [],
    students: [...new Set(data.coursePurchaseds?.map((p: CoursePurchase) => p.student) || [])],
  } : null;

  return {
    stats,
    isLoading: loading,
    error: error ? handleGraphError(error) : null,
  };
}