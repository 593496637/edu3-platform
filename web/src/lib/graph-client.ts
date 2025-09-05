import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

// The Graph 端点配置
const GRAPH_ENDPOINTS = {
  // 本地开发环境
  local: 'http://localhost:8000/subgraphs/name/edu-3',
  
  // Graph Studio 托管版本 (替换为你的实际 URL)
  hosted: 'https://api.studio.thegraph.com/query/your-subgraph-id/edu-3/version/latest',
  
  // Sepolia 子图网络 (如果有的话)
  sepolia: 'https://api.thegraph.com/subgraphs/name/your-username/edu3-sepolia'
};

// 根据环境选择端点
const getGraphEndpoint = () => {
  // 开发环境优先使用本地，然后回退到托管版本
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_GRAPH_URL || GRAPH_ENDPOINTS.local;
  }
  
  // 生产环境使用托管版本
  return import.meta.env.VITE_GRAPH_URL || GRAPH_ENDPOINTS.hosted;
};

// 创建 HTTP Link
const httpLink = createHttpLink({
  uri: getGraphEndpoint(),
});

// Apollo Client 配置
export const graphClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // 配置分页合并策略
          tokenPurchases: {
            keyArgs: ["where"],
            merge(existing = [], incoming) {
              return [...existing, ...incoming];
            },
          },
          tokenSales: {
            keyArgs: ["where"],
            merge(existing = [], incoming) {
              return [...existing, ...incoming];
            },
          },
          coursePurchaseds: {
            keyArgs: ["where"],
            merge(existing = [], incoming) {
              return [...existing, ...incoming];
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'ignore',
      fetchPolicy: 'cache-and-network', // 优先使用缓存，后台更新
    },
    query: {
      errorPolicy: 'ignore',
      fetchPolicy: 'cache-first', // 优先使用缓存
    },
  },
});

// 错误处理辅助函数
export const handleGraphError = (error: any) => {
  console.warn('Graph query failed:', error);
  
  // 可以在这里添加错误上报
  if (import.meta.env.DEV) {
    console.error('Graph Error Details:', error);
  }
  
  return null;
};

// Graph 健康检查
export const checkGraphHealth = async (): Promise<boolean> => {
  try {
    const result = await graphClient.query({
      query: require('./graphql-queries').GET_PLATFORM_STATS,
      fetchPolicy: 'network-only',
      errorPolicy: 'none',
    });
    
    return !!result.data;
  } catch (error) {
    console.warn('Graph health check failed:', error);
    return false;
  }
};

// 类型定义
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
  instructor: string;
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
  ydtoken?: {
    id: string;
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
  };
  tokenPurchases: TokenPurchase[];
  tokenSales: TokenSale[];
  coursePurchaseds: CoursePurchase[];
  instructorApproveds: Array<{
    id: string;
    instructor: string;
  }>;
}