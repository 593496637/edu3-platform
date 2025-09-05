import { parseEther } from "viem";

// 合约地址配置
export const CONTRACTS = {
  YDToken: "0xcD274B0B4cf04FfB5E6f1E17f8a62239a9564173" as const,
  CoursePlatform: "0xD3Ff74DD494471f55B204CB084837D1a7f184092" as const,
};

// API配置
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// YD Token ABI (简化版)
export const YD_TOKEN_ABI = [
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
  // Exchange functions
  {
    name: "buyTokens",
    type: "function",
    stateMutability: "payable",
    inputs: [],
    outputs: [],
  },
  {
    name: "sellTokens",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
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
