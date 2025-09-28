import { Request, Response, NextFunction } from 'express';
import { IdempotencyRepository } from '../repositories/IdempotencyRepository.js';
import { ApiResponse } from '../types/index.js';

export interface IdempotentRequest extends Request {
  idempotencyKey?: string;
}

export class IdempotencyMiddleware {
  constructor(private idempotencyRepository: IdempotencyRepository) {}

  async handleIdempotency(req: IdempotentRequest, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    const idempotencyKey = req.headers['idempotency-key'] as string;
    
    if (!idempotencyKey) {
      res.status(400).json({ error: 'Idempotency-Key header is required' });
      return;
    }

    try {
      // Check if request was already processed
      const existingResponse = await this.idempotencyRepository.getResponse(idempotencyKey);
      
      if (existingResponse) {
        // Return cached response
        res.status(existingResponse.statusCode).json(existingResponse.response);
        return;
      }

      // Store idempotency key for later use
      req.idempotencyKey = idempotencyKey;
      next();
    } catch (error) {
      console.error('Idempotency middleware error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async saveResponse(idempotencyKey: string, statusCode: number, response: any): Promise<void> {
    try {
      await this.idempotencyRepository.saveResponse(idempotencyKey, statusCode, response);
    } catch (error) {
      console.error('Error saving idempotency response:', error);
    }
  }
}
