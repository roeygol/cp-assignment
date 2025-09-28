export interface OrderItem {
  productId: string;
  quantity: number;
  sku?: string;
  name?: string;
  price?: number;
}

export interface CreateOrderRequest {
  customerId: string;
  items: OrderItem[];
  totalAmount: number;
}

export interface Order {
  orderId: string;
  customerId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

export const ORDER_STATUS = {
  PENDING_SHIPMENT: 'PendingShipment',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled'
} as const;

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

export interface OrderCreatedEvent {
  eventId: string;
  orderId: string;
  customerId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  occurredAt: string;
  version: string;
}

export interface DeliveryStatusEvent {
  eventId: string;
  orderId: string;
  status: OrderStatus;
  occurredAt: string;
}

export interface ProcessedEvent {
  eventId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface HealthResponse {
  status: string;
  timestamp?: string;
  service?: string;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export interface User {
  id: string;
  email: string;
  password: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}
