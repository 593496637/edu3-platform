import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { apiRequest, type Course, type Purchase } from '../lib/contracts';

// 钱包登录hook
export const useWalletAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { address } = useAccount();

  useEffect(() => {
    // 检查本地存储的token
    const token = localStorage.getItem('auth_token');
    const tokenAddress = localStorage.getItem('auth_address');
    
    if (token && tokenAddress && tokenAddress.toLowerCase() === address?.toLowerCase()) {
      setAuthToken(token);
      setIsAuthenticated(true);
    } else {
      // 清除过期或不匹配的token
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_address');
      setIsAuthenticated(false);
      setAuthToken(null);
    }
  }, [address]);

  const login = async (address: string, message: string, signature: string) => {
    setIsLoading(true);
    try {
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ address, message, signature }),
      });

      if (response.success) {
        const { token } = response.data;
        setAuthToken(token);
        setIsAuthenticated(true);
        
        // 保存到本地存储
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_address', address.toLowerCase());
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setAuthToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_address');
  };

  return {
    isAuthenticated,
    authToken,
    isLoading,
    login,
    logout,
  };
};

// 课程数据hook
export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiRequest('/courses');
      if (response.success) {
        setCourses(response.data.courses);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch courses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return {
    courses,
    isLoading,
    error,
    refetch: fetchCourses,
  };
};

// 用户购买记录hook
export const useUserPurchases = (address?: string) => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPurchases = async () => {
    if (!address) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiRequest(`/users/${address}/purchases`);
      if (response.success) {
        setPurchases(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch purchases');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (address) {
      fetchPurchases();
    }
  }, [address]);

  return {
    purchases,
    isLoading,
    error,
    refetch: fetchPurchases,
  };
};

// 余额查询hook
export const useBalance = (address?: string) => {
  const [balance, setBalance] = useState<string>('0');
  const [balanceFormatted, setBalanceFormatted] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async () => {
    if (!address) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiRequest(`/blockchain/balance/${address}`);
      if (response.success) {
        setBalance(response.data.balance);
        setBalanceFormatted(response.data.balanceFormatted);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch balance');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (address) {
      fetchBalance();
    }
  }, [address]);

  return {
    balance,
    balanceFormatted,
    isLoading,
    error,
    refetch: fetchBalance,
  };
};

// 购买状态检查hook
export const usePurchaseStatus = (courseId?: number, address?: string) => {
  const [hasPurchased, setHasPurchased] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkPurchaseStatus = async () => {
    if (!courseId || !address) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiRequest(`/blockchain/purchased/${courseId}/${address}`);
      if (response.success) {
        setHasPurchased(response.data.hasPurchased);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check purchase status');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (courseId && address) {
      checkPurchaseStatus();
    }
  }, [courseId, address]);

  return {
    hasPurchased,
    isLoading,
    error,
    refetch: checkPurchaseStatus,
  };
};

// 讲师状态检查hook
export const useInstructorStatus = (address?: string) => {
  const [isInstructor, setIsInstructor] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkInstructorStatus = async () => {
    if (!address) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiRequest(`/blockchain/instructor/${address}`);
      if (response.success) {
        setIsInstructor(response.data.isInstructor);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check instructor status');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (address) {
      checkInstructorStatus();
    }
  }, [address]);

  return {
    isInstructor,
    isLoading,
    error,
    refetch: checkInstructorStatus,
  };
};

// 购买验证hook
export const usePurchaseVerification = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyPurchase = async (txHash: string, courseId: number, userAddress: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiRequest('/purchases/verify', {
        method: 'POST',
        body: JSON.stringify({ txHash, courseId, userAddress }),
      });

      if (response.success) {
        return response.data;
      }
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify purchase';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    verifyPurchase,
    isLoading,
    error,
  };
};
