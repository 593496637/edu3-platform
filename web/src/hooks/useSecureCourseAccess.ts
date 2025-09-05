import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3001/api';

// 安全的课程访问 Hook
export function useSecureCourseAccess() {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 验证课程访问权限
  const verifyAccess = useCallback(async (courseId: string) => {
    if (!address || !courseId) return null;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}/verify-access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: address,
          courseId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.needsPurchase) {
          setError('请先购买课程才能访问内容');
          return { hasAccess: false, needsPurchase: true };
        }
        throw new Error(data.error || 'Verification failed');
      }

      return {
        hasAccess: true,
        accessToken: data.data.accessToken,
        needsPurchase: false,
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Access verification failed';
      setError(errorMessage);
      return { hasAccess: false, needsPurchase: false };
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  // 获取受保护的课程内容
  const getCourseContent = useCallback(async (courseId: string, accessToken: string) => {
    if (!address || !courseId || !accessToken) return null;

    try {
      const response = await fetch(
        `${API_BASE_URL}/courses/${courseId}/content?userAddress=${address}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch course content');
      }

      return data.data;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load course content';
      setError(errorMessage);
      return null;
    }
  }, [address]);

  return {
    verifyAccess,
    getCourseContent,
    isLoading,
    error,
  };
}

// 购买后自动验证 Hook
export function usePurchaseFlow() {
  const { verifyAccess } = useSecureCourseAccess();
  const [purchaseState, setPurchaseState] = useState<{
    step: 'idle' | 'purchasing' | 'verifying' | 'complete' | 'error';
    error?: string;
  }>({ step: 'idle' });

  const completePurchase = useCallback(async (courseId: string, txHash: string) => {
    setPurchaseState({ step: 'verifying' });

    try {
      // 等待一段时间让区块链确认
      await new Promise(resolve => setTimeout(resolve, 3000));

      // 验证购买状态
      const accessResult = await verifyAccess(courseId);
      
      if (accessResult?.hasAccess) {
        setPurchaseState({ step: 'complete' });
        return { success: true, accessToken: accessResult.accessToken };
      } else {
        setPurchaseState({ step: 'error', error: '购买验证失败，请稍后再试' });
        return { success: false };
      }

    } catch (error) {
      setPurchaseState({ step: 'error', error: '购买验证过程出错' });
      return { success: false };
    }
  }, [verifyAccess]);

  return {
    purchaseState,
    completePurchase,
    resetState: () => setPurchaseState({ step: 'idle' }),
  };
}

// 智能余额显示 Hook (集成新的优化查询)
export function useSmartBalanceDisplay() {
  // 这里集成新的 useSmartBalance hook
  try {
    // 尝试使用新的优化查询
    const { useSmartBalance } = require('./useSmartQueries');
    return useSmartBalance(false);
  } catch {
    // 如果新的 hooks 不可用，fallback 到原有方式
    const { useETHBalance, useYDBalance } = require('./useTokenExchange');
    const ethBalance = useETHBalance();
    const ydBalance = useYDBalance();
    
    return {
      eth: {
        formatted: ethBalance.formatted,
        source: 'rpc',
      },
      yd: {
        formatted: ydBalance.formatted,
        source: 'rpc',
      },
      strategy: 'rpc',
      isLoading: ethBalance.isLoading || ydBalance.isLoading,
      refetch: () => {
        ethBalance.refetch();
        ydBalance.refetch();
      },
    };
  }
}
