import { useAccount, useBalance, useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import { CONTRACTS, YD_TOKEN_ABI } from '../lib/contracts';
import { useState, useEffect } from 'react';

// 重新导入新的智能查询
import { useSmartBalance, useTransactionBalance } from './useSmartQueries';

/**
 * @deprecated 请使用 useSmartBalance 替代
 * 保留此文件用于向后兼容性
 */

// Graph 查询 hook (已废弃，请使用 useSmartBalance)
export function useGraphBalance() {
  console.warn('useGraphBalance is deprecated. Please use useSmartBalance from useSmartQueries.ts');
  
  const { address } = useAccount();
  const [graphBalance, setGraphBalance] = useState<{
    eth: string;
    yd: string;
    lastUpdated?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!address) return;

    const fetchGraphBalance = async () => {
      setIsLoading(true);
      try {
        // 这里可以替换为你的 Graph 端点
        const GRAPH_URL = 'http://localhost:8000/subgraphs/name/edu-3';
        
        const query = `
          query GetUserBalance($userAddress: String!) {
            userTokenBalance(id: $userAddress) {
              balance
              lastUpdated
            }
          }
        `;

        const response = await fetch(GRAPH_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query,
            variables: { userAddress: address.toLowerCase() }
          })
        });

        const { data } = await response.json();
        
        if (data?.userTokenBalance) {
          setGraphBalance({
            eth: '0', // Graph 通常不索引 ETH 余额
            yd: formatEther(BigInt(data.userTokenBalance.balance)),
            lastUpdated: data.userTokenBalance.lastUpdated
          });
        }
      } catch (error) {
        console.log('Graph query failed, falling back to RPC');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGraphBalance();
  }, [address]);

  return { graphBalance, isLoading };
}

// 混合查询策略 (已升级，建议使用 useSmartBalance)
export function useOptimizedBalance() {
  console.warn('useOptimizedBalance is deprecated. Please use useSmartBalance from useSmartQueries.ts');
  
  const { address } = useAccount();
  
  // RPC 查询（主要数据源）
  const { data: ethBalance, isLoading: ethLoading, refetch: refetchETH } = useBalance({
    address,
    query: {
      enabled: !!address,
      // 设置缓存时间，减少 RPC 调用
      staleTime: 10000, // 10秒内认为数据是新鲜的
      refetchInterval: 30000, // 每30秒自动刷新
    },
  });

  const { data: ydBalance, isLoading: ydLoading, refetch: refetchYD } = useReadContract({
    address: CONTRACTS.YDToken,
    abi: YD_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      staleTime: 10000,
      refetchInterval: 30000,
    },
  });

  // Graph 查询（辅助数据源）
  const { graphBalance, isLoading: graphLoading } = useGraphBalance();

  // 智能选择数据源
  const getDisplayBalance = () => {
    return {
      eth: {
        value: ethBalance?.value || 0n,
        formatted: ethBalance ? formatEther(ethBalance.value) : '0',
        source: 'rpc'
      },
      yd: {
        value: ydBalance || 0n,
        formatted: ydBalance ? formatEther(ydBalance) : (graphBalance?.yd || '0'),
        source: ydBalance ? 'rpc' : 'graph'
      }
    };
  };

  return {
    balances: getDisplayBalance(),
    isLoading: ethLoading || ydLoading,
    isGraphLoading: graphLoading,
    refetch: () => {
      refetchETH();
      refetchYD();
    },
    // 数据来源信息
    sources: {
      eth: 'rpc',
      yd: ydBalance ? 'rpc' : 'graph'
    }
  };
}

// 🟢 推荐使用的新 API (转发到新的实现)
export function useBalanceForBrowsing() {
  return useSmartBalance(false); // 使用混合策略
}

export function useBalanceForTransaction() {
  return useTransactionBalance(); // 强制使用 RPC
}

// 原有的简单查询 hooks（保持兼容性）
export function useETHBalance() {
  const { address } = useAccount();
  
  const { data: balance, isLoading, refetch } = useBalance({
    address,
    query: {
      enabled: !!address,
      staleTime: 10000,
      refetchInterval: 30000,
    },
  });

  return {
    balance: balance?.value || 0n,
    formatted: balance ? formatEther(balance.value) : '0',
    isLoading,
    refetch,
  };
}

export function useYDBalance() {
  const { address } = useAccount();
  
  const { data: balance, isLoading, refetch } = useReadContract({
    address: CONTRACTS.YDToken,
    abi: YD_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      staleTime: 10000,
      refetchInterval: 30000,
    },
  });

  return {
    balance: balance || 0n,
    formatted: balance ? formatEther(balance) : '0',
    isLoading,
    refetch,
  };
}

// 🚀 迁移指南
export const MIGRATION_GUIDE = {
  useGraphBalance: 'useSmartBalance(false)',
  useOptimizedBalance: 'useSmartBalance(false)',
  useBalanceForTransaction: 'useTransactionBalance()',
  useETHBalance: 'useSmartBalance(false).eth',
  useYDBalance: 'useSmartBalance(false).yd',
} as const;

export default {
  // 新的推荐 API
  useBalanceForBrowsing,
  useBalanceForTransaction,
  
  // 兼容性 API (废弃)
  useOptimizedBalance,
  useGraphBalance,
  useETHBalance,
  useYDBalance,
  
  // 迁移指南
  MIGRATION_GUIDE,
};
