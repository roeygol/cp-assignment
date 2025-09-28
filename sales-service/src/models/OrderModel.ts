import { Model, DataTypes, Sequelize } from 'sequelize';
import { Order, OrderItem, OrderStatus } from '../types/index.js';

export class OrderModel extends Model<Order, Omit<Order, 'createdAt' | 'updatedAt'>> {
  declare orderId: string;
  declare customerId: string;
  declare items: OrderItem[];
  declare totalAmount: number;
  declare status: OrderStatus;
  declare createdAt: Date;
  declare updatedAt: Date;
}

export function initializeOrderModel(sequelize: Sequelize): typeof OrderModel {
  OrderModel.init({
    orderId: { type: DataTypes.STRING, primaryKey: true },
    customerId: { type: DataTypes.STRING, allowNull: false },
    items: { type: DataTypes.JSON, allowNull: false },
    totalAmount: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false },
    createdAt: { type: DataTypes.DATE, allowNull: false },
    updatedAt: { type: DataTypes.DATE, allowNull: false },
  }, { 
    sequelize, 
    tableName: 'orders', 
    timestamps: true 
  });

  return OrderModel;
}
