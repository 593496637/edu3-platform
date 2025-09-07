import { Router } from 'express';
import { ethers } from 'ethers';
import { prisma } from '../lib/prisma';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// 智能合约配置
const CONTRACT_ADDRESS = '0xD3Ff74DD494471f55B204CB084837D1a7f184092';
const CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "getTotalCourses",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "name": "courses",
    "outputs": [
      {"internalType": "address", "name": "instructor", "type": "address"},
      {"internalType": "string", "name": "title", "type": "string"},
      {"internalType": "string", "name": "description", "type": "string"},
      {"internalType": "uint256", "name": "price", "type": "uint256"},
      {"internalType": "bool", "name": "active", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "isInstructor",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  }
];

// RPC 提供者
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'http://localhost:8545');
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

// 获取课程列表 - 从区块链获取真实数据
router.get('/', asyncHandler(async (req, res) => {
  try {
    console.log('🔍 Fetching courses from blockchain...');
    
    // 从智能合约获取课程总数
    const totalCourses = await contract.getTotalCourses();
    const totalCoursesNum = Number(totalCourses);
    
    console.log(`Found ${totalCoursesNum} courses on-chain`);
    
    if (totalCoursesNum === 0) {
      return res.json({
        success: true,
        data: {
          courses: [],
          total: 0,
          source: 'blockchain'
        }
      });
    }
    
    // 获取每个课程的详细信息
    const courses = [];
    for (let i = 1; i <= totalCoursesNum; i++) {
      try {
        const courseData = await contract.courses(i);
        
        // 检查课程是否激活
        if (!courseData.active) {
          console.log(`Course ${i} is inactive, skipping`);
          continue;
        }
        
        // 获取讲师信息
        let instructorInfo = null;
        try {
          const instructor = await prisma.user.findUnique({
            where: { address: courseData.instructor.toLowerCase() },
            select: { username: true, bio: true }
          });
          instructorInfo = instructor;
        } catch (dbError) {
          console.warn(`Failed to fetch instructor info for ${courseData.instructor}:`, dbError);
        }
        
        courses.push({
          id: i,
          chainId: i,
          title: courseData.title,
          description: courseData.description,
          price: courseData.price.toString(),
          priceInEth: ethers.formatEther(courseData.price),
          instructor: courseData.instructor,
          instructorInfo: instructorInfo,
          active: courseData.active,
          source: 'blockchain'
        });
        
      } catch (courseError) {
        console.error(`Error fetching course ${i}:`, courseError);
      }
    }
    
    res.json({
      success: true,
      data: {
        courses,
        total: courses.length,
        totalOnChain: totalCoursesNum,
        source: 'blockchain'
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching courses from blockchain:', error);
    throw new AppError('Failed to fetch courses from blockchain', 500);
  }
}));

// 获取单个课程详情 - 从区块链获取
router.get('/:courseId', asyncHandler(async (req, res) => {
  try {
    const { courseId } = req.params;
    const courseIdNum = parseInt(courseId);
    
    if (isNaN(courseIdNum) || courseIdNum <= 0) {
      throw new AppError('Invalid course ID', 400);
    }
    
    console.log(`🔍 Fetching course ${courseIdNum} from blockchain...`);
    
    // 从智能合约获取课程信息
    const courseData = await contract.courses(courseIdNum);
    
    if (!courseData.active) {
      throw new AppError('Course not found or inactive', 404);
    }
    
    // 获取讲师信息
    let instructorInfo = null;
    try {
      const instructor = await prisma.user.findUnique({
        where: { address: courseData.instructor.toLowerCase() },
        select: { 
          username: true, 
          bio: true, 
          email: true,
          createdAt: true 
        }
      });
      instructorInfo = instructor;
    } catch (dbError) {
      console.warn(`Failed to fetch instructor info:`, dbError);
    }
    
    // 获取课程购买统计
    let enrollmentCount = 0;
    try {
      enrollmentCount = await prisma.enrollment.count({
        where: { 
          course: { 
            onChainId: courseIdNum 
          }
        }
      });
    } catch (dbError) {
      console.warn('Failed to fetch enrollment count:', dbError);
    }
    
    const course = {
      id: courseIdNum,
      chainId: courseIdNum,
      title: courseData.title,
      description: courseData.description,
      price: courseData.price.toString(),
      priceInEth: ethers.formatEther(courseData.price),
      instructor: courseData.instructor,
      instructorInfo: instructorInfo,
      active: courseData.active,
      enrollmentCount: enrollmentCount,
      source: 'blockchain'
    };
    
    res.json({
      success: true,
      data: course
    });
    
  } catch (error) {
    console.error('❌ Error fetching course:', error);
    if (error.message.includes('call revert exception')) {
      throw new AppError('Course not found on blockchain', 404);
    }
    throw error;
  }
}));

// 检查用户是否已购买课程
router.get('/:courseId/access', 
  authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    try {
      const { courseId } = req.params;
      const courseIdNum = parseInt(courseId);
      
      // 检查数据库中的购买记录
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          userId: req.user!.id,
          course: {
            onChainId: courseIdNum
          }
        },
        include: {
          course: true
        }
      });
      
      res.json({
        success: true,
        data: {
          hasAccess: !!enrollment,
          enrollment: enrollment
        }
      });
      
    } catch (error) {
      console.error('❌ Error checking course access:', error);
      throw new AppError('Failed to check course access', 500);
    }
  })
);

// 获取课程统计信息
router.get('/:courseId/stats', asyncHandler(async (req, res) => {
  try {
    const { courseId } = req.params;
    const courseIdNum = parseInt(courseId);
    
    // 从数据库获取统计信息
    const [enrollmentCount, averageRating, reviewCount] = await Promise.all([
      prisma.enrollment.count({
        where: { course: { onChainId: courseIdNum } }
      }),
      prisma.review.aggregate({
        where: { course: { onChainId: courseIdNum } },
        _avg: { rating: true }
      }),
      prisma.review.count({
        where: { course: { onChainId: courseIdNum } }
      })
    ]);
    
    res.json({
      success: true,
      data: {
        enrollmentCount,
        averageRating: averageRating._avg.rating || 0,
        reviewCount,
        source: 'database'
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching course stats:', error);
    throw new AppError('Failed to fetch course statistics', 500);
  }
}));

export default router;