import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Get user profile
router.get('/profile',
  authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        _count: {
          select: {
            courses: true,
            enrollments: true,
            reviews: true,
          },
        },
        instructorApplication: {
          select: {
            status: true,
            appliedAt: true,
            reviewedAt: true,
            notes: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        address: user.address,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        isInstructor: user.isInstructor,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        stats: {
          coursesCreated: user._count.courses,
          coursesEnrolled: user._count.enrollments,
          reviewsWritten: user._count.reviews,
        },
        instructorApplication: user.instructorApplication,
      },
    });
  })
);

// Update user profile
router.put('/profile',
  authenticateToken,
  [
    body('username').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Username must be 2-50 characters'),
    body('email').optional().isEmail().withMessage('Valid email required'),
    body('bio').optional().isLength({ max: 500 }).withMessage('Bio must be less than 500 characters'),
    body('avatar').optional().isURL().withMessage('Valid avatar URL required'),
  ],
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400);
    }

    const { username, email, bio, avatar } = req.body;
    const updateData: any = {};

    if (username !== undefined) updateData.username = username;
    if (email !== undefined) updateData.email = email;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: updateData,
      select: {
        id: true,
        address: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        isInstructor: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      data: user,
    });
  })
);

// Apply to become instructor
router.post('/instructor/apply',
  authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    // Check if user already has an application
    const existingApplication = await prisma.instructorApplication.findUnique({
      where: { userId: req.user!.id },
    });

    if (existingApplication) {
      throw new AppError('Instructor application already exists', 409);
    }

    const application = await prisma.instructorApplication.create({
      data: {
        userId: req.user!.id,
      },
    });

    res.status(201).json({
      success: true,
      data: application,
    });
  })
);

// Get instructor application status
router.get('/instructor/application',
  authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const application = await prisma.instructorApplication.findUnique({
      where: { userId: req.user!.id },
    });

    res.json({
      success: true,
      data: application,
    });
  })
);

// Get user's enrolled courses
router.get('/courses/enrolled',
  authenticateToken,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  ],
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const [enrollments, totalCount] = await Promise.all([
      prisma.enrollment.findMany({
        where: { userId: req.user!.id },
        skip: offset,
        take: limit,
        include: {
          course: {
            include: {
              instructor: {
                select: { address: true, username: true },
              },
              _count: {
                select: { lessons: true },
              },
            },
          },
        },
        orderBy: { enrolledAt: 'desc' },
      }),
      prisma.enrollment.count({ where: { userId: req.user!.id } }),
    ]);

    // Get progress for each course
    const coursesWithProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        const totalLessons = enrollment.course._count.lessons;
        const completedLessons = await prisma.progress.count({
          where: {
            userId: req.user!.id,
            courseId: enrollment.courseId,
            completed: true,
          },
        });

        return {
          ...enrollment,
          progress: {
            totalLessons,
            completedLessons,
            percentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
          },
        };
      })
    );

    res.json({
      success: true,
      data: {
        enrollments: coursesWithProgress,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
      },
    });
  })
);

// Get user's created courses (for instructors)
router.get('/courses/created',
  authenticateToken,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  ],
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const [courses, totalCount] = await Promise.all([
      prisma.course.findMany({
        where: { instructorId: req.user!.id },
        skip: offset,
        take: limit,
        include: {
          _count: {
            select: { enrollments: true, lessons: true, reviews: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.course.count({ where: { instructorId: req.user!.id } }),
    ]);

    res.json({
      success: true,
      data: {
        courses,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
      },
    });
  })
);

// Update learning progress
router.post('/progress',
  authenticateToken,
  [
    body('courseId').isUUID().withMessage('Valid course ID required'),
    body('lessonId').isUUID().withMessage('Valid lesson ID required'),
    body('completed').isBoolean().withMessage('Completed status required'),
    body('watchTime').optional().isInt({ min: 0 }).withMessage('Watch time must be a positive integer'),
  ],
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400);
    }

    const { courseId, lessonId, completed, watchTime } = req.body;

    // Verify user has access to this course
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: req.user!.id,
          courseId,
        },
      },
    });

    if (!enrollment) {
      throw new AppError('No access to this course', 403);
    }

    // Update or create progress
    const progress = await prisma.progress.upsert({
      where: {
        userId_lessonId: {
          userId: req.user!.id,
          lessonId,
        },
      },
      update: {
        completed,
        completedAt: completed ? new Date() : null,
        watchTime: watchTime || 0,
      },
      create: {
        userId: req.user!.id,
        courseId,
        lessonId,
        completed,
        completedAt: completed ? new Date() : null,
        watchTime: watchTime || 0,
      },
    });

    res.json({
      success: true,
      data: progress,
    });
  })
);

// Get learning progress for a course
router.get('/progress/:courseId',
  authenticateToken,
  param('courseId').isUUID().withMessage('Valid course ID required'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400);
    }

    const { courseId } = req.params;

    // Verify user has access to this course
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: req.user!.id,
          courseId,
        },
      },
    });

    if (!enrollment) {
      throw new AppError('No access to this course', 403);
    }

    const progress = await prisma.progress.findMany({
      where: {
        userId: req.user!.id,
        courseId,
      },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            order: true,
          },
        },
      },
      orderBy: {
        lesson: {
          order: 'asc',
        },
      },
    });

    res.json({
      success: true,
      data: progress,
    });
  })
);

// Get instructor dashboard statistics
router.get('/instructor/dashboard',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    let userId: string;
    let isInstructor = false;

    // 检查是否有认证token
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      // 如果有token，使用认证方式
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { id: true, isInstructor: true },
        });
        
        if (user) {
          userId = user.id;
          isInstructor = user.isInstructor;
        } else {
          throw new AppError('User not found', 401);
        }
      } catch (error) {
        throw new AppError('Invalid token', 401);
      }
    } else {
      // 如果没有token，尝试使用地址查询参数
      const { address } = req.query;
      
      if (!address || typeof address !== 'string') {
        throw new AppError('Address parameter required when no authentication token provided', 400);
      }
      
      const user = await prisma.user.findUnique({
        where: { address: address.toLowerCase() },
        select: { id: true, isInstructor: true, username: true },
      });
      
      if (!user) {
        throw new AppError(`User with address ${address} not found`, 404);
      }
      
      userId = user.id;
      isInstructor = user.isInstructor;
    }

    if (!isInstructor) {
      throw new AppError('Access denied: User is not an instructor', 403);
    }

    // Get instructor's courses with enrollment stats
    const [courses, totalEnrollments] = await Promise.all([
      prisma.course.findMany({
        where: { instructorId: userId },
        include: {
          _count: {
            select: { enrollments: true, reviews: true, lessons: true },
          },
          reviews: {
            select: { rating: true },
          },
        },
      }),
      prisma.enrollment.count({
        where: {
          course: {
            instructorId: userId,
          },
        },
      }),
    ]);

    // 单独获取总收入，避免aggregate问题
    const enrollmentPrices = await prisma.enrollment.findMany({
      where: {
        course: {
          instructorId: userId,
        },
      },
      select: {
        price: true,
      },
    });

    // 计算总收入
    const totalRevenue = {
      _sum: {
        price: enrollmentPrices.reduce((sum, enrollment) => {
          return sum + parseFloat(enrollment.price || '0');
        }, 0).toString(),
      },
    };

    // Calculate statistics
    const totalCourses = courses.length;
    const totalStudents = totalEnrollments;
    const totalEarnings = totalRevenue._sum.price || 0;

    // Calculate average rating across all courses
    let totalRatings = 0;
    let ratingCount = 0;
    courses.forEach(course => {
      course.reviews.forEach(review => {
        totalRatings += review.rating;
        ratingCount++;
      });
    });
    const averageRating = ratingCount > 0 ? totalRatings / ratingCount : 0;

    // Course performance data
    const courseStats = courses.map(course => ({
      id: course.id,
      title: course.title,
      enrollmentCount: course._count.enrollments,
      reviewCount: course._count.reviews,
      lessonCount: course._count.lessons,
      averageRating: course.reviews.length > 0 
        ? course.reviews.reduce((sum, review) => sum + review.rating, 0) / course.reviews.length
        : 0,
    }));

    res.json({
      success: true,
      data: {
        overview: {
          totalCourses,
          totalStudents,
          totalEarnings,
          averageRating: Number(averageRating.toFixed(1)),
        },
        courseStats,
        recentActivity: {
          lastUpdated: new Date().toISOString(),
        },
      },
    });
  })
);

// User registration endpoint
router.post('/register',
  [
    body('address').isEthereumAddress().withMessage('Valid Ethereum address required'),
    body('username').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Username must be 2-50 characters'),
    body('email').optional().isEmail().withMessage('Valid email required'),
    body('bio').optional().isLength({ max: 500 }).withMessage('Bio must be less than 500 characters'),
    body('isInstructor').optional().isBoolean().withMessage('isInstructor must be boolean'),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400);
    }

    const { address, username, email, bio, isInstructor = false } = req.body;
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { address: address.toLowerCase() },
    });

    if (existingUser) {
      return res.json({
        success: true,
        message: 'User already exists',
        data: {
          id: existingUser.id,
          address: existingUser.address,
          username: existingUser.username,
          isInstructor: existingUser.isInstructor,
        },
      });
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        address: address.toLowerCase(),
        username: username || `user_${address.slice(2, 8)}`,
        email,
        bio,
        isInstructor,
      },
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: newUser.id,
        address: newUser.address,
        username: newUser.username,
        email: newUser.email,
        bio: newUser.bio,
        isInstructor: newUser.isInstructor,
        createdAt: newUser.createdAt,
      },
    });
  })
);


// Get all instructor applications (admin only) - 使用真实区块链数据
router.get('/instructor/applications',
  asyncHandler(async (req, res) => {
    try {
      const { ethers } = await import('ethers');
      
      // 智能合约配置
      const CONTRACT_ADDRESS = '0xD3Ff74DD494471f55B204CB084837D1a7f184092';
      const CONTRACT_ABI = [
        {
          "inputs": [{"internalType": "address", "name": "", "type": "address"}],
          "name": "isInstructor",
          "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [{"internalType": "address", "name": "", "type": "address"}],
          "name": "instructorApplications", 
          "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
          "stateMutability": "view",
          "type": "function"
        }
      ];
      
      // 连接到区块链
      const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'http://localhost:8545');
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      // 从数据库获取所有用户
      const allUsers = await prisma.user.findMany({
        select: {
          id: true,
          address: true,
          username: true,
          email: true,
          bio: true,
          isInstructor: true,
          createdAt: true,
        },
      });
      
      console.log(`Checking blockchain status for ${allUsers.length} users`);
      
      const applications = [];
      
      // 检查每个用户的区块链状态
      for (const user of allUsers) {
        try {
          const [isInstructor, hasApplied] = await Promise.all([
            contract.isInstructor(user.address),
            contract.instructorApplications(user.address)
          ]);
          
          // 只显示有申请或已是讲师的用户
          if (hasApplied || isInstructor) {
            let status = 'pending';
            if (isInstructor) {
              status = 'approved';
            }
            
            applications.push({
              address: user.address,
              username: user.username,
              email: user.email,
              bio: user.bio,
              appliedAt: user.createdAt, // 使用注册时间
              status: status,
              reviewedAt: isInstructor ? user.createdAt : null,
              notes: isInstructor ? 'Approved on blockchain' : 'Pending blockchain approval',
              isInstructor: isInstructor,
              hasApplied: hasApplied,
              createdAt: user.createdAt,
              source: 'blockchain'
            });
          }
          
        } catch (blockchainError) {
          console.warn(`Failed to check blockchain status for ${user.address}:`, blockchainError.message);
          
          // 如果区块链调用失败，回退到数据库状态
          if (user.isInstructor) {
            applications.push({
              address: user.address,
              username: user.username,
              email: user.email,
              bio: user.bio,
              appliedAt: user.createdAt,
              status: 'approved',
              reviewedAt: user.createdAt,
              notes: 'Database status (blockchain unavailable)',
              isInstructor: user.isInstructor,
              hasApplied: false,
              createdAt: user.createdAt,
              source: 'database_fallback'
            });
          }
        }
      }
      
      // 排序：待审核优先，然后按申请时间倒序
      applications.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (b.status === 'pending' && a.status !== 'pending') return 1;
        return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
      });
      
      console.log(`Found ${applications.length} applications/instructors`);

      res.json({
        success: true,
        data: applications,
        debug: {
          totalUsers: allUsers.length,
          applicationsFound: applications.length,
          pendingApplications: applications.filter(a => a.status === 'pending').length,
          approvedInstructors: applications.filter(a => a.status === 'approved').length,
        }
      });
      
    } catch (error) {
      console.error('Error fetching instructor applications:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch instructor applications',
        details: error.message,
      });
    }
  })
);

export default router;
