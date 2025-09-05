import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { CONTRACTS, YD_TOKEN_ABI, EXCHANGE_RATE } from '@/lib/contracts';
import { useState, useCallback } from 'react';

// 获取 ETH 余额
export function useETHBalance() {
  const { address } = useAccount();
  
  const { data: balance, isLoading, refetch } = useBalance({
    address,
    query: {
      enabled: !!address,
    },
  });

  return {
    balance: balance?.value || 0n,
    formatted: balance ? formatEther(balance.value) : '0',
    isLoading,
    refetch,
  };
}

// 获取 YD Token 余额
export function useYDBalance() {
  const { address } = useAccount();
  
  const { data: balance, isLoading, refetch } = useReadContract({
    address: CONTRACTS.YDToken,
    abi: YD_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return {
    balance: balance || 0n,
    formatted: balance ? formatEther(balance) : '0',
    isLoading,
    refetch,
  };
}

// 购买 YD Token (ETH → YD)
export function useBuyYDTokens() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { writeContract, data: hash, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const buyTokens = useCallback(async (ethAmount: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const ethValue = parseEther(ethAmount);
      
      writeContract({
        address: CONTRACTS.YDToken,
        abi: YD_TOKEN_ABI,
        functionName: 'buyTokensWithETH',
        value: ethValue,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transaction failed');
    } finally {
      setIsLoading(false);
    }
  }, [writeContract]);

  return {
    buyTokens,
    hash,
    isLoading: isLoading || isPending || isConfirming,
    isSuccess,
    error,
  };
}

// 出售 YD Token (YD → ETH)
export function useSellYDTokens() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { writeContract, data: hash, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const sellTokens = useCallback(async (ydAmount: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const tokenValue = parseEther(ydAmount);
      
      writeContract({
        address: CONTRACTS.YDToken,
        abi: YD_TOKEN_ABI,
        functionName: 'sellTokensForETH',
        args: [tokenValue],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transaction failed');
    } finally {
      setIsLoading(false);
    }
  }, [writeContract]);

  return {
    sellTokens,
    hash,
    isLoading: isLoading || isPending || isConfirming,
    isSuccess,
    error,
  };
}

// 兑换汇率查询
export function useExchangeRate() {
  const { data: exchangeRate } = useReadContract({
    address: CONTRACTS.YDToken,
    abi: YD_TOKEN_ABI,
    functionName: 'EXCHANGE_RATE',
  });

  return {
    rate: exchangeRate || BigInt(EXCHANGE_RATE),
    formatted: exchangeRate ? Number(exchangeRate) : EXCHANGE_RATE,
  };
}

// 计算兑换金额
export function useExchangeCalculations() {
  const { formatted: rate } = useExchangeRate();
  
  const calculateYDFromETH = useCallback((ethAmount: string): string => {
    const eth = parseFloat(ethAmount || '0');
    return (eth * rate).toFixed(2);
  }, [rate]);
  
  const calculateETHFromYD = useCallback((ydAmount: string): string => {
    const yd = parseFloat(ydAmount || '0');
    return (yd / rate).toFixed(6);
  }, [rate]);
  
  return {
    calculateYDFromETH,
    calculateETHFromYD,
    rate,
  };
}