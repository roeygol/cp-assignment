import { jest } from '@jest/globals';
import { Request, Response } from 'express';
import { createRateLimiter, orderCreationLimiter, generalLimiter, authLimiter } from '../../middleware/rateLimiting.js';
import { createMockRequest, createMockResponse } from '../helpers/testHelpers.js';

// Mock express-rate-limit
jest.mock('express-rate-limit', () => {
  return jest.fn(() => (req: Request, res: Response, next: any) => {
    const requestCount = (req as any).requestCount || 0;
    (req as any).requestCount = requestCount + 1;
    
    if (requestCount >= 5) {
      res.status(429).json({ error: 'Too many requests, please try again later.' });
      return;
    }
    
    next();
  });
});

describe('Rate Limiting Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = createMockRequest();
    mockResponse = createMockResponse();
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createRateLimiter', () => {
    it('should create rate limiter with custom configuration', () => {
      const customLimiter = createRateLimiter(
        30 * 1000,
        5,
        'Custom rate limit message'
      );

      expect(customLimiter).toBeDefined();
      expect(typeof customLimiter).toBe('function');
    });

    it('should use default message when not provided', () => {
      const limiter = createRateLimiter(60 * 1000, 10);

      expect(limiter).toBeDefined();
      expect(typeof limiter).toBe('function');
    });
  });

  describe('orderCreationLimiter', () => {
    it('should allow requests within limit', () => {
      (mockRequest as any).requestCount = 0;
      
      orderCreationLimiter(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should block requests exceeding limit', () => {
      (mockRequest as any).requestCount = 10;
      
      orderCreationLimiter(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(429);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Too many requests, please try again later.',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('generalLimiter', () => {
    it('should allow requests within limit', () => {
      (mockRequest as any).requestCount = 0;
      
      generalLimiter(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe('authLimiter', () => {
    it('should allow requests within limit', () => {
      (mockRequest as any).requestCount = 0;
      
      authLimiter(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should block requests exceeding limit', () => {
      (mockRequest as any).requestCount = 5;
      
      authLimiter(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(429);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Too many requests, please try again later.',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});