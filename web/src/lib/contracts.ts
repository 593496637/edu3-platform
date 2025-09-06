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

// Course Platform ABI (完整版本，包含讲师申请和owner)
export const COURSE_PLATFORM_ABI = [
  // 所有权相关
  {
    name: "owner",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
  // 课程相关
  {
    name: "createCourse",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "price", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "buyCourse",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "courseId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "hasPurchased",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "courseId", type: "uint256" },
      { name: "user", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "hasUserPurchasedCourse",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "courseId", type: "uint256" },
      { name: "user", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
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
      {
        name: "",
        type: "tuple",
        components: [
          { name: "id", type: "uint256" },
          { name: "author", type: "address" },
          { name: "price", type: "uint256" },
          { name: "isActive", type: "bool" },
          { name: "createdAt", type: "uint256" },
          { name: "totalSales", type: "uint256" },
          { name: "studentCount", type: "uint256" },
        ],
      },
    ],
  },
  {
    name: "getUserPurchasedCourses",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256[]" }],
  },
  {
    name: "getAuthorCourses",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "author", type: "address" }],
    outputs: [{ name: "", type: "uint256[]" }],
  },
  // 讲师相关
  {
    name: "isInstructor",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "instructorApplications",
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
    name: "approveInstructor",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "instructor", type: "address" }],
    outputs: [],
  },
  // 管理功能
  {
    name: "setPlatformFeeRate",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "newFeeRate", type: "uint256" }],
    outputs: [],
  },
  {
    name: "platformFeeRate",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "toggleCourseStatus",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "courseId", type: "uint256" }],
    outputs: [],
  },
  // Events
  {
    name: "CourseCreated",
    type: "event",
    inputs: [
      { indexed: true, name: "courseId", type: "uint256" },
      { indexed: true, name: "author", type: "address" },
      { name: "price", type: "uint256" },
    ],
  },
  {
    name: "CoursePurchased",
    type: "event",
    inputs: [
      { indexed: true, name: "courseId", type: "uint256" },
      { indexed: true, name: "student", type: "address" },
      { indexed: true, name: "author", type: "address" },
      { name: "price", type: "uint256" },
    ],
  },
  {
    name: "InstructorApplicationSubmitted",
    type: "event",
    inputs: [{ indexed: true, name: "applicant", type: "address" }],
  },
  {
    name: "InstructorApproved",
    type: "event",
    inputs: [{ indexed: true, name: "instructor", type: "address" }],
  },
  {
    name: "PlatformFeeUpdated",
    type: "event",
    inputs: [{ name: "newFeeRate", type: "uint256" }],
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

// 价格转换工具函数
export const convertETHToYD = (ethAmount: string): string => {
  const eth = parseFloat(ethAmount);
  return (eth * EXCHANGE_RATE).toString();
};

export const convertYDToETH = (ydAmount: string): string => {
  const yd = parseFloat(ydAmount);
  return (yd / EXCHANGE_RATE).toString();
};

// Wei单位转换
export const convertETHToYDWei = (ethAmount: string): bigint => {
  const eth = parseFloat(ethAmount);
  const yd = eth * EXCHANGE_RATE;
  return parseEther(yd.toString());
};

export const convertYDWeiToETH = (ydWei: bigint): string => {
  const yd = Number(ydWei) / 1e18;
  const eth = yd / EXCHANGE_RATE;
  return eth.toFixed(4);
};

// 格式化显示价格（YD转ETH显示）
export const formatCoursePrice = (ydWei: bigint): string => {
  const ethValue = convertYDWeiToETH(ydWei);
  const ydValue = Number(ydWei) / 1e18;
  return `${ethValue} ETH (${ydValue.toFixed(0)} YD)`;
};

// 简化的价格显示（只显示ETH）
export const formatPriceETH = (ydWei: bigint): string => {
  return convertYDWeiToETH(ydWei);
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
  content?: string;
  price: string;
  priceformatted: string;
  instructor_address: string;
  created_at: string;
  updated_at?: string;
  duration?: string;
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  category: string;
  tags?: string[];
  requirements?: string[];
  objectives?: string[];
  thumbnail?: string;
  isActive?: boolean;
  totalSales?: string;
  studentCount?: number;
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

// 课程创建请求接口
export interface CreateCourseRequest {
  title: string;
  description: string;
  content?: string;
  price: string; // ETH单位，用于显示
  duration?: string;
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  category: string;
  tags?: string[];
  requirements?: string[];
  objectives?: string[];
  thumbnail?: string;
  onChainId: number;
  instructorAddress: string;
}

// 验证函数
export const validateCourseData = (data: Partial<CreateCourseRequest>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.title?.trim()) {
    errors.push('课程标题不能为空');
  } else if (data.title.length < 5) {
    errors.push('课程标题至少需要5个字符');
  }

  if (!data.description?.trim()) {
    errors.push('课程描述不能为空');
  } else if (data.description.length < 20) {
    errors.push('课程描述至少需要20个字符');
  }

  if (!data.content?.trim()) {
    errors.push('课程内容不能为空');
  } else if (data.content.length < 50) {
    errors.push('课程内容至少需要50个字符');
  }

  if (!data.price || parseFloat(data.price) <= 0) {
    errors.push('请输入有效的课程价格');
  } else if (parseFloat(data.price) > 100) {
    errors.push('课程价格不能超过100 ETH');
  }

  if (!data.category) {
    errors.push('请选择课程分类');
  }

  if (!data.instructorAddress) {
    errors.push('讲师地址不能为空');
  }

  if (typeof data.onChainId !== 'number' || data.onChainId <= 0) {
    errors.push('链上课程ID无效');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// 网络配置
export const SUPPORTED_CHAINS = {
  LOCALHOST: {
    id: 31337,
    name: 'Localhost',
    rpcUrl: 'http://127.0.0.1:8545',
    blockExplorer: 'http://localhost:8545',
  },
  SEPOLIA: {
    id: 11155111,
    name: 'Sepolia',
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID',
    blockExplorer: 'https://sepolia.etherscan.io',
  },
};

// 获取当前网络的区块浏览器URL
export const getBlockExplorerUrl = (chainId: number, txHash: string): string => {
  switch (chainId) {
    case 31337:
      return `http://localhost:8545/tx/${txHash}`;
    case 11155111:
      return `https://sepolia.etherscan.io/tx/${txHash}`;
    default:
      return `https://etherscan.io/tx/${txHash}`;
  }
};

// 课程状态枚举
export enum CourseStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DELETED = 'deleted',
}

// 用户角色枚举
export enum UserRole {
  STUDENT = 'student',
  INSTRUCTOR = 'instructor',
  ADMIN = 'admin',
}
