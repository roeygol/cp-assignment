import { Request, Response } from 'express';
import { BaseController } from './BaseController.js';
import { OrderService } from '../services/OrderService.js';
import { CreateOrderRequest, Order, ApiResponse } from '../types/index.js';
import { IdempotencyMiddleware, IdempotentRequest } from '../middleware/idempotency.js';

export class OrderController extends BaseController {
  constructor(
    private orderService: OrderService,
    private idempotencyMiddleware?: IdempotencyMiddleware
  ) {
    super();
  }

  async getOrderById(req: Request, res: Response<Order | ApiResponse>): Promise<void> {
    try {
      const orderId = req.params.id;
      if (!orderId) {
        this.sendError(res, 'Order ID is required', 400);
        return;
      }
      const order = await this.orderService.getOrderById(orderId);
      if (!order) {
        this.sendError(res, 'Not Found', 404);
        return;
      }
      res.json(order);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async createOrder(req: IdempotentRequest, res: Response<ApiResponse<{ orderId: string; status: string }>>): Promise<void> {
    try {
      const result = await this.orderService.createOrder(req.body);
      
      // Save response for idempotency if middleware is available
      if (this.idempotencyMiddleware && req.idempotencyKey) {
        await this.idempotencyMiddleware.saveResponse(req.idempotencyKey, 201, result);
      }
      
      this.sendSuccess(res, result, 201);
    } catch (error) {
      // Save error response for idempotency if middleware is available
      if (this.idempotencyMiddleware && req.idempotencyKey) {
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
        const errorResponse = { error: errorMessage };
        const statusCode = errorMessage.includes('Invalid') ? 400 : 500;
        await this.idempotencyMiddleware.saveResponse(req.idempotencyKey, statusCode, errorResponse);
      }
      
      this.handleError(error, res);
    }
  }

  async getOrdersByCustomerId(req: Request, res: Response<ApiResponse<Order[]>>): Promise<void> {
    try {
      const customerId = req.params.customerId;
      if (!customerId) {
        this.sendError(res, 'Customer ID is required', 400);
        return;
      }
      const orders = await this.orderService.getOrdersByCustomerId(customerId);
      this.sendSuccess(res, orders);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getOrdersByStatus(req: Request, res: Response<ApiResponse<Order[]>>): Promise<void> {
    try {
      const orders = await this.orderService.getOrdersByStatus(req.params.status as any);
      this.sendSuccess(res, orders);
    } catch (error) {
      this.handleError(error, res);
    }
  }
}
