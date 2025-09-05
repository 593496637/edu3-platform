import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Log request
  console.log(`📨 ${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`);
  
  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 400 ? '🔴' : res.statusCode >= 300 ? '🟡' : '🟢';
    console.log(`📤 ${new Date().toISOString()} - ${req.method} ${req.path} - ${statusColor} ${res.statusCode} - ${duration}ms`);
  });

  next();
};
