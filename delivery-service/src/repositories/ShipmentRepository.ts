import { Shipment } from '../types/index.js';
import { shipments } from '../mockData.js';

export class ShipmentRepository {
  async findAll(): Promise<Shipment[]> {
    return [...shipments];
  }

  async findById(id: string): Promise<Shipment | null> {
    return shipments.find(s => s.shipmentId === id || s.orderId === id) || null;
  }

  async findByCustomerId(customerId: string): Promise<Shipment[]> {
    return shipments.filter(s => s.customerId === customerId);
  }

  async findByStatus(status: string): Promise<Shipment[]> {
    return shipments.filter(s => s.status === status);
  }
}
