import { jest } from '@jest/globals';
import { Request, Response } from 'express';

export const createMockRequest = (overrides: Partial<Request> = {}): Partial<Request> => ({
  params: {},
  body: {},
  headers: {},
  query: {},
  ...overrides,
});

export const createMockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  (res as any).status = jest.fn().mockReturnValue(res);
  (res as any).json = jest.fn().mockReturnValue(res);
  (res as any).send = jest.fn().mockReturnValue(res);
  (res as any).end = jest.fn().mockReturnValue(res);
  return res;
};

export const createMockNext = (): jest.Mock => jest.fn();

/**
 * Mock database models for testing
 */
export const createMockOrder = (overrides: any = {}) => ({
  orderId: 'test-order-123',
  customerId: 'test-customer-123',
  items: [
    { productId: 'p1', quantity: 2, sku: 'SKU-001', name: 'Product 1', price: 14.99 },
  ],
  totalAmount: 29.98,
  status: 'PendingShipment',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  ...overrides,
});

export const createMockUser = (overrides: any = {}) => ({
  id: 'test-user-123',
  email: 'test@example.com',
  password: 'hashed-password',
  role: 'customer',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  ...overrides,
});

/**
 * Mock repository responses
 */
export const createMockRepository = () => ({
  findByOrderId: jest.fn(),
  createOrder: jest.fn(),
  getOrdersByCustomerId: jest.fn(),
  getOrdersByStatus: jest.fn(),
  count: jest.fn(),
  findByEmail: jest.fn(),
  createUser: jest.fn(),
  getResponse: jest.fn(),
  saveResponse: jest.fn(),
});

/**
 * Wait for async operations to complete
 */
export const waitFor = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Create a mock Express app for testing
 */
export const createMockApp = () => ({
  use: jest.fn(),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  listen: jest.fn(),
  close: jest.fn(),
});
