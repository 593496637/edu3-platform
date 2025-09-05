import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { authenticateToken, requireInstructor, AuthenticatedRequest } from '../middleware/auth';
import { getCoursePlatformContract, isValidTxHash } from '../lib/blockchain';

const router = Router();

// Get all courses (public)
router.get('/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    query('category').optional().isString(),
    query('difficulty').optional().isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
    query('search').optional().isString(),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const { category, difficulty, search } = req.query;

    // Build where clause
    const where: any = {
      published: true,
    };

    if (category) {
      where.category = category;
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [courses, totalCount] = await Promise.all([
      prisma.course.findMany({
        where,
        skip: offset,
        take: limit,
        include: {
          instructor: {
            select: { address: true, username: true },
          },
          _count: {
            select: { enrollments: true, reviews: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.course.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        courses: courses.map(course => ({
          id: course.id,
          onChainId: course.onChainId,
          title: course.title,
          description: course.description,
          price: course.price,
          thumbnail: course.thumbnail,
          duration: course.duration,
          difficulty: course.difficulty,
          category: course.category,
          tags: course.tags,
          instructor: course.instructor,
          enrollmentCount: course._count.enrollments,
          reviewCount: course._count.reviews,
          createdAt: course.createdAt,
        })),
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

// Get course by ID (public)
router.get('/:id',
  param('id').isUUID().withMessage('Valid course ID required'),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400);
    }

    const { id } = req.params;

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        instructor: {
          select: { address: true, username: true, avatar: true },
        },
        lessons: {
          select: {
            id: true,
            title: true,
            description: true,
            duration: true,
            order: true,
            isPreview: true,
          },
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { enrollments: true, reviews: true },
        },
      },
    });

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    if (!course.published) {
      throw new AppError('Course not available', 404);
    }

    res.json({
      success: true,
      data: {
        id: course.id,
        onChainId: course.onChainId,
        title: course.title,
        description: course.description,
        content: course.content,
        price: course.price,
        thumbnail: course.thumbnail,
        duration: course.duration,
        difficulty: course.difficulty,
        category: course.category,
        tags: course.tags,
        requirements: course.requirements,
        objectives: course.objectives,
        instructor: course.instructor,
        lessons: course.lessons,
        enrollmentCount: course._count.enrollments,
        reviewCount: course._count.reviews,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
      },
    });
  })
);

// Create course (instructor only)
router.post('/',
  authenticateToken,
  requireInstructor,
  [
    body('onChainId').isInt({ min: 1 }).withMessage('Valid on-chain course ID required'),
    body('title').trim().notEmpty().withMessage('Course title is required'),
    body('description').trim().notEmpty().withMessage('Course description is required'),
    body('price').isNumeric().withMessage('Valid price required'),
    body('duration').optional().isString(),
    body('difficulty').isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).withMessage('Invalid difficulty level'),
    body('category').optional().isString(),
    body('tags').optional().isArray(),
    body('requirements').optional().isArray(),
    body('objectives').optional().isArray(),
  ],
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400);
    }

    const {
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
    } = req.body;

    // Check if course with this onChainId already exists
    const existingCourse = await prisma.course.findUnique({
      where: { onChainId },
    });

    if (existingCourse) {
      throw new AppError('Course with this on-chain ID already exists', 409);
    }

    const course = await prisma.course.create({
      data: {
        onChainId,
        title,
        description,
        content,
        price: price.toString(),
        thumbnail,
        duration,
        difficulty,
        category,
        tags: tags || [],
        requirements: requirements || [],
        objectives: objectives || [],
        instructorId: req.user!.id,
        published: true,
      },
      include: {
        instructor: {
          select: { address: true, username: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: course,
    });
  })
);

// Add lessons to course (instructor only)
router.post('/:id/lessons',
  authenticateToken,
  requireInstructor,
  [
    param('id').isUUID().withMessage('Valid course ID required'),
    body('title').trim().notEmpty().withMessage('Lesson title is required'),
    body('description').optional().isString(),
    body('content').optional().isString(),
    body('videoUrl').optional().isURL().withMessage('Valid video URL required'),
    body('duration').optional().isString(),
    body('order').isInt({ min: 1 }).withMessage('Valid order number required'),
    body('isPreview').optional().isBoolean(),
    body('resources').optional().isArray(),
  ],
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400);
    }

    const { id: courseId } = req.params;
    const {
      title,
      description,
      content,
      videoUrl,
      duration,
      order,
      isPreview,
      resources,
    } = req.body;

    // Verify course ownership
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { instructorId: true },
    });

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    if (course.instructorId !== req.user!.id) {
      throw new AppError('Not authorized to modify this course', 403);
    }

    const lesson = await prisma.lesson.create({
      data: {
        courseId,
        title,
        description,
        content,
        videoUrl,
        duration,
        order,
        isPreview: isPreview || false,
        resources: resources || {},
      },
    });

    res.status(201).json({
      success: true,
      data: lesson,
    });
  })
);

// Record course enrollment (when purchased on-chain)
router.post('/:id/enroll',
  authenticateToken,
  [
    param('id').isUUID().withMessage('Valid course ID required'),
    body('txHash').custom((value) => {
      if (!isValidTxHash(value)) {
        throw new Error('Valid transaction hash required');
      }
      return true;
    }),
    body('price').isNumeric().withMessage('Valid price required'),
  ],
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400);
    }

    const { id: courseId } = req.params;
    const { txHash, price } = req.body;

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    // Check if user already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: req.user!.id,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      throw new AppError('Already enrolled in this course', 409);
    }

    // Create enrollment record
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: req.user!.id,
        courseId,
        txHash,
        price: price.toString(),
      },
    });

    res.status(201).json({
      success: true,
      data: enrollment,
    });
  })
);

// Check if user has purchased course
router.get('/:id/access/:address',
  [
    param('id').isUUID().withMessage('Valid course ID required'),
    param('address').isEthereumAddress().withMessage('Valid Ethereum address required'),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400);
    }

    const { id: courseId, address } = req.params;

    // Find user by address
    const user = await prisma.user.findUnique({
      where: { address: address.toLowerCase() },
    });

    if (!user) {
      return res.json({
        success: true,
        data: { hasAccess: false },
      });
    }

    // Check enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
    });

    res.json({
      success: true,
      data: {
        hasAccess: !!enrollment,
        enrolledAt: enrollment?.enrolledAt,
      },
    });
  })
);

export default router;
