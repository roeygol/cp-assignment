import { v4 as uuidv4 } from 'uuid';
import { CreateOrderRequest, Order, OrderStatus, ORDER_STATUS } from '../types/index.js';
import { OrderRepository } from '../repositories/OrderRepository.js';
import { EventService } from './EventService.js';

export class OrderService {
  constructor(
    private orderRepository: OrderRepository,
    private eventService: EventService
  ) {}

  async getOrderById(orderId: string): Promise<Order | null> {
    const order = await this.orderRepository.findByOrderId(orderId);
    if (!order) {
      return null;
    }

    return {
      orderId: order.orderId,
      customerId: order.customerId,
      items: order.items,
      totalAmount: Number(order.totalAmount),
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  async createOrder(request: CreateOrderRequest): Promise<{ orderId: string; status: OrderStatus }> {
    // Validate request
    this.validateCreateOrderRequest(request);

    // Simulated availability check (out of scope)
    const available = true;
    if (!available) {
      throw new Error('Items unavailable');
    }

    const orderId = uuidv4();
    const orderData = {
      orderId,
      customerId: request.customerId,
      items: request.items,
      totalAmount: request.totalAmount,
      status: ORDER_STATUS.PENDING_SHIPMENT,
    };

    // Create order in database
    const order = await this.orderRepository.createOrder(orderData);

    // Publish order created event
    await this.eventService.publishOrderCreatedEvent({
      orderId: order.orderId,
      customerId: order.customerId,
      items: order.items,
      totalAmount: Number(order.totalAmount),
      status: order.status,
    });

    return {
      orderId: order.orderId,
      status: order.status,
    };
  }

  async getOrdersByCustomerId(customerId: string): Promise<Order[]> {
    const orders = await this.orderRepository.getOrdersByCustomerId(customerId);
    return orders.map(order => ({
      orderId: order.orderId,
      customerId: order.customerId,
      items: order.items,
      totalAmount: Number(order.totalAmount),
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }));
  }

  async getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
    const orders = await this.orderRepository.getOrdersByStatus(status);
    return orders.map(order => ({
      orderId: order.orderId,
      customerId: order.customerId,
      items: order.items,
      totalAmount: Number(order.totalAmount),
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }));
  }

  private validateCreateOrderRequest(request: CreateOrderRequest): void {
    if (!request.customerId || typeof request.customerId !== 'string') {
      throw new Error('Invalid customerId');
    }
    if (!Array.isArray(request.items) || request.items.length === 0) {
      throw new Error('Invalid items array');
    }
    if (typeof request.totalAmount !== 'number' || request.totalAmount <= 0) {
      throw new Error('Invalid totalAmount');
    }

    // Validate each item
    for (const item of request.items) {
      if (!item.productId || typeof item.productId !== 'string') {
        throw new Error('Invalid productId in item');
      }
      if (typeof item.quantity !== 'number' || item.quantity <= 0) {
        throw new Error('Invalid quantity in item');
      }
    }
  }
}
