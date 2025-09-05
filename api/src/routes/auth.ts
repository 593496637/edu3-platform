import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { verifyWalletSignature, generateToken } from '../middleware/auth';

const router = Router();

// Wallet authentication endpoint
router.post('/wallet',
  [
    body('address').isEthereumAddress().withMessage('Valid Ethereum address required'),
    body('message').notEmpty().withMessage('Message is required'),
    body('signature').notEmpty().withMessage('Signature is required'),
  ],
  verifyWalletSignature,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400);
    }

    const { address } = req.body;
    const verifiedAddress = (req as any).verifiedAddress;

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { address: verifiedAddress.toLowerCase() },
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          address: verifiedAddress.toLowerCase(),
        },
      });
    }

    // Generate JWT token
    const token = generateToken(user.id);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          address: user.address,
          username: user.username,
          isInstructor: user.isInstructor,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  })
);

// Get user profile
router.get('/profile/:address',
  asyncHandler(async (req, res) => {
    const { address } = req.params;

    const user = await prisma.user.findUnique({
      where: { address: address.toLowerCase() },
      include: {
        _count: {
          select: {
            courses: true,
            enrollments: true,
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
        bio: user.bio,
        avatar: user.avatar,
        isInstructor: user.isInstructor,
        createdAt: user.createdAt,
        stats: {
          coursesCreated: user._count.courses,
          coursesEnrolled: user._count.enrollments,
        },
      },
    });
  })
);

// Verify wallet ownership (for profile updates)
router.post('/verify',
  [
    body('address').isEthereumAddress().withMessage('Valid Ethereum address required'),
    body('message').notEmpty().withMessage('Message is required'),
    body('signature').notEmpty().withMessage('Signature is required'),
  ],
  verifyWalletSignature,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400);
    }

    res.json({
      success: true,
      message: 'Wallet ownership verified',
      address: (req as any).verifiedAddress,
    });
  })
);

export default router;
