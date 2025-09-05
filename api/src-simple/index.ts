import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';
import { body, param, validationResult } from 'express-validator';
import { db } from './lib/database';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security and middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Contract configurations
const CONTRACTS = {
  YDToken: process.env.YD_TOKEN_ADDRESS!,
  CoursePlatform: process.env.COURSE_PLATFORM_ADDRESS!,
};

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);

// Contract ABIs (simplified)
const YD_TOKEN_ABI = [
  'function balanceOf(address account) view returns (uint256)',
];

const COURSE_PLATFORM_ABI = [
  'function hasPurchasedCourse(uint256 courseId, address user) view returns (bool)',
  'function isInstructor(address user) view returns (bool)',
  'function getTotalCourses() view returns (uint256)',
  'function getCourse(uint256 courseId) view returns (address instructor, uint256 price)',
  'event CoursePurchased(uint256 indexed courseId, address indexed student, uint256 price)',
];

// Utility functions
const isValidAddress = (address: string) => ethers.isAddress(address);
const isValidTxHash = (hash: string) => /^0x[a-fA-F0-9]{64}$/.test(hash);

// Authentication middleware
const verifyWalletSignature = async (req: any, res: any, next: any) => {
  try {
    const { address, message, signature } = req.body;

    if (!address || !message || !signature) {
      return res.status(400).json({ error: 'Address, message, and signature required' });
    }

    const recoveredAddress = ethers.verifyMessage(message, signature);
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    req.verifiedAddress = address.toLowerCase();
    next();
  } catch (error) {
    res.status(401).json({ error: 'Signature verification failed' });
  }
};

// ============= ROUTES =============

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// 1. 钱包登录 - 核心Web3功能
app.post('/api/auth/login',
  body('address').custom(value => isValidAddress(value)),
  body('message').notEmpty(),
  body('signature').notEmpty(),
  verifyWalletSignature,
  async (req: any, res) => {
    try {
      const { address } = req.body;
      const verifiedAddress = req.verifiedAddress;

      // Find or create user
      let user = await db.findUserByAddress(verifiedAddress);
      if (!user) {
        user = await db.createUser(verifiedAddress);
      }

      // Generate simple token
      const token = jwt.sign(
        { address: verifiedAddress },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        data: { user, token }
      });
    } catch (error) {
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

// 2. 获取课程列表 - 基础展示
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await db.getAllCourses();
    
    // 格式化价格显示
    const formattedCourses = courses.map(course => ({
      ...course,
      priceFormatted: ethers.formatEther(course.price)
    }));

    res.json({
      success: true,
      data: formattedCourses
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// 3. 获取链上代币余额 - Web3核心功能
app.get('/api/blockchain/balance/:address',
  param('address').custom(value => isValidAddress(value)),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { address } = req.params;
      const contract = new ethers.Contract(CONTRACTS.YDToken, YD_TOKEN_ABI, provider);
      const balance = await contract.balanceOf(address);

      res.json({
        success: true,
        data: {
          address,
          balance: balance.toString(),
          balanceFormatted: ethers.formatEther(balance)
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch balance' });
    }
  }
);

// 4. 检查课程购买状态 - Web3核心功能
app.get('/api/blockchain/purchased/:courseId/:address',
  param('courseId').isInt({ min: 1 }),
  param('address').custom(value => isValidAddress(value)),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { courseId, address } = req.params;
      
      // 先检查数据库记录
      const hasPurchasedDB = await db.hasPurchased(address, parseInt(courseId));
      
      // 再检查链上状态
      const contract = new ethers.Contract(CONTRACTS.CoursePlatform, COURSE_PLATFORM_ABI, provider);
      const hasPurchasedChain = await contract.hasPurchasedCourse(courseId, address);

      res.json({
        success: true,
        data: {
          courseId,
          address,
          hasPurchased: hasPurchasedDB || hasPurchasedChain
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to check purchase status' });
    }
  }
);

// 5. 验证并记录购买交易 - Web3核心功能
app.post('/api/purchases/verify',
  body('txHash').custom(value => isValidTxHash(value)),
  body('courseId').isInt({ min: 1 }),
  body('userAddress').custom(value => isValidAddress(value)),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { txHash, courseId, userAddress } = req.body;

      // Check if already recorded
      const existingPurchase = await db.getPurchaseByTxHash(txHash);
      if (existingPurchase) {
        return res.json({
          success: true,
          data: existingPurchase,
          message: 'Purchase already recorded'
        });
      }

      // Get transaction receipt
      const receipt = await provider.getTransactionReceipt(txHash);
      if (!receipt || receipt.status !== 1) {
        return res.status(400).json({ error: 'Transaction failed or not found' });
      }

      // Parse logs for CoursePurchased event
      const contract = new ethers.Contract(CONTRACTS.CoursePlatform, COURSE_PLATFORM_ABI, provider);
      
      // Find CoursePurchased event in logs
      let coursePurchasedEvent = null;
      for (const log of receipt.logs) {
        try {
          const parsed = contract.interface.parseLog({
            topics: log.topics,
            data: log.data
          });
          if (parsed?.name === 'CoursePurchased') {
            coursePurchasedEvent = parsed;
            break;
          }
        } catch (e) {
          // Ignore parsing errors for other contract logs
        }
      }

      if (!coursePurchasedEvent) {
        return res.status(400).json({ error: 'No CoursePurchased event found' });
      }

      const eventCourseId = coursePurchasedEvent.args[0].toString();
      const eventStudent = coursePurchasedEvent.args[1];
      const eventPrice = coursePurchasedEvent.args[2].toString();

      // Validate event data
      if (eventCourseId !== courseId.toString() || 
          eventStudent.toLowerCase() !== userAddress.toLowerCase()) {
        return res.status(400).json({ error: 'Transaction data mismatch' });
      }

      // Record purchase in database
      const purchase = await db.createPurchase(
        userAddress,
        parseInt(courseId),
        txHash,
        receipt.blockNumber,
        eventPrice
      );

      res.json({
        success: true,
        data: purchase,
        message: 'Purchase verified and recorded'
      });

    } catch (error) {
      console.error('Purchase verification error:', error);
      res.status(500).json({ error: 'Failed to verify purchase' });
    }
  }
);

// 6. 获取用户购买的课程
app.get('/api/users/:address/purchases',
  param('address').custom(value => isValidAddress(value)),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { address } = req.params;
      const purchases = await db.getUserPurchases(address);

      res.json({
        success: true,
        data: purchases
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch purchases' });
    }
  }
);

// 7. 检查讲师状态
app.get('/api/blockchain/instructor/:address',
  param('address').custom(value => isValidAddress(value)),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { address } = req.params;
      const contract = new ethers.Contract(CONTRACTS.CoursePlatform, COURSE_PLATFORM_ABI, provider);
      const isInstructor = await contract.isInstructor(address);

      res.json({
        success: true,
        data: { address, isInstructor }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to check instructor status' });
    }
  }
);

// Error handling
app.use((error: any, req: any, res: any, next: any) => {
  console.error('API Error:', error);
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' 
  });
});

// Start server
async function startServer() {
  try {
    await db.initialize();
    app.listen(PORT, () => {
      console.log(`🚀 EDU3 Simple API running on port ${PORT}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`📖 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
