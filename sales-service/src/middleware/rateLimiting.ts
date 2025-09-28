import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { ApiResponse } from '../types/index.js';

export const createRateLimiter = (windowMs: number, max: number, message?: string) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message || 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response<ApiResponse>) => {
      res.status(429).json({ error: message || 'Too many requests, please try again later.' });
    }
  });
};

export const orderCreationLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  10, // 10 requests per window
  'Too many order creation requests, please try again later.'
);

export const generalLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  100, // 100 requests per window
  'Too many requests, please try again later.'
);

export const authLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  5, // 5 login attempts per window
  'Too many authentication attempts, please try again later.'
);
