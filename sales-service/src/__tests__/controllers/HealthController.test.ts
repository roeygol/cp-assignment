import { jest } from '@jest/globals';
import { Request, Response } from 'express';
import { HealthController } from '../../controllers/HealthController.js';
import { HealthService } from '../../services/HealthService.js';
import { createMockRequest, createMockResponse } from '../helpers/testHelpers.js';

describe('HealthController', () => {
  let healthController: HealthController;
  let mockHealthService: any;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockHealthService = {
      getHealthStatus: jest.fn(),
    };

    healthController = new HealthController(mockHealthService);

    mockRequest = createMockRequest();
    mockResponse = createMockResponse();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getHealth', () => {
    it('should return health status', () => {
      const mockHealthResponse = {
        status: 'ok',
        timestamp: '2024-01-01T00:00:00.000Z',
        service: 'sales-service',
      };

      mockHealthService.getHealthStatus.mockReturnValue(mockHealthResponse);

      healthController.getHealth(mockRequest as Request, mockResponse as Response);

      expect(mockHealthService.getHealthStatus).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(mockHealthResponse);
    });
  });
});