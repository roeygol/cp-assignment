import { jest } from '@jest/globals';
import { HealthService } from '../../services/HealthService.js';

// Mock config
jest.mock('../../config.js', () => ({
  config: {
    SERVICE_NAME: 'sales-service',
  },
}), { virtual: true });

describe('HealthService', () => {
  let healthService: HealthService;

  beforeEach(() => {
    healthService = new HealthService();
  });

  describe('getHealthStatus', () => {
    it('should return health status with current timestamp', () => {
      const beforeCall = new Date();
      const result = healthService.getHealthStatus();
      const afterCall = new Date();

      expect(result).toEqual({
        status: 'ok',
        timestamp: expect.any(String),
        service: 'sales-service',
      });

      // Verify timestamp is within expected range
      const resultTimestamp = new Date(result.timestamp!);
      expect(resultTimestamp.getTime()).toBeGreaterThanOrEqual(beforeCall.getTime());
      expect(resultTimestamp.getTime()).toBeLessThanOrEqual(afterCall.getTime());
    });

    it('should return consistent structure', () => {
      const result = healthService.getHealthStatus();

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('service');
      expect(typeof result.status).toBe('string');
      expect(typeof result.timestamp).toBe('string');
      expect(typeof result.service).toBe('string');
    });
  });
});
