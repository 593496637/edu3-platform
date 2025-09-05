import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import {
  getProvider,
  getYDTokenContract,
  getCoursePlatformContract,
  formatEther,
  isValidAddress,
  isValidTxHash,
} from '../lib/blockchain';

const router = Router();

// Get YD Token balance for an address
router.get('/balance/:address',
  param('address').custom((value) => {
    if (!isValidAddress(value)) {
      throw new Error('Valid Ethereum address required');
    }
    return true;
  }),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400);
    }

    const { address } = req.params;
    const contract = getYDTokenContract();

    try {
      const balance = await contract.balanceOf(address);
      
      res.json({
        success: true,
        data: {
          address,
          balance: balance.toString(),
          balanceFormatted: formatEther(balance),
        },
      });
    } catch (error) {
      throw new AppError('Failed to fetch balance', 500);
    }
  })
);

// Check if address is an instructor
router.get('/instructor/:address',
  param('address').custom((value) => {
    if (!isValidAddress(value)) {
      throw new Error('Valid Ethereum address required');
    }
    return true;
  }),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400);
    }

    const { address } = req.params;
    const contract = getCoursePlatformContract();

    try {
      const isInstructor = await contract.isInstructor(address);
      
      res.json({
        success: true,
        data: {
          address,
          isInstructor,
        },
      });
    } catch (error) {
      throw new AppError('Failed to check instructor status', 500);
    }
  })
);

// Get total number of courses
router.get('/courses/total',
  asyncHandler(async (req, res) => {
    const contract = getCoursePlatformContract();

    try {
      const totalCourses = await contract.getTotalCourses();
      
      res.json({
        success: true,
        data: {
          totalCourses: totalCourses.toString(),
        },
      });
    } catch (error) {
      throw new AppError('Failed to fetch total courses', 500);
    }
  })
);

// Get course info from blockchain
router.get('/courses/:courseId',
  param('courseId').isInt({ min: 1 }).withMessage('Valid course ID required'),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400);
    }

    const { courseId } = req.params;
    const contract = getCoursePlatformContract();

    try {
      const [instructor, price] = await contract.getCourse(courseId);
      
      res.json({
        success: true,
        data: {
          courseId,
          instructor,
          price: price.toString(),
          priceFormatted: formatEther(price),
        },
      });
    } catch (error) {
      throw new AppError('Course not found or failed to fetch', 404);
    }
  })
);

// Check if user has purchased a course
router.get('/courses/:courseId/purchased/:address',
  [
    param('courseId').isInt({ min: 1 }).withMessage('Valid course ID required'),
    param('address').custom((value) => {
      if (!isValidAddress(value)) {
        throw new Error('Valid Ethereum address required');
      }
      return true;
    }),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400);
    }

    const { courseId, address } = req.params;
    const contract = getCoursePlatformContract();

    try {
      const hasPurchased = await contract.hasPurchasedCourse(courseId, address);
      
      res.json({
        success: true,
        data: {
          courseId,
          address,
          hasPurchased,
        },
      });
    } catch (error) {
      throw new AppError('Failed to check purchase status', 500);
    }
  })
);

// Get transaction details
router.get('/transaction/:txHash',
  param('txHash').custom((value) => {
    if (!isValidTxHash(value)) {
      throw new Error('Valid transaction hash required');
    }
    return true;
  }),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400);
    }

    const { txHash } = req.params;
    const provider = getProvider();

    try {
      const [transaction, receipt] = await Promise.all([
        provider.getTransaction(txHash),
        provider.getTransactionReceipt(txHash),
      ]);

      if (!transaction) {
        throw new AppError('Transaction not found', 404);
      }

      res.json({
        success: true,
        data: {
          transaction: {
            hash: transaction.hash,
            from: transaction.from,
            to: transaction.to,
            value: transaction.value.toString(),
            gasLimit: transaction.gasLimit.toString(),
            gasPrice: transaction.gasPrice?.toString(),
            blockNumber: transaction.blockNumber,
            blockHash: transaction.blockHash,
          },
          receipt: receipt ? {
            status: receipt.status,
            gasUsed: receipt.gasUsed.toString(),
            effectiveGasPrice: receipt.gasPrice.toString(),
            confirmations: await transaction.confirmations(),
          } : null,
        },
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to fetch transaction details', 500);
    }
  })
);

// Get gas price estimation
router.get('/gas-price',
  asyncHandler(async (req, res) => {
    const provider = getProvider();

    try {
      const feeData = await provider.getFeeData();
      
      res.json({
        success: true,
        data: {
          gasPrice: feeData.gasPrice?.toString(),
          maxFeePerGas: feeData.maxFeePerGas?.toString(),
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString(),
        },
      });
    } catch (error) {
      throw new AppError('Failed to fetch gas price', 500);
    }
  })
);

// Get network information
router.get('/network',
  asyncHandler(async (req, res) => {
    const provider = getProvider();

    try {
      const [network, blockNumber] = await Promise.all([
        provider.getNetwork(),
        provider.getBlockNumber(),
      ]);
      
      res.json({
        success: true,
        data: {
          chainId: network.chainId.toString(),
          name: network.name,
          blockNumber,
        },
      });
    } catch (error) {
      throw new AppError('Failed to fetch network information', 500);
    }
  })
);

// Validate transaction for course purchase
router.post('/validate-purchase',
  [
    body('txHash').custom((value) => {
      if (!isValidTxHash(value)) {
        throw new Error('Valid transaction hash required');
      }
      return true;
    }),
    body('courseId').isInt({ min: 1 }).withMessage('Valid course ID required'),
    body('userAddress').custom((value) => {
      if (!isValidAddress(value)) {
        throw new Error('Valid user address required');
      }
      return true;
    }),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400);
    }

    const { txHash, courseId, userAddress } = req.body;
    const provider = getProvider();
    const contract = getCoursePlatformContract();

    try {
      // Get transaction receipt
      const receipt = await provider.getTransactionReceipt(txHash);
      
      if (!receipt) {
        throw new AppError('Transaction not found', 404);
      }

      if (receipt.status !== 1) {
        throw new AppError('Transaction failed', 400);
      }

      // Parse logs to find CoursePurchased event
      const coursePurchasedEvent = contract.interface.parseLog({
        topics: receipt.logs[0].topics,
        data: receipt.logs[0].data,
      });

      if (coursePurchasedEvent?.name !== 'CoursePurchased') {
        throw new AppError('Invalid transaction - not a course purchase', 400);
      }

      const eventCourseId = coursePurchasedEvent.args[0].toString();
      const eventStudent = coursePurchasedEvent.args[1];
      const eventPrice = coursePurchasedEvent.args[2];

      // Validate the transaction details
      if (eventCourseId !== courseId.toString()) {
        throw new AppError('Course ID mismatch', 400);
      }

      if (eventStudent.toLowerCase() !== userAddress.toLowerCase()) {
        throw new AppError('User address mismatch', 400);
      }

      res.json({
        success: true,
        data: {
          valid: true,
          txHash,
          courseId: eventCourseId,
          student: eventStudent,
          price: eventPrice.toString(),
          priceFormatted: formatEther(eventPrice),
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString(),
        },
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to validate transaction', 500);
    }
  })
);

export default router;
