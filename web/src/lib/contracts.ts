import { parseEther } from "viem";

// 合约地址配置
export const CONTRACTS = {
  YDToken: "0xcD274B0B4cf04FfB5E6f1E17f8a62239a9564173" as const,
  CoursePlatform: "0xD3Ff74DD494471f55B204CB084837D1a7f184092" as const,
};

// API配置
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// 兑换汇率常量
export const EXCHANGE_RATE = 4000; // 1 ETH = 4000 YD

// YD Token ABI (根据实际合约更新)
export const YD_TOKEN_ABI = [
  // ERC20 基础函数
  {
    name: "name",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
  {
    name: "symbol",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
  {
    name: "totalSupply",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  // 兑换功能
  {
    name: "EXCHANGE_RATE",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "buyTokensWithETH",
    type: "function",
    stateMutability: "payable",
    inputs: [],
    outputs: [],
  },
  {
    name: "sellTokensForETH",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "tokenAmount", type: "uint256" }],
    outputs: [],
  },
  {
    name: "getETHAmount",
    type: "function",
    stateMutability: "pure",
    inputs: [{ name: "tokenAmount", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "getTokenAmount",
    type: "function",
    stateMutability: "pure",
    inputs: [{ name: "ethAmount", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  // 事件
  {
    name: "TokensPurchased",
    type: "event",
    inputs: [
      { indexed: true, name: "buyer", type: "address" },
      { name: "ethAmount", type: "uint256" },
      { name: "tokenAmount", type: "uint256" },
    ],
  },
  {
    name: "TokensSold",
    type: "event",
    inputs: [
      { indexed: true, name: "seller", type: "address" },
      { name: "tokenAmount", type: "uint256" },
      { name: "ethAmount", type: "uint256" },
    ],
  },
] as const;

// Course Platform ABI (简化版)
export const COURSE_PLATFORM_ABI = [
  {
    name: "createCourse",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "price", type: "uint256" }],
    outputs: [],
  },
  {
    name: "buyCourse",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "courseId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "hasPurchasedCourse",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "courseId", type: "uint256" },
      { name: "user", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "isInstructor",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "applyToBeInstructor",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    name: "getTotalCourses",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "getCourse",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "courseId", type: "uint256" }],
    outputs: [
      { name: "instructor", type: "address" },
      { name: "price", type: "uint256" },
    ],
  },
  // Events
  {
    name: "CourseCreated",
    type: "event",
    inputs: [
      { indexed: true, name: "courseId", type: "uint256" },
      { indexed: true, name: "instructor", type: "address" },
      { name: "price", type: "uint256" },
    ],
  },
  {
    name: "CoursePurchased",
    type: "event",
    inputs: [
      { indexed: true, name: "courseId", type: "uint256" },
      { indexed: true, name: "student", type: "address" },
      { name: "price", type: "uint256" },
    ],
  },
  {
    name: "InstructorApplicationSubmitted",
    type: "event",
    inputs: [{ indexed: true, name: "applicant", type: "address" }],
  },
] as const;

// 工具函数
export const formatYDToken = (amount: bigint) => {
  return (Number(amount) / 1e18).toFixed(2);
};

export const parseYDToken = (amount: string) => {
  return parseEther(amount);
};

export const formatEther = (amount: bigint) => {
  return (Number(amount) / 1e18).toFixed(4);
};

// 兑换计算工具
export const calculateYDFromETH = (ethAmount: string): string => {
  const eth = parseFloat(ethAmount);
  return (eth * EXCHANGE_RATE).toString();
};

export const calculateETHFromYD = (ydAmount: string): string => {
  const yd = parseFloat(ydAmount);
  return (yd / EXCHANGE_RATE).toString();
};

// API 请求工具
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// 课程接口类型
export interface Course {
  id: number;
  chain_id: number;
  title: string;
  description: string;
  price: string;
  priceformatted: string;
  instructor_address: string;
  created_at: string;
}

export interface Purchase {
  id: number;
  user_address: string;
  course_chain_id: number;
  tx_hash: string;
  block_number: number;
  price: string;
  purchased_at: string;
  title?: string;
  description?: string;
  instructor_address?: string;
}