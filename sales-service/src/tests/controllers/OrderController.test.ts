import { jest } from '@jest/globals';
import { Request, Response } from 'express';
import { OrderController } from '../../controllers/OrderController.js';
import { OrderService } from '../../services/OrderService.js';
import { IdempotencyMiddleware } from '../../middleware/idempotency.js';
import { CreateOrderRequest, ORDER_STATUS } from '../../types/index.js';
import { createMockRequest, createMockResponse } from '../helpers/testHelpers.js';

describe('OrderController', () => {
  let orderController: OrderController;
  let mockOrderService: any;
  let mockIdempotencyMiddleware: any;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockOrderService = {
      getOrderById: jest.fn(),
      createOrder: jest.fn(),
      getOrdersByCustomerId: jest.fn(),
      getOrdersByStatus: jest.fn(),
    };

    mockIdempotencyMiddleware = {
      saveResponse: jest.fn(),
    };

    orderController = new OrderController(mockOrderService, mockIdempotencyMiddleware);

    mockRequest = createMockRequest();
    mockResponse = createMockResponse();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrderById', () => {
    it('should return order when found', async () => {
      const mockOrder = {
        orderId: 'order-123',
        customerId: 'customer-123',
        items: [{ productId: 'p1', quantity: 2 }],
        totalAmount: 29.98,
        status: ORDER_STATUS.PENDING_SHIPMENT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRequest.params = { id: 'order-123' };
      mockOrderService.getOrderById.mockResolvedValue(mockOrder);

      await orderController.getOrderById(mockRequest as Request, mockResponse as Response);

      expect(mockOrderService.getOrderById).toHaveBeenCalledWith('order-123');
      expect(mockResponse.json).toHaveBeenCalledWith(mockOrder);
    });

    it('should return 404 when order not found', async () => {
      mockRequest.params = { id: 'non-existent' };
      mockOrderService.getOrderById.mockResolvedValue(null);

      await orderController.getOrderById(mockRequest as Request, mockResponse as Response);

      expect(mockOrderService.getOrderById).toHaveBeenCalledWith('non-existent');
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Not Found',
      });
    });

    it('should return 400 when order ID is missing', async () => {
      mockRequest.params = {};

      await orderController.getOrderById(mockRequest as Request, mockResponse as Response);

      expect(mockOrderService.getOrderById).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Order ID is required',
      });
    });

    it('should handle service errors', async () => {
      mockRequest.params = { id: 'order-123' };
      mockOrderService.getOrderById.mockRejectedValue(new Error('Database error'));

      await orderController.getOrderById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Internal Server Error',
      });
    });
  });

  describe('createOrder', () => {
    const validOrderRequest: CreateOrderRequest = {
      customerId: 'customer-123',
      items: [
        { productId: 'p1', quantity: 2, sku: 'SKU-001', name: 'Product 1', price: 14.99 },
        { productId: 'p2', quantity: 1, sku: 'SKU-002', name: 'Product 2', price: 9.99 }
      ],
      totalAmount: 39.97,
    };

    it('should create order successfully', async () => {
      const mockResult = {
        orderId: 'generated-order-id',
        status: ORDER_STATUS.PENDING_SHIPMENT,
      };

      mockRequest.body = validOrderRequest;
      (mockRequest as any).idempotencyKey = 'test-key';
      mockOrderService.createOrder.mockResolvedValue(mockResult);

      await orderController.createOrder(mockRequest as any, mockResponse as Response);

      expect(mockOrderService.createOrder).toHaveBeenCalledWith(validOrderRequest);
      expect(mockIdempotencyMiddleware.saveResponse).toHaveBeenCalledWith(
        'test-key',
        201,
        mockResult
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: mockResult,
      });
    });

    it('should handle validation errors', async () => {
      const invalidRequest = { ...validOrderRequest, customerId: '' };
      const error = new Error('Invalid customerId');

      mockRequest.body = invalidRequest;
      (mockRequest as any).idempotencyKey = 'test-key';
      mockOrderService.createOrder.mockRejectedValue(error);

      await orderController.createOrder(mockRequest as any, mockResponse as Response);

      expect(mockOrderService.createOrder).toHaveBeenCalledWith(invalidRequest);
      expect(mockIdempotencyMiddleware.saveResponse).toHaveBeenCalledWith(
        'test-key',
        400,
        { error: 'Invalid customerId' }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid customerId',
      });
    });

    it('should handle server errors', async () => {
      const error = new Error('Internal server error');

      mockRequest.body = validOrderRequest;
      (mockRequest as any).idempotencyKey = 'test-key';
      mockOrderService.createOrder.mockRejectedValue(error);

      await orderController.createOrder(mockRequest as any, mockResponse as Response);

      expect(mockIdempotencyMiddleware.saveResponse).toHaveBeenCalledWith(
        'test-key',
        500,
        { error: 'Internal server error' }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Internal Server Error',
      });
    });
  });

  describe('getOrdersByCustomerId', () => {
    it('should return orders for customer', async () => {
      const mockOrders = [
        {
          orderId: 'order-1',
          customerId: 'customer-123',
          items: [{ productId: 'p1', quantity: 2 }],
          totalAmount: 29.98,
          status: ORDER_STATUS.PENDING_SHIPMENT,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockRequest.params = { customerId: 'customer-123' };
      mockOrderService.getOrdersByCustomerId.mockResolvedValue(mockOrders);

      await orderController.getOrdersByCustomerId(mockRequest as Request, mockResponse as Response);

      expect(mockOrderService.getOrdersByCustomerId).toHaveBeenCalledWith('customer-123');
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: mockOrders,
      });
    });

    it('should return 400 when customer ID is missing', async () => {
      mockRequest.params = {};

      await orderController.getOrdersByCustomerId(mockRequest as Request, mockResponse as Response);

      expect(mockOrderService.getOrdersByCustomerId).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Customer ID is required',
      });
    });

    it('should handle service errors', async () => {
      mockRequest.params = { customerId: 'customer-123' };
      mockOrderService.getOrdersByCustomerId.mockRejectedValue(new Error('Database error'));

      await orderController.getOrdersByCustomerId(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Internal Server Error',
      });
    });
  });

  describe('getOrdersByStatus', () => {
    it('should return orders by status', async () => {
      const mockOrders = [
        {
          orderId: 'order-1',
          customerId: 'customer-123',
          items: [{ productId: 'p1', quantity: 2 }],
          totalAmount: 29.98,
          status: ORDER_STATUS.PENDING_SHIPMENT,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockRequest.params = { status: ORDER_STATUS.PENDING_SHIPMENT };
      mockOrderService.getOrdersByStatus.mockResolvedValue(mockOrders);

      await orderController.getOrdersByStatus(mockRequest as Request, mockResponse as Response);

      expect(mockOrderService.getOrdersByStatus).toHaveBeenCalledWith(ORDER_STATUS.PENDING_SHIPMENT);
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: mockOrders,
      });
    });

    it('should handle service errors', async () => {
      mockRequest.params = { status: ORDER_STATUS.PENDING_SHIPMENT };
      mockOrderService.getOrdersByStatus.mockRejectedValue(new Error('Database error'));

      await orderController.getOrdersByStatus(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Internal Server Error',
      });
    });
  });
});