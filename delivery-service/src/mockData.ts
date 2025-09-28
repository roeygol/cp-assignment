import { Shipment, DELIVERY_STATUS } from './types/index.js';

export const shipments: Shipment[] = [
  {
    shipmentId: 'aaaaaaaa-bbbb-cccc-dddd-000000000001',
    orderId: '1a2b3c4d-5e6f-4a7b-8c9d-0123456789ab',
    customerId: 'customer-001',
    status: DELIVERY_STATUS.PENDING,
    trackingNumber: 'TRK-UPS-0001',
    items: [
      { productId: 'p1', sku: 'SKU-1001', name: 'Widget A', quantity: 2, price: 19.99 },
      { productId: 'p2', sku: 'SKU-1002', name: 'Widget B', quantity: 1, price: 9.99 }
    ],
    totalAmount: 49.97,
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z'
  },
  {
    shipmentId: 'aaaaaaaa-bbbb-cccc-dddd-000000000002',
    orderId: 'ab89cdef-0123-4567-89ab-cdef01234567',
    customerId: 'customer-002',
    status: DELIVERY_STATUS.SHIPPED,
    trackingNumber: 'TRK-FDX-0002',
    items: [
      { productId: 'p3', sku: 'SKU-2001', name: 'Gadget X', quantity: 3, price: 14.5 }
    ],
    totalAmount: 43.5,
    createdAt: '2024-01-02T10:00:00Z',
    updatedAt: '2024-01-02T11:00:00Z'
  },
  {
    shipmentId: 'aaaaaaaa-bbbb-cccc-dddd-000000000003',
    orderId: '23456789-abcd-4ef0-9123-456789abcdef',
    customerId: 'customer-003',
    status: DELIVERY_STATUS.DELIVERED,
    trackingNumber: 'TRK-DHL-0003',
    items: [
      { productId: 'p4', sku: 'SKU-3001', name: 'Tool Y', quantity: 1, price: 25.99 }
    ],
    totalAmount: 25.99,
    createdAt: '2024-01-03T10:00:00Z',
    updatedAt: '2024-01-03T15:30:00Z',
    actualDelivery: '2024-01-03T15:30:00Z'
  },
  {
    shipmentId: 'aaaaaaaa-bbbb-cccc-dddd-000000000004',
    orderId: '01234567-89ab-cdef-0123-456789abcdef',
    customerId: 'customer-004',
    status: DELIVERY_STATUS.PENDING,
    trackingNumber: 'TRK-USP-0004',
    items: [
      { productId: 'p5', sku: 'SKU-4001', name: 'Device Z', quantity: 2, price: 15.99 }
    ],
    totalAmount: 31.98,
    createdAt: '2024-01-04T10:00:00Z',
    updatedAt: '2024-01-04T10:00:00Z'
  },
  {
    shipmentId: 'aaaaaaaa-bbbb-cccc-dddd-000000000005',
    orderId: '123e4567-e89b-12d3-a456-426614174001',
    customerId: 'customer-005',
    status: DELIVERY_STATUS.SHIPPED,
    trackingNumber: 'TRK-UPS-0005',
    items: [
      { productId: 'p6', sku: 'SKU-5001', name: 'Component A', quantity: 1, price: 45.99 }
    ],
    totalAmount: 45.99,
    createdAt: '2024-01-05T10:00:00Z',
    updatedAt: '2024-01-05T12:00:00Z'
  },
  {
    shipmentId: 'aaaaaaaa-bbbb-cccc-dddd-000000000006',
    orderId: '323e4567-e89b-12d3-a456-426614174003',
    customerId: 'customer-006',
    status: DELIVERY_STATUS.DELIVERED,
    trackingNumber: 'TRK-FDX-0006',
    items: [
      { productId: 'p7', sku: 'SKU-6001', name: 'Part B', quantity: 3, price: 12.99 }
    ],
    totalAmount: 38.97,
    createdAt: '2024-01-06T10:00:00Z',
    updatedAt: '2024-01-06T16:45:00Z',
    actualDelivery: '2024-01-06T16:45:00Z'
  },
  {
    shipmentId: 'aaaaaaaa-bbbb-cccc-dddd-000000000007',
    orderId: '523e4567-e89b-12d3-a456-426614174005',
    customerId: 'customer-007',
    status: DELIVERY_STATUS.PENDING,
    trackingNumber: 'TRK-DHL-0007',
    items: [
      { productId: 'p8', sku: 'SKU-7001', name: 'Module C', quantity: 1, price: 89.99 }
    ],
    totalAmount: 89.99,
    createdAt: '2024-01-07T10:00:00Z',
    updatedAt: '2024-01-07T10:00:00Z'
  },
  {
    shipmentId: 'aaaaaaaa-bbbb-cccc-dddd-000000000008',
    orderId: '723e4567-e89b-12d3-a456-426614174007',
    customerId: 'customer-008',
    status: DELIVERY_STATUS.SHIPPED,
    trackingNumber: 'TRK-USP-0008',
    items: [
      { productId: 'p9', sku: 'SKU-8001', name: 'System D', quantity: 1, price: 199.99 }
    ],
    totalAmount: 199.99,
    createdAt: '2024-01-08T10:00:00Z',
    updatedAt: '2024-01-08T14:20:00Z'
  },
  {
    shipmentId: 'aaaaaaaa-bbbb-cccc-dddd-000000000009',
    orderId: '923e4567-e89b-12d3-a456-426614174009',
    customerId: 'customer-009',
    status: DELIVERY_STATUS.DELIVERED,
    trackingNumber: 'TRK-UPS-0009',
    items: [
      { productId: 'p10', sku: 'SKU-9001', name: 'Accessory E', quantity: 2, price: 29.99 }
    ],
    totalAmount: 59.98,
    createdAt: '2024-01-09T10:00:00Z',
    updatedAt: '2024-01-09T17:15:00Z',
    actualDelivery: '2024-01-09T17:15:00Z'
  },
  {
    shipmentId: 'aaaaaaaa-bbbb-cccc-dddd-000000000010',
    orderId: 'b23e4567-e89b-12d3-a456-42661417400b',
    customerId: 'customer-010',
    status: DELIVERY_STATUS.PENDING,
    trackingNumber: 'TRK-FDX-0010',
    items: [
      { productId: 'p11', sku: 'SKU-10001', name: 'Upgrade F', quantity: 1, price: 149.99 }
    ],
    totalAmount: 149.99,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z'
  }
];
