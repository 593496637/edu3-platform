import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';

// Graph 配置
const GRAPH_ENDPOINTS = {
  // 开发环境 - 本地 Graph 节点
  development: 'http://localhost:8000/subgraphs/name/edu-3',
  
  // 生产环境 - 可以是 The Graph Studio 或 Hosted Service
  production: process.env.VITE_GRAPH_ENDPOINT || 'https://api.studio.thegraph.com/query/your-deployment-id/edu-3/version/latest',
  
  // 测试网络
  testnet: process.env.VITE_GRAPH_TESTNET_ENDPOINT || 'http://localhost:8000/subgraphs/name/edu-3',
};

// 错误处理
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `GraphQL error: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
    });
  }

  if (networkError) {
    console.error(`Network error: ${networkError}`);
    
    // 如果是网络错误，可以尝试重试
    if (networkError.statusCode === 429) {
      console.warn('Rate limited by The Graph, retrying...');
    }
  }
});

// 重试配置
const retryLink = new RetryLink({
  delay: {
    initial: 300,
    max: Infinity,
    jitter: true,
  },
  attempts: {
    max: 3,
    retryIf: (error: any, _operation: any) => {
      // 只在网络错误或5xx错误时重试
      return !!error && (
        error.networkError?.statusCode >= 500 ||
        error.networkError?.statusCode === 429 ||
        !error.networkError?.statusCode
      );
    },
  },
});

// 获取当前环境的端点
function getGraphEndpoint(): string {
  if (typeof window !== 'undefined') {
    // 浏览器环境
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return GRAPH_ENDPOINTS.development;
    }
    
    if (hostname.includes('testnet') || hostname.includes('sepolia')) {
      return GRAPH_ENDPOINTS.testnet;
    }
  }
  
  return GRAPH_ENDPOINTS.production;
}

// HTTP 链接
const httpLink = createHttpLink({
  uri: getGraphEndpoint(),
  // 添加请求头
  headers: {
    'Content-Type': 'application/json',
  },
});

// 创建 Apollo Client
export const graphClient = new ApolloClient({
  link: from([
    errorLink,
    retryLink,
    httpLink,
  ]),
  cache: new InMemoryCache({
    typePolicies: {
      // 用户余额缓存策略 - 按用户地址缓存
      UserTokenBalance: {
        keyFields: ['id'], // 使用 user address 作为 key
      },
      
      // 交易记录不需要合并，按 ID 缓存
      TokenPurchase: {
        keyFields: ['id'],
      },
      TokenSale: {
        keyFields: ['id'],
      },
      CoursePurchased: {
        keyFields: ['id'],
      },
      TokenTransfer: {
        keyFields: ['id'],
      },
      
      // 查询字段的缓存策略
      Query: {
        fields: {
          // 余额查询 - 短时间缓存
          userTokenBalance: {
            merge: true,
          },
          
          // 交易历史 - 分页合并
          tokenPurchases: {
            keyArgs: ['where'], // 按查询条件缓存
            merge(existing = [], incoming) {
              return [...existing, ...incoming];
            },
          },
          
          tokenSales: {
            keyArgs: ['where'],
            merge(existing = [], incoming) {
              return [...existing, ...incoming];
            },
          },
          
          coursePurchaseds: {
            keyArgs: ['where'],
            merge(existing = [], incoming) {
              return [...existing, ...incoming];
            },
          },
          
          tokenTransfers: {
            keyArgs: ['where'],
            merge(existing = [], incoming) {
              return [...existing, ...incoming];
            },
          },
        },
      },
    },
  }),
  
  // 默认查询选项
  defaultOptions: {
    watchQuery: {
      // 缓存优先，然后网络更新
      fetchPolicy: 'cache-first',
      
      // 错误策略
      errorPolicy: 'all',
      
      // 通知所有组件
      notifyOnNetworkStatusChange: true,
    },
    
    query: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all',
    },
  },
  
  // 连接到 React DevTools
  connectToDevTools: process.env.NODE_ENV === 'development',
});

// 错误处理函数
export function handleGraphError(error: any): string {
  if (error?.networkError) {
    if (error.networkError.statusCode === 404) {
      return 'The Graph endpoint not found. Please check your configuration.';
    }
    if (error.networkError.statusCode === 429) {
      return 'Too many requests. Please try again later.';
    }
    if (error.networkError.statusCode >= 500) {
      return 'The Graph service is temporarily unavailable.';
    }
    return `Network error: ${error.networkError.message}`;
  }
  
  if (error?.graphQLErrors?.length > 0) {
    return error.graphQLErrors[0].message;
  }
  
  return error?.message || 'An unknown error occurred';
}

// 健康检查
export async function checkGraphHealth(): Promise<boolean> {
  try {
    const response = await fetch(getGraphEndpoint(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: '{ _meta { block { number } } }',
      }),
    });
    
    const data = await response.json();
    return !!(data?.data?._meta?.block?.number);
  } catch (error) {
    console.error('Graph health check failed:', error);
    return false;
  }
}

// 辅助类型定义
export interface TokenPurchase {
  id: string;
  buyer: string;
  ethAmount: string;
  tokenAmount: string;
  blockNumber: string;
  blockTimestamp: string;
  transactionHash: string;
}

export interface TokenSale {
  id: string;
  seller: string;
  tokenAmount: string;
  ethAmount: string;
  blockNumber: string;
  blockTimestamp: string;
  transactionHash: string;
}

export interface CoursePurchase {
  id: string;
  courseId: string;
  student: string;
  author: string;
  price: string;
  blockNumber: string;
  blockTimestamp: string;
  transactionHash: string;
}

export interface TokenTransfer {
  id: string;
  from: string;
  to: string;
  value: string;
  blockNumber: string;
  blockTimestamp: string;
  transactionHash: string;
}

export interface UserTokenBalance {
  id: string;
  user: string;
  balance: string;
  lastUpdated: string;
}

export interface PlatformStats {
  totalTokenSupply: string;
  totalUsers: number;
  totalTransactions: number;
  totalVolume: string;
}
