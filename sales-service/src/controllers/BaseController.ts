import { Request, Response } from 'express';
import { ApiResponse } from '../types/index.js';

export abstract class BaseController {
  protected handleError(error: any, res: Response<ApiResponse>): void {
    console.error('Controller error:', error);
    
    if (error.message === 'Items unavailable') {
      res.status(503).json({ error: error.message });
      return;
    }
    
    if (error.message.includes('Invalid')) {
      res.status(400).json({ error: error.message });
      return;
    }
    
    res.status(500).json({ error: 'Internal Server Error' });
  }

  protected sendSuccess<T>(res: Response<ApiResponse<T>>, data: T, statusCode: number = 200): void {
    res.status(statusCode).json({ data });
  }

  protected sendError(res: Response<ApiResponse>, error: string, statusCode: number = 400): void {
    res.status(statusCode).json({ error });
  }
}
