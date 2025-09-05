import { useQuery } from '@apollo/client';
import { useAccount, useBalance, useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import { useState, useEffect, useCallback, useMemo } from 'react';

import { CONTRACTS, YD_TOKEN_ABI } from '../lib/contracts';
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
  GET_USER_BALANCE_HISTORY,
  GET_MARKET_OVERVIEW,
  GET_ANALYTICS_DATA,
} from '../lib/graphql-queries';
import {
  handleGraphError,
  checkGraphHealth,
  type TokenPurchase,
  type TokenSale,
  type CoursePurchase,
  type TokenTransfer,
  type UserTokenBalance,
} from '../lib/graph-client';

// 🚀 智能余额查询 hook - 混合策略的核心实现
export function useSmartBalance(forceRPC = false) {
  const { address } = useAccount();
  const [isGraphHealthy, setIsGraphHealthy] = useState(true);
  const [strategy, setStrategy] = useState<'graph' | 'rpc' | 'hybrid'>('hybrid');

  // 🔴 RPC 查询 (必须保持用于交易前验证)
  const { 
    data: ethBalance, 
    isLoading: ethLoading, 
    refetch: refetchETH 
  } = useBalance({
    address,
    query: {
      enabled: !!address,
      staleTime: forceRPC ? 0 : 10000, // 交易前强制实时查询
      refetchInterval: forceRPC ? false : 30000,
    },
  });

  const { 
    data: ydRPCBalance, 
    isLoading: ydRPCLoading, 
    refetch: refetchYDRPC 
  } = useReadContract({
    address: CONTRACTS.YDToken,
    abi: YD_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      staleTime: forceRPC ? 0 : 10000,
      refetchInterval: forceRPC ? false : 30000,
    },
  });

  // 🟢 The Graph 查询 (用于一般浏览)
  const { 
    data: graphData, 
    loading: graphLoading, 
    error: graphError,
    refetch: refetchGraph 
  } = useQuery(GET_USER_BALANCE, {
    variables: { userAddress: address?.toLowerCase() || '' },
    skip: !address || forceRPC,
    pollInterval: isGraphHealthy ? 30000 : 0,
    errorPolicy: 'all',
    fetchPolicy: forceRPC ? 'no-cache' : 'cache-first',
  });

  // 健康检查 The Graph
  useEffect(() => {
    if (!forceRPC) {
      checkGraphHealth().then(setIsGraphHealthy);
    }
  }, [forceRPC]);

  // 智能策略选择
  const determineStrategy = useCallback(() => {
    if (forceRPC) return 'rpc';
    if (!isGraphHealthy || graphError) return 'rpc';
    if (graphData?.userTokenBalance && !graphLoading) return 'graph';
    return 'hybrid';
  }, [forceRPC, isGraphHealthy, graphError, graphData, graphLoading]);

  useEffect(() => {
    setStrategy(determineStrategy());
  }, [determineStrategy]);

  // 🎯 智能数据选择逻辑
  const smartBalance = useMemo(() => {
    const result = {
      eth: {
        value: ethBalance?.value || 0n,
        formatted: ethBalance ? formatEther(ethBalance.value) : '0',
        source: 'rpc' as const,
      },
      yd: {
        value: 0n,
        formatted: '0',
        source: 'rpc' as const,
        lastUpdated: undefined as string | undefined,
      },
      strategy,
      isRealtime: forceRPC || strategy === 'rpc',
    };

    // YD Token 余额选择逻辑
    switch (strategy) {
      case 'rpc':
        result.yd = {
          value: ydRPCBalance || 0n,
          formatted: ydRPCBalance ? formatEther(ydRPCBalance) : '0',
          source: 'rpc',
          lastUpdated: undefined,
        };
        break;
        
      case 'graph':
        const graphBalance = graphData?.userTokenBalance;
        result.yd = {
          value: graphBalance?.balance ? BigInt(graphBalance.balance) : 0n,
          formatted: graphBalance?.balance ? formatEther(BigInt(graphBalance.balance)) : '0',
          source: 'graph',
          lastUpdated: graphBalance?.lastUpdated,
        };
        break;
        
      case 'hybrid':
        // 优先使用 RPC，fallback 到 Graph
        if (ydRPCBalance !== undefined) {
          result.yd = {
            value: ydRPCBalance,
            formatted: formatEther(ydRPCBalance),
            source: 'rpc',
            lastUpdated: undefined,
          };
        } else if (graphData?.userTokenBalance) {
          const graphBalance = graphData.userTokenBalance;
          result.yd = {
            value: BigInt(graphBalance.balance),
            formatted: formatEther(BigInt(graphBalance.balance)),
            source: 'graph',
            lastUpdated: graphBalance.lastUpdated,
          };
        }
        break;
    }

    return result;
  }, [ethBalance, ydRPCBalance, graphData, strategy, forceRPC]);

  const refetchAll = useCallback(() => {
    refetchETH();
    refetchYDRPC();
    if (!forceRPC) {
      refetchGraph();
    }
  }, [refetchETH, refetchYDRPC, refetchGraph, forceRPC]);

  return {
    ...smartBalance,
    isLoading: ethLoading || (strategy === 'rpc' ? ydRPCLoading : graphLoading),
    error: graphError ? handleGraphError(graphError) : null,
    refetch: refetchAll,
    isGraphHealthy,
  };
}

// 🟢 高优先级替换 - 用户交易历史 (The Graph)
export function useTokenTransactionHistory(first = 20, skip = 0) {
  const { address } = useAccount();
  
  const { data, loading, error, fetchMore } = useQuery(GET_USER_TOKEN_TRANSACTIONS, {
    variables: { 
      userAddress: address?.toLowerCase() || '', 
      first, 
      skip 
    },
    skip: !address,
    errorPolicy: 'all',
  });

  // 合并并排序交易记录
  const transactions = useMemo(() => {
    const purchases = (data?.tokenPurchases || []).map((tx: TokenPurchase) => ({
      ...tx,
      type: 'purchase' as const,
      amount: tx.tokenAmount,
    }));
    
    const sales = (data?.tokenSales || []).map((tx: TokenSale) => ({
      ...tx,
      type: 'sale' as const,
      amount: tx.tokenAmount,
    }));

    return [...purchases, ...sales]
      .sort((a, b) => parseInt(b.blockTimestamp) - parseInt(a.blockTimestamp));
  }, [data]);

  const loadMore = useCallback(() => {
    fetchMore({
      variables: { skip: transactions.length },
    });
  }, [fetchMore, transactions.length]);

  return {
    transactions,
    purchases: data?.tokenPurchases || [],
    sales: data?.tokenSales || [],
    isLoading: loading,
    error: error ? handleGraphError(error) : null,
    loadMore,
    hasMore: transactions.length >= first,
  };
}

// 🟢 高优先级替换 - 课程购买记录查询 (The Graph)
export function useCoursePurchaseHistory() {
  const { address } = useAccount();
  
  const { data, loading, error, refetch } = useQuery(GET_USER_COURSE_PURCHASES, {
    variables: { userAddress: address?.toLowerCase() || '' },
    skip: !address,
    pollInterval: 60000, // 1分钟轮询
  });

  return {
    purchases: (data?.coursePurchaseds || []) as CoursePurchase[],
    isLoading: loading,
    error: error ? handleGraphError(error) : null,
    refetch,
  };
}

// 🔴 必须保持 RPC - 交易前的余额验证
export function useTransactionBalance() {
  return useSmartBalance(true); // 强制使用 RPC
}

// 🟡 混合策略 - 课程购买状态检查
export function useCoursePurchaseStatus(courseId?: number) {
  const { address } = useAccount();
  
  // 先用 Graph 检查
  const { data: graphData, loading: graphLoading, error: graphError } = useQuery(CHECK_COURSE_PURCHASE, {
    variables: { 
      userAddress: address?.toLowerCase() || '',
      courseId: courseId?.toString() || ''
    },
    skip: !address || !courseId,
  });

  // 🔴 如果需要准确性，可以添加 RPC 验证
  // const { data: rpcData } = useReadContract({...});

  const hasPurchased = (graphData?.coursePurchaseds?.length || 0) > 0;
  const purchaseInfo = graphData?.coursePurchaseds?.[0];

  return {
    hasPurchased,
    purchaseInfo,
    isLoading: graphLoading,
    error: graphError ? handleGraphError(graphError) : null,
  };
}

// 🟢 高优先级替换 - 平台统计数据 (The Graph)
export function usePlatformStats() {
  const { data, loading, error, refetch } = useQuery(GET_PLATFORM_STATS, {
    pollInterval: 60000, // 每分钟轮询
    errorPolicy: 'all',
  });

  const stats = useMemo(() => {
    if (!data) return null;

    return {
      token: data.ydtoken?.[0],
      totalPurchases: data.tokenPurchases?.length || 0,
      totalSales: data.tokenSales?.length || 0,
      totalCoursePurchases: data.coursePurchaseds?.length || 0,
      totalCourses: data.courseCreateds?.length || 0,
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
    };
  }, [data]);

  return {
    stats,
    isLoading: loading,
    error: error ? handleGraphError(error) : null,
    refetch,
  };
}

// 🟢 最近活动 (The Graph)
export function useRecentActivity(first = 10) {
  const { data, loading, error, refetch } = useQuery(GET_RECENT_ACTIVITY, {
    variables: { first },
    pollInterval: 30000,
  });

  const activities = useMemo(() => {
    if (!data) return [];

    return [
      ...(data.recentTokenPurchases || []).map((activity: any) => ({
        ...activity,
        type: 'token_purchase',
      })),
      ...(data.recentCoursePurchases || []).map((activity: any) => ({
        ...activity,
        type: 'course_purchase',
      })),
      ...(data.recentCourses || []).map((activity: any) => ({
        ...activity,
        type: 'course_created',
      })),
    ].sort((a, b) => parseInt(b.blockTimestamp) - parseInt(a.blockTimestamp));
  }, [data]);

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

// 🟢 讲师统计 (The Graph)
export function useInstructorStats(instructorAddress?: string) {
  const { address } = useAccount();
  const targetAddress = instructorAddress || address;
  
  const { data, loading, error, refetch } = useQuery(GET_INSTRUCTOR_STATS, {
    variables: { instructorAddress: targetAddress?.toLowerCase() || '' },
    skip: !targetAddress,
  });

  const stats = useMemo(() => {
    if (!data) return null;

    return {
      coursesCreated: data.courseCreateds?.length || 0,
      totalSales: data.coursePurchaseds?.length || 0,
      totalRevenue: data.coursePurchaseds?.reduce((sum: number, sale: CoursePurchase) => 
        sum + parseFloat(formatEther(BigInt(sale.price))), 0
      ) || 0,
      courses: data.courseCreateds || [],
      sales: data.coursePurchaseds || [],
    };
  }, [data]);

  return {
    stats,
    isLoading: loading,
    error: error ? handleGraphError(error) : null,
    refetch,
  };
}

// 🚀 新增：余额趋势分析 (The Graph)
export function useBalanceHistory(days = 7) {
  const { address } = useAccount();
  const since = Math.floor(Date.now() / 1000) - (days * 24 * 60 * 60);
  
  const { data, loading, error } = useQuery(GET_USER_BALANCE_HISTORY, {
    variables: { 
      userAddress: address?.toLowerCase() || '',
      since: since.toString()
    },
    skip: !address,
  });

  const balanceHistory = useMemo(() => {
    if (!data) return [];

    // 计算余额变化历史
    let runningBalance = 0n;
    const changes: Array<{
      timestamp: string;
      balance: string;
      change: string;
      type: 'purchase' | 'sale' | 'transfer_in' | 'transfer_out';
    }> = [];

    // 合并所有交易并按时间排序
    const allTransactions = [
      ...data.tokenPurchases.map((tx: any) => ({ ...tx, type: 'purchase', amount: tx.tokenAmount })),
      ...data.tokenSales.map((tx: any) => ({ ...tx, type: 'sale', amount: tx.tokenAmount })),
      ...data.tokenTransfersReceived.map((tx: any) => ({ ...tx, type: 'transfer_in', amount: tx.value })),
      ...data.tokenTransfersSent.map((tx: any) => ({ ...tx, type: 'transfer_out', amount: tx.value })),
    ].sort((a, b) => parseInt(a.blockTimestamp) - parseInt(b.blockTimestamp));

    // 计算每个时间点的余额
    allTransactions.forEach((tx) => {
      const amount = BigInt(tx.amount);
      
      if (tx.type === 'purchase' || tx.type === 'transfer_in') {
        runningBalance += amount;
      } else {
        runningBalance -= amount;
      }

      changes.push({
        timestamp: tx.blockTimestamp,
        balance: formatEther(runningBalance),
        change: formatEther(amount),
        type: tx.type,
      });
    });

    return changes;
  }, [data]);

  return {
    balanceHistory,
    currentBalance: data?.userTokenBalance,
    isLoading: loading,
    error: error ? handleGraphError(error) : null,
  };
}

// 🚀 新增：市场概览 (The Graph)
export function useMarketOverview(timeframe = '24h') {
  const hours = timeframe === '24h' ? 24 : timeframe === '7d' ? 168 : 720; // 30d
  const since = Math.floor(Date.now() / 1000) - (hours * 60 * 60);

  const { data, loading, error } = useQuery(GET_MARKET_OVERVIEW, {
    variables: { timeframe: since.toString() },
    pollInterval: 60000,
  });

  const marketData = useMemo(() => {
    if (!data) return null;

    const purchases = data.recentPurchases || [];
    const sales = data.recentSales || [];

    return {
      totalVolume: {
        eth: purchases.reduce((sum: number, tx: any) => 
          sum + parseFloat(formatEther(BigInt(tx.ethAmount))), 0
        ),
        yd: purchases.reduce((sum: number, tx: any) => 
          sum + parseFloat(formatEther(BigInt(tx.tokenAmount))), 0
        ),
      },
      transactionCount: purchases.length + sales.length,
      averagePrice: purchases.length > 0 ? 
        purchases.reduce((sum: number, tx: any) => 
          sum + (parseFloat(formatEther(BigInt(tx.ethAmount))) / parseFloat(formatEther(BigInt(tx.tokenAmount)))), 0
        ) / purchases.length : 0,
      priceChange: {}, // 可以计算价格变化
      token: data.ydtoken?.[0],
    };
  }, [data]);

  return {
    marketData,
    isLoading: loading,
    error: error ? handleGraphError(error) : null,
  };
}

// 🎯 使用指南 Hook - 帮助开发者选择正确的策略
export function useQueryStrategy() {
  return {
    // 🟢 推荐使用 The Graph 的场景
    forBrowsing: {
      balance: () => useSmartBalance(false),
      transactions: useTokenTransactionHistory,
      courseHistory: useCoursePurchaseHistory,
      platformStats: usePlatformStats,
      recentActivity: useRecentActivity,
      instructorStats: useInstructorStats,
      balanceHistory: useBalanceHistory,
      marketOverview: useMarketOverview,
    },
    
    // 🔴 必须使用 RPC 的场景
    forTransactions: {
      balance: () => useTransactionBalance(),
      // writeContract 相关的 hooks 保持现有实现
    },
    
    // 🟡 混合策略的场景
    forValidation: {
      coursePurchase: useCoursePurchaseStatus,
    },
  };
}
