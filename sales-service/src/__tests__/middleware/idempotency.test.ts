import { jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { IdempotencyMiddleware, IdempotentRequest } from '../../middleware/idempotency.js';
import { IdempotencyRepository } from '../../repositories/IdempotencyRepository.js';
import { createMockRequest, createMockResponse, createMockNext } from '../helpers/testHelpers.js';

describe('IdempotencyMiddleware', () => {
  let idempotencyMiddleware: IdempotencyMiddleware;
  let mockIdempotencyRepository: any;
  let mockRequest: Partial<IdempotentRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockIdempotencyRepository = {
      getResponse: jest.fn(),
      saveResponse: jest.fn(),
    };

    idempotencyMiddleware = new IdempotencyMiddleware(mockIdempotencyRepository);

    mockRequest = createMockRequest();
    mockResponse = createMockResponse();
    mockNext = createMockNext();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleIdempotency', () => {
    it('should return 400 when idempotency key is missing', async () => {
      mockRequest.headers = {};

      await idempotencyMiddleware.handleIdempotency(
        mockRequest as IdempotentRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Idempotency-Key header is required',
      });
      expect(mockIdempotencyRepository.getResponse).not.toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return cached response when request was already processed', async () => {
      const idempotencyKey = 'test-key-123';
      const cachedResponse = {
        idempotencyKey: 'test-key-123',
        statusCode: 201,
        response: { data: { orderId: 'order-123', status: 'created' } },
        createdAt: new Date(),
        expiresAt: new Date(),
      };

      mockRequest.headers = { 'idempotency-key': idempotencyKey };
      mockIdempotencyRepository.getResponse.mockResolvedValue(cachedResponse);

      await idempotencyMiddleware.handleIdempotency(
        mockRequest as IdempotentRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockIdempotencyRepository.getResponse).toHaveBeenCalledWith(idempotencyKey);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(cachedResponse.response);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should proceed to next middleware when no cached response exists', async () => {
      const idempotencyKey = 'test-key-123';

      mockRequest.headers = { 'idempotency-key': idempotencyKey };
      mockIdempotencyRepository.getResponse.mockResolvedValue(null);

      await idempotencyMiddleware.handleIdempotency(
        mockRequest as IdempotentRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockIdempotencyRepository.getResponse).toHaveBeenCalledWith(idempotencyKey);
      expect(mockRequest.idempotencyKey).toBe(idempotencyKey);
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should handle repository errors', async () => {
      const idempotencyKey = 'test-key-123';

      mockRequest.headers = { 'idempotency-key': idempotencyKey };
      mockIdempotencyRepository.getResponse.mockRejectedValue(new Error('Database error'));

      await idempotencyMiddleware.handleIdempotency(
        mockRequest as IdempotentRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockIdempotencyRepository.getResponse).toHaveBeenCalledWith(idempotencyKey);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Internal Server Error',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('saveResponse', () => {
    it('should save response successfully', async () => {
      const idempotencyKey = 'test-key-123';
      const statusCode = 201;
      const response = { data: { orderId: 'order-123' } };

      mockIdempotencyRepository.saveResponse.mockResolvedValue();

      await idempotencyMiddleware.saveResponse(idempotencyKey, statusCode, response);

      expect(mockIdempotencyRepository.saveResponse).toHaveBeenCalledWith(
        idempotencyKey,
        statusCode,
        response
      );
    });

    it('should handle save errors gracefully', async () => {
      const idempotencyKey = 'test-key-123';
      const statusCode = 201;
      const response = { data: { orderId: 'order-123' } };

      mockIdempotencyRepository.saveResponse.mockRejectedValue(new Error('Save failed'));

      await expect(
        idempotencyMiddleware.saveResponse(idempotencyKey, statusCode, response)
      ).resolves.toBeUndefined();

      expect(mockIdempotencyRepository.saveResponse).toHaveBeenCalledWith(
        idempotencyKey,
        statusCode,
        response
      );
    });
  });
});