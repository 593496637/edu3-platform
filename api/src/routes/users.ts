import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
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

export default router;
