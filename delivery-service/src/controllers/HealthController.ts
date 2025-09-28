import { Request, Response } from 'express';
import { HealthService } from '../services/HealthService.js';
import { HealthResponse } from '../types/index.js';

export class HealthController {
  constructor(private healthService: HealthService) {}

  getHealth(req: Request, res: Response<HealthResponse>): void {
    const health = this.healthService.getHealthStatus();
    res.json(health);
  }
}
