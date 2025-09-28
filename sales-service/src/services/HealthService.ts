import { config } from '../config.js';
import { HealthResponse } from '../types/index.js';

export class HealthService {
  getHealthStatus(): HealthResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: config.SERVICE_NAME
    };
  }
}
