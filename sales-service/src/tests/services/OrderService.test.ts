import { jest } from '@jest/globals';
import { OrderService } from '../../services/OrderService.js';
import { OrderRepository } from '../../repositories/OrderRepository.js';
import { EventService } from '../../services/EventService.js';
import { CreateOrderRequest, ORDER_STATUS } from '../../types/index.js';

describe('OrderService', () => {
  let orderService: OrderService;
  let mockOrderRepository: any;
  let mockEventService: any;

  beforeEach(() => {
    mockOrderRepository = {
      findByOrderId: jest.fn(),
      createOrder: jest.fn(),
      getOrdersByCustomerId: jest.fn(),
      getOrdersByStatus: jest.fn(),
      count: jest.fn(),
    };

    mockEventService = {
      publishOrderCreatedEvent: jest.fn(),
      startDeliveryStatusConsumer: jest.fn(),
    };

    orderService = new OrderService(mockOrderRepository, mockEventService);
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

      mockOrderRepository.findByOrderId.mockResolvedValue(mockOrder);

      const result = await orderService.getOrderById('order-123');

      expect(result).toEqual({
        orderId: 'order-123',
        customerId: 'customer-123',
        items: [{ productId: 'p1', quantity: 2 }],
        totalAmount: 29.98,
        status: ORDER_STATUS.PENDING_SHIPMENT,
        createdAt: mockOrder.createdAt,
        updatedAt: mockOrder.updatedAt,
      });
      expect(mockOrderRepository.findByOrderId).toHaveBeenCalledWith('order-123');
    });

    it('should return null when order not found', async () => {
      mockOrderRepository.findByOrderId.mockResolvedValue(null);

      const result = await orderService.getOrderById('non-existent');

      expect(result).toBeNull();
      expect(mockOrderRepository.findByOrderId).toHaveBeenCalledWith('non-existent');
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
      const mockCreatedOrder = {
        orderId: 'generated-order-id',
        customerId: 'customer-123',
        items: validOrderRequest.items,
        totalAmount: 39.97,
        status: ORDER_STATUS.PENDING_SHIPMENT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockOrderRepository.createOrder.mockResolvedValue(mockCreatedOrder);
      mockEventService.publishOrderCreatedEvent.mockResolvedValue();

      const result = await orderService.createOrder(validOrderRequest);

      expect(result).toEqual({
        orderId: 'generated-order-id',
        status: ORDER_STATUS.PENDING_SHIPMENT,
      });
      expect(mockOrderRepository.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          customerId: 'customer-123',
          items: validOrderRequest.items,
          totalAmount: 39.97,
          status: ORDER_STATUS.PENDING_SHIPMENT,
        })
      );
      expect(mockEventService.publishOrderCreatedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: 'generated-order-id',
          customerId: 'customer-123',
          items: validOrderRequest.items,
          totalAmount: 39.97,
          status: ORDER_STATUS.PENDING_SHIPMENT,
        })
      );
    });

    it('should throw error for invalid customerId', async () => {
      const invalidRequest = { ...validOrderRequest, customerId: '' };

      await expect(orderService.createOrder(invalidRequest)).rejects.toThrow('Invalid customerId');
      expect(mockOrderRepository.createOrder).not.toHaveBeenCalled();
      expect(mockEventService.publishOrderCreatedEvent).not.toHaveBeenCalled();
    });

    it('should throw error for invalid items array', async () => {
      const invalidRequest = { ...validOrderRequest, items: [] };

      await expect(orderService.createOrder(invalidRequest)).rejects.toThrow('Invalid items array');
      expect(mockOrderRepository.createOrder).not.toHaveBeenCalled();
      expect(mockEventService.publishOrderCreatedEvent).not.toHaveBeenCalled();
    });

    it('should throw error for invalid totalAmount', async () => {
      const invalidRequest = { ...validOrderRequest, totalAmount: -10 };

      await expect(orderService.createOrder(invalidRequest)).rejects.toThrow('Invalid totalAmount');
      expect(mockOrderRepository.createOrder).not.toHaveBeenCalled();
      expect(mockEventService.publishOrderCreatedEvent).not.toHaveBeenCalled();
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
        {
          orderId: 'order-2',
          customerId: 'customer-123',
          items: [{ productId: 'p2', quantity: 1 }],
          totalAmount: 9.99,
          status: ORDER_STATUS.SHIPPED,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockOrderRepository.getOrdersByCustomerId.mockResolvedValue(mockOrders);

      const result = await orderService.getOrdersByCustomerId('customer-123');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        orderId: 'order-1',
        customerId: 'customer-123',
        items: [{ productId: 'p1', quantity: 2 }],
        totalAmount: 29.98,
        status: ORDER_STATUS.PENDING_SHIPMENT,
        createdAt: mockOrders[0]?.createdAt,
        updatedAt: mockOrders[0]?.updatedAt,
      });
      expect(mockOrderRepository.getOrdersByCustomerId).toHaveBeenCalledWith('customer-123');
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

      mockOrderRepository.getOrdersByStatus.mockResolvedValue(mockOrders);

      const result = await orderService.getOrdersByStatus(ORDER_STATUS.PENDING_SHIPMENT);

      expect(result).toHaveLength(1);
      expect(result[0]?.status).toBe(ORDER_STATUS.PENDING_SHIPMENT);
      expect(mockOrderRepository.getOrdersByStatus).toHaveBeenCalledWith(ORDER_STATUS.PENDING_SHIPMENT);
    });
  });
});