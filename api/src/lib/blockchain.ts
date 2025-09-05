import { ethers } from 'ethers';

// Contract ABIs - simplified versions for key functions
export const YD_TOKEN_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
];

export const COURSE_PLATFORM_ABI = [
  'function createCourse(uint256 price) external',
  'function buyCourse(uint256 courseId) external',
  'function hasPurchasedCourse(uint256 courseId, address user) view returns (bool)',
  'function isInstructor(address user) view returns (bool)',
  'function applyToBeInstructor() external',
  'function getTotalCourses() view returns (uint256)',
  'function getCourse(uint256 courseId) view returns (address instructor, uint256 price)',
  'event CourseCreated(uint256 indexed courseId, address indexed instructor, uint256 price)',
  'event CoursePurchased(uint256 indexed courseId, address indexed student, uint256 price)',
  'event InstructorApplicationSubmitted(address indexed applicant)',
];

// Contract addresses
export const CONTRACTS = {
  YDToken: process.env.YD_TOKEN_ADDRESS!,
  CoursePlatform: process.env.COURSE_PLATFORM_ADDRESS!,
};

// Provider configuration
export const getProvider = () => {
  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  if (!rpcUrl) {
    throw new Error('SEPOLIA_RPC_URL environment variable is required');
  }
  return new ethers.JsonRpcProvider(rpcUrl);
};

// Get wallet for server operations (if needed)
export const getServerWallet = () => {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('PRIVATE_KEY environment variable is required');
  }
  const provider = getProvider();
  return new ethers.Wallet(privateKey, provider);
};

// Get contract instances
export const getYDTokenContract = (signerOrProvider?: ethers.Signer | ethers.Provider) => {
  const providerToUse = signerOrProvider || getProvider();
  return new ethers.Contract(CONTRACTS.YDToken, YD_TOKEN_ABI, providerToUse);
};

export const getCoursePlatformContract = (signerOrProvider?: ethers.Signer | ethers.Provider) => {
  const providerToUse = signerOrProvider || getProvider();
  return new ethers.Contract(CONTRACTS.CoursePlatform, COURSE_PLATFORM_ABI, providerToUse);
};

// Utility functions
export const formatEther = (value: bigint | string) => {
  return ethers.formatEther(value);
};

export const parseEther = (value: string) => {
  return ethers.parseEther(value);
};

export const isValidAddress = (address: string) => {
  return ethers.isAddress(address);
};

export const isValidTxHash = (hash: string) => {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
};

// Event listener utilities
export const listenToCourseEvents = () => {
  const contract = getCoursePlatformContract();
  
  // Listen to course creation events
  contract.on('CourseCreated', (courseId, instructor, price, event) => {
    console.log('Course created:', {
      courseId: courseId.toString(),
      instructor,
      price: formatEther(price),
      txHash: event.transactionHash,
    });
  });

  // Listen to course purchase events
  contract.on('CoursePurchased', (courseId, student, price, event) => {
    console.log('Course purchased:', {
      courseId: courseId.toString(),
      student,
      price: formatEther(price),
      txHash: event.transactionHash,
    });
  });

  // Listen to instructor applications
  contract.on('InstructorApplicationSubmitted', (applicant, event) => {
    console.log('Instructor application submitted:', {
      applicant,
      txHash: event.transactionHash,
    });
  });
};
