import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ethers } from 'ethers';
import { prisma } from '../lib/prisma';
import { AppError } from './errorHandler';
import { isValidAddress } from '../lib/blockchain';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    address: string;
    isInstructor: boolean;
  };
}

// JWT authentication middleware
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw new AppError('Access token required', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, address: true, isInstructor: true },
    });

    if (!user) {
      throw new AppError('User not found', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token', 401));
    } else {
      next(error);
    }
  }
};

// Wallet signature verification middleware
export const verifyWalletSignature = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { address, message, signature } = req.body;

    if (!address || !message || !signature) {
      throw new AppError('Address, message, and signature are required', 400);
    }

    if (!isValidAddress(address)) {
      throw new AppError('Invalid wallet address', 400);
    }

    // Verify the signature
    const recoveredAddress = ethers.verifyMessage(message, signature);
    
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      throw new AppError('Invalid signature', 401);
    }

    // Check if message is recent (within 5 minutes)
    const messageMatch = message.match(/时间戳: (\d+)/);
    if (messageMatch) {
      const timestamp = parseInt(messageMatch[1]);
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;
      
      if (now - timestamp > fiveMinutes) {
        throw new AppError('Signature expired', 401);
      }
    }

    // Add verified address to request
    (req as any).verifiedAddress = address;
    next();
  } catch (error) {
    next(error);
  }
};

// Instructor only middleware
export const requireInstructor = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  if (!req.user.isInstructor) {
    return next(new AppError('Instructor access required', 403));
  }

  next();
};

// Validate wallet address parameter
export const validateWalletAddress = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { address } = req.params;
  
  if (!address || !isValidAddress(address)) {
    return next(new AppError('Invalid wallet address', 400));
  }

  next();
};

// Generate JWT token
export const generateToken = (userId: string) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};
