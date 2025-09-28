export interface Shipment {
  shipmentId: string;
  orderId: string;
  customerId: string;
  status: DeliveryStatus;
  trackingNumber?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  sku?: string;
  name?: string;
  price?: number;
}

export const DELIVERY_STATUS = {
  PENDING: 'Pending',
  SHIPPED: 'Shipped',
  IN_TRANSIT: 'InTransit',
  DELIVERED: 'Delivered',
  FAILED: 'Failed',
  RETURNED: 'Returned'
} as const;

export type DeliveryStatus = typeof DELIVERY_STATUS[keyof typeof DELIVERY_STATUS];

export interface OrderCreatedEvent {
  eventId: string;
  orderId: string;
  customerId: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  occurredAt: string;
  version: string;
}

export interface DeliveryStatusEvent {
  eventId: string;
  orderId: string;
  status: string;
  occurredAt: string;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  items?: T[];
}

export interface HealthResponse {
  status: string;
  timestamp?: string;
  service?: string;
}
