import { Request, Response } from 'express';
import { BaseController } from './BaseController.js';
import { AuthService } from '../services/AuthService.js';
import { AuthRequest, AuthResponse, ApiResponse } from '../types/index.js';

export class AuthController extends BaseController {
  constructor(private authService: AuthService) {
    super();
  }

  async login(req: Request<{}, ApiResponse<AuthResponse>, AuthRequest>, res: Response<ApiResponse<AuthResponse>>): Promise<void> {
    try {
      const result = await this.authService.login(req.body);
      this.sendSuccess(res, result);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async register(req: Request<{}, ApiResponse<AuthResponse>, AuthRequest & { role?: string }>, res: Response<ApiResponse<AuthResponse>>): Promise<void> {
    try {
      const result = await this.authService.register(req.body);
      this.sendSuccess(res, result, 201);
    } catch (error) {
      this.handleError(error, res);
    }
  }
}
