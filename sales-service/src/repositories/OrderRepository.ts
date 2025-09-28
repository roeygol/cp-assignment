import { Model, Transaction } from 'sequelize';
import { BaseRepository } from './BaseRepository.js';
import { OrderModel } from '../models/OrderModel.js';
import { Order, CreateOrderRequest } from '../types/index.js';

export class OrderRepository extends BaseRepository<OrderModel> {
  constructor() {
    super(OrderModel);
  }

  protected getPrimaryKey(): string {
    return 'orderId';
  }

  async findByOrderId(orderId: string): Promise<OrderModel | null> {
    return await this.model.findByPk(orderId);
  }

  async createOrder(orderData: Omit<Order, 'createdAt' | 'updatedAt'>, transaction?: Transaction): Promise<OrderModel> {
    return await this.model.create(orderData, transaction ? { transaction } : {});
  }

  async updateOrderStatus(orderId: string, status: string, transaction?: Transaction): Promise<[number, OrderModel[]]> {
    const result = await this.model.update(
      { status: status as any },
      { 
        where: { orderId: orderId } as any,
        ...(transaction && { transaction }),
        returning: true
      }
    );
    return result as [number, OrderModel[]];
  }

  async getOrdersByCustomerId(customerId: string): Promise<OrderModel[]> {
    return await this.model.findAll({
      where: { customerId }
    });
  }

  async getOrdersByStatus(status: string): Promise<OrderModel[]> {
    return await this.model.findAll({
      where: { status }
    });
  }
}
