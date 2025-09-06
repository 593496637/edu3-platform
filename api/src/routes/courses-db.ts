import express from 'express';
import { ethers } from 'ethers';
import { prisma } from '../lib/prisma';
import { body, param, query, validationResult } from 'express-validator';

const router = express.Router();

// 合约配置
const CONTRACTS = {
  YDToken: '0xcD274B0B4cf04FfB5E6f1E17f8a62239a9564173',
  CoursePlatform: '0xD3Ff74DD494471f55B204CB084837D1a7f184092',
};

// 简化的 Course Platform ABI
const COURSE_PLATFORM_ABI = [
  {
    "inputs": [
      {"internalType": "uint256", "name": "courseId", "type": "uint256"},
      {"internalType": "address", "name": "user", "type": "address"}
    ],
    "name": "hasPurchasedCourse",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalCourses",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "courseId", "type": "uint256"}],
    "name": "getCourse",
    "outputs": [
      {"internalType": "address", "name": "instructor", "type": "address"},
      {"internalType": "uint256", "name": "price", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// 获取所有课程列表
router.get('/', 
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('category').optional().isString(),
    query('difficulty').optional().isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
    query('search').optional().isString(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Invalid query parameters',
          details: errors.array()
        });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const category = req.query.category as string;
      const difficulty = req.query.difficulty as string;
      const search = req.query.search as string;

      const skip = (page - 1) * limit;

      // 构建查询条件
      const where: any = {
        published: true
      };

      if (category) {
        where.category = category;
      }

      if (difficulty) {
        where.difficulty = difficulty;
      }

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { tags: { has: search } }
        ];
      }

      // 查询课程
      const [courses, total] = await Promise.all([
        prisma.course.findMany({
          where,
          include: {
            instructor: {
              select: {
                id: true,
                username: true,
                address: true
              }
            },
            _count: {
              select: {
                enrollments: true,
                reviews: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          skip,
          take: limit
        }),
        prisma.course.count({ where })
      ]);

      // 格式化响应数据
      const formattedCourses = courses.map(course => ({
        id: course.id,
        onChainId: course.onChainId,
        title: course.title,
        description: course.description,
        price: course.price,
        priceFormatted: ethers.formatEther(course.price),
        thumbnail: course.thumbnail,
        duration: course.duration,
        difficulty: course.difficulty,
        category: course.category,
        tags: course.tags,
        instructor: {
          id: course.instructor.id,
          username: course.instructor.username || course.instructor.address,
          address: course.instructor.address
        },
        enrollmentCount: course._count.enrollments,
        reviewCount: course._count.reviews,
        createdAt: course.createdAt
      }));

      res.json({
        success: true,
        data: {
          courses: formattedCourses,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      console.error('Failed to fetch courses:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch courses'
      });
    }
  }
);

// 获取单个课程详情
router.get('/:courseId', 
  param('courseId').isUUID().withMessage('Invalid course ID'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Invalid course ID',
          details: errors.array()
        });
      }

      const { courseId } = req.params;

      const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
          instructor: {
            select: {
              id: true,
              username: true,
              address: true,
              bio: true
            }
          },
          lessons: {
            where: { isPreview: true },
            select: {
              id: true,
              title: true,
              description: true,
              duration: true,
              order: true
            },
            orderBy: { order: 'asc' }
          },
          _count: {
            select: {
              enrollments: true,
              reviews: true,
              lessons: true
            }
          }
        }
      });

      if (!course) {
        return res.status(404).json({
          success: false,
          error: 'Course not found'
        });
      }

      // 获取课程评分统计
      const reviewStats = await prisma.review.aggregate({
        where: { courseId },
        _avg: { rating: true },
        _count: { rating: true }
      });

      const formattedCourse = {
        id: course.id,
        onChainId: course.onChainId,
        title: course.title,
        description: course.description,
        content: course.content,
        price: course.price,
        priceFormatted: ethers.formatEther(course.price),
        thumbnail: course.thumbnail,
        duration: course.duration,
        difficulty: course.difficulty,
        category: course.category,
        tags: course.tags,
        requirements: course.requirements,
        objectives: course.objectives,
        instructor: {
          id: course.instructor.id,
          username: course.instructor.username || course.instructor.address,
          address: course.instructor.address,
          bio: course.instructor.bio
        },
        previewLessons: course.lessons,
        stats: {
          enrollmentCount: course._count.enrollments,
          reviewCount: course._count.reviews,
          lessonCount: course._count.lessons,
          averageRating: reviewStats._avg.rating || 0
        },
        createdAt: course.createdAt,
        updatedAt: course.updatedAt
      };

      res.json({
        success: true,
        data: formattedCourse
      });

    } catch (error) {
      console.error('Failed to fetch course:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch course'
      });
    }
  }
);

// 创建课程 (需要身份验证)
router.post('/',
  [
    body('title').isString().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be less than 200 characters'),
    body('description').isString().isLength({ min: 1, max: 1000 }).withMessage('Description is required and must be less than 1000 characters'),
    body('price').isString().matches(/^\d+$/).withMessage('Price must be a valid number in wei'),
    body('category').isString().isLength({ min: 1 }).withMessage('Category is required'),
    body('difficulty').optional().isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
    body('onChainId').isInt({ min: 1 }).withMessage('Valid onChainId is required'),
    body('instructorAddress').isEthereumAddress().withMessage('Valid instructor address is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const {
        title,
        description,
        content,
        price,
        thumbnail,
        duration,
        difficulty = 'BEGINNER',
        category,
        tags = [],
        requirements = [],
        objectives = [],
        onChainId,
        instructorAddress
      } = req.body;

      // 查找或创建讲师用户
      let instructor = await prisma.user.findUnique({
        where: { address: instructorAddress.toLowerCase() }
      });

      if (!instructor) {
        instructor = await prisma.user.create({
          data: {
            address: instructorAddress.toLowerCase(),
            isInstructor: true
          }
        });
      } else if (!instructor.isInstructor) {
        // 如果用户存在但不是讲师，更新为讲师
        instructor = await prisma.user.update({
          where: { id: instructor.id },
          data: { isInstructor: true }
        });
      }

      // 检查onChainId是否已存在
      const existingCourse = await prisma.course.findUnique({
        where: { onChainId }
      });

      if (existingCourse) {
        return res.status(409).json({
          success: false,
          error: 'Course with this onChainId already exists'
        });
      }

      // 创建课程
      const course = await prisma.course.create({
        data: {
          onChainId,
          title,
          description,
          content,
          price,
          thumbnail,
          duration,
          difficulty,
          category,
          tags,
          requirements,
          objectives,
          instructorId: instructor.id,
          published: true
        },
        include: {
          instructor: {
            select: {
              id: true,
              username: true,
              address: true
            }
          }
        }
      });

      const formattedCourse = {
        id: course.id,
        onChainId: course.onChainId,
        title: course.title,
        description: course.description,
        price: course.price,
        priceFormatted: ethers.formatEther(course.price),
        thumbnail: course.thumbnail,
        duration: course.duration,
        difficulty: course.difficulty,
        category: course.category,
        tags: course.tags,
        requirements: course.requirements,
        objectives: course.objectives,
        instructor: {
          id: course.instructor.id,
          username: course.instructor.username || course.instructor.address,
          address: course.instructor.address
        },
        createdAt: course.createdAt
      };

      res.status(201).json({
        success: true,
        message: 'Course created successfully',
        data: formattedCourse
      });

    } catch (error) {
      console.error('Failed to create course:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create course'
      });
    }
  }
);

// 更新课程
router.put('/:courseId',
  [
    param('courseId').isUUID().withMessage('Invalid course ID'),
    body('title').optional().isString().isLength({ min: 1, max: 200 }),
    body('description').optional().isString().isLength({ min: 1, max: 1000 }),
    body('price').optional().isString().matches(/^\d+$/),
    body('category').optional().isString(),
    body('difficulty').optional().isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { courseId } = req.params;
      const updateData = req.body;

      // 移除不需要更新的字段
      delete updateData.onChainId;
      delete updateData.instructorAddress;

      const updatedCourse = await prisma.course.update({
        where: { id: courseId },
        data: updateData,
        include: {
          instructor: {
            select: {
              id: true,
              username: true,
              address: true
            }
          }
        }
      });

      const formattedCourse = {
        id: updatedCourse.id,
        onChainId: updatedCourse.onChainId,
        title: updatedCourse.title,
        description: updatedCourse.description,
        price: updatedCourse.price,
        priceFormatted: ethers.formatEther(updatedCourse.price),
        thumbnail: updatedCourse.thumbnail,
        duration: updatedCourse.duration,
        difficulty: updatedCourse.difficulty,
        category: updatedCourse.category,
        tags: updatedCourse.tags,
        requirements: updatedCourse.requirements,
        objectives: updatedCourse.objectives,
        instructor: {
          id: updatedCourse.instructor.id,
          username: updatedCourse.instructor.username || updatedCourse.instructor.address,
          address: updatedCourse.instructor.address
        },
        updatedAt: updatedCourse.updatedAt
      };

      res.json({
        success: true,
        message: 'Course updated successfully',
        data: formattedCourse
      });

    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          error: 'Course not found'
        });
      }

      console.error('Failed to update course:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update course'
      });
    }
  }
);

// 删除课程
router.delete('/:courseId',
  param('courseId').isUUID().withMessage('Invalid course ID'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Invalid course ID',
          details: errors.array()
        });
      }

      const { courseId } = req.params;

      const deletedCourse = await prisma.course.delete({
        where: { id: courseId }
      });

      res.json({
        success: true,
        message: 'Course deleted successfully',
        data: { id: deletedCourse.id }
      });

    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          error: 'Course not found'
        });
      }

      console.error('Failed to delete course:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete course'
      });
    }
  }
);

// 记录课程购买
router.post('/:courseId/enroll',
  [
    param('courseId').isUUID().withMessage('Invalid course ID'),
    body('txHash').isString().isLength({ min: 66, max: 66 }).withMessage('Valid transaction hash is required'),
    body('userAddress').isEthereumAddress().withMessage('Valid user address is required'),
    body('price').isString().matches(/^\d+$/).withMessage('Valid price is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { courseId } = req.params;
      const { txHash, userAddress, price } = req.body;

      // 查找或创建用户
      let user = await prisma.user.findUnique({
        where: { address: userAddress.toLowerCase() }
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            address: userAddress.toLowerCase()
          }
        });
      }

      // 检查课程是否存在
      const course = await prisma.course.findUnique({
        where: { id: courseId }
      });

      if (!course) {
        return res.status(404).json({
          success: false,
          error: 'Course not found'
        });
      }

      // 检查是否已经注册过
      const existingEnrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId: courseId
          }
        }
      });

      if (existingEnrollment) {
        return res.status(409).json({
          success: false,
          error: 'User already enrolled in this course'
        });
      }

      // 创建注册记录
      const enrollment = await prisma.enrollment.create({
        data: {
          userId: user.id,
          courseId: courseId,
          txHash: txHash,
          price: price
        }
      });

      res.status(201).json({
        success: true,
        message: 'Enrollment recorded successfully',
        data: {
          enrollmentId: enrollment.id,
          courseId: courseId,
          userId: user.id,
          txHash: txHash,
          enrolledAt: enrollment.enrolledAt
        }
      });

    } catch (error) {
      if (error.code === 'P2002') {
        return res.status(409).json({
          success: false,
          error: 'Transaction hash already exists'
        });
      }

      console.error('Failed to record enrollment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to record enrollment'
      });
    }
  }
);

// 验证用户是否购买了课程 (区块链验证)
router.post('/:courseId/verify-access',
  [
    param('courseId').isUUID().withMessage('Invalid course ID'),
    body('userAddress').isEthereumAddress().withMessage('Valid user address is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { courseId } = req.params;
      const { userAddress } = req.body;

      // 获取课程的onChainId
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { onChainId: true }
      });

      if (!course) {
        return res.status(404).json({
          success: false,
          error: 'Course not found'
        });
      }

      // 连接区块链验证购买状态
      const rpcUrl = process.env.RPC_URL || 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY';
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const contract = new ethers.Contract(
        CONTRACTS.CoursePlatform,
        COURSE_PLATFORM_ABI,
        provider
      );

      const hasPurchased = await contract.hasPurchasedCourse(
        BigInt(course.onChainId),
        userAddress
      );

      if (!hasPurchased) {
        return res.status(403).json({
          success: false,
          error: 'Course not purchased',
          needsPurchase: true
        });
      }

      // 生成访问令牌
      const accessToken = ethers.keccak256(
        ethers.toUtf8Bytes(`${userAddress}-${courseId}-${Date.now()}`)
      );

      res.json({
        success: true,
        data: {
          hasAccess: true,
          accessToken,
          courseId,
          userAddress
        }
      });

    } catch (error) {
      console.error('Course access verification failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to verify course access'
      });
    }
  }
);

export default router;
