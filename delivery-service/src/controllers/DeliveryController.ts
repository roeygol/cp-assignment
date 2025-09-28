import { Request, Response } from 'express';
import { BaseController } from './BaseController.js';
import { DeliveryService } from '../services/DeliveryService.js';
import { Shipment, ApiResponse } from '../types/index.js';

export class DeliveryController extends BaseController {
  constructor(private deliveryService: DeliveryService) {
    super();
  }

  async getAllDeliveries(req: Request, res: Response<ApiResponse<Shipment[]>>): Promise<void> {
    try {
      const deliveries = await this.deliveryService.getAllDeliveries();
      this.sendSuccess(res, deliveries);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getDeliveryById(req: Request, res: Response<Shipment | ApiResponse>): Promise<void> {
    try {
      const id = req.params.id;
      if (!id) {
        this.sendError(res, 'Delivery ID is required', 400);
        return;
      }
      const delivery = await this.deliveryService.getDeliveryById(id);
      if (!delivery) {
        this.sendError(res, 'Not Found', 404);
        return;
      }
      res.json(delivery);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getDeliveriesByCustomerId(req: Request, res: Response<ApiResponse<Shipment[]>>): Promise<void> {
    try {
      const customerId = req.params.customerId;
      if (!customerId) {
        this.sendError(res, 'Customer ID is required', 400);
        return;
      }
      const deliveries = await this.deliveryService.getDeliveriesByCustomerId(customerId);
      this.sendSuccess(res, deliveries);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getDeliveriesByStatus(req: Request, res: Response<ApiResponse<Shipment[]>>): Promise<void> {
    try {
      const status = req.params.status;
      if (!status) {
        this.sendError(res, 'Status is required', 400);
        return;
      }
      const deliveries = await this.deliveryService.getDeliveriesByStatus(status);
      this.sendSuccess(res, deliveries);
    } catch (error) {
      this.handleError(error, res);
    }
  }
}
