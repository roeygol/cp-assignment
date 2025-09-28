import { v4 as uuidv4 } from 'uuid';
import { Shipment, OrderCreatedEvent, DeliveryStatusEvent, DELIVERY_STATUS } from '../types/index.js';
import { ShipmentRepository } from '../repositories/ShipmentRepository.js';
import { MessageService } from './MessageService.js';

export class DeliveryService {
  constructor(
    private shipmentRepository: ShipmentRepository,
    private messageService: MessageService
  ) {}

  async getAllDeliveries(): Promise<Shipment[]> {
    return await this.shipmentRepository.findAll();
  }

  async getDeliveryById(id: string): Promise<Shipment | null> {
    return await this.shipmentRepository.findById(id);
  }

  async getDeliveriesByCustomerId(customerId: string): Promise<Shipment[]> {
    return await this.shipmentRepository.findByCustomerId(customerId);
  }

  async getDeliveriesByStatus(status: string): Promise<Shipment[]> {
    return await this.shipmentRepository.findByStatus(status);
  }

  async processOrderCreatedEvent(message: any): Promise<void> {
    return new Promise((resolve, reject) => {
      message.readString('utf-8', (readErr: Error | null, body: string) => {
        if (readErr) {
          console.error('read error', readErr.message);
          reject(readErr);
          return;
        }
        
        try {
          const event: OrderCreatedEvent = JSON.parse(body);
          const orderId = event.orderId;

          // Simulate shipment then delivery
          this.simulateDeliveryProcess(orderId);
          resolve();
        } catch (error) {
          console.error('Error processing order created event:', error);
          reject(error);
        }
      });
    });
  }

  private async simulateDeliveryProcess(orderId: string): Promise<void> {
    const sendStatus = async (status: string): Promise<void> => {
      const event: DeliveryStatusEvent = {
        eventId: uuidv4(),
        orderId,
        status,
        occurredAt: new Date().toISOString(),
      };
      await this.messageService.publishDeliveryStatus(event);
    };

    // Simulate delivery timeline
    setTimeout(() => sendStatus(DELIVERY_STATUS.SHIPPED), 500);
    setTimeout(() => sendStatus(DELIVERY_STATUS.DELIVERED), 1500);
  }

  async startOrderCreatedConsumer(): Promise<void> {
    await this.messageService.subscribeToOrderCreated((message) => 
      this.processOrderCreatedEvent(message)
    );
  }
}
