import { v4 as uuidv4 } from 'uuid';
import { OrderCreatedEvent, DeliveryStatusEvent, OrderStatus, OrderItem } from '../types/index.js';
import { MessageService } from './MessageService.js';
import { ProcessedEventRepository } from '../repositories/ProcessedEventRepository.js';
import { OrderRepository } from '../repositories/OrderRepository.js';
import { sequelize } from '../database/connection.js';

export class EventService {
  constructor(
    private messageService: MessageService,
    private processedEventRepository: ProcessedEventRepository,
    private orderRepository: OrderRepository
  ) {}

  async publishOrderCreatedEvent(orderData: {
    orderId: string;
    customerId: string;
    items: OrderItem[];
    totalAmount: number;
    status: OrderStatus;
  }): Promise<void> {
    const event: OrderCreatedEvent = {
      eventId: uuidv4(),
      orderId: orderData.orderId,
      customerId: orderData.customerId,
      items: orderData.items,
      totalAmount: orderData.totalAmount,
      status: orderData.status,
      occurredAt: new Date().toISOString(),
      version: '1'
    };

    await this.messageService.publishOrderCreated(event);
  }

  async processDeliveryStatusEvent(message: any): Promise<void> {
    return new Promise((resolve, reject) => {
      message.readString('utf-8', async (readErr: Error | null, content: string) => {
        if (readErr) {
          console.error('read error', readErr.message);
          reject(readErr);
          return;
        }
        
        try {
          const event: DeliveryStatusEvent = JSON.parse(content);
          const eventId = event.eventId;
          const orderId = event.orderId;
          const status = event.status as OrderStatus;

          // Check if event already processed
          const alreadyProcessed = await this.processedEventRepository.isEventProcessed(eventId);
          if (alreadyProcessed) {
            console.log(`Event ${eventId} already processed, skipping`);
            resolve();
            return;
          }

          // Process event in transaction
          await sequelize.transaction(async (t) => {
            await this.processedEventRepository.createProcessedEvent(eventId, t);
            await this.orderRepository.updateOrderStatus(orderId, status, t);
          });

          console.log(`Processed delivery status update for order ${orderId}: ${status}`);
          resolve();
        } catch (error) {
          console.error('Error processing delivery status event:', error);
          reject(error);
        }
      });
    });
  }

  async startDeliveryStatusConsumer(): Promise<void> {
    await this.messageService.subscribeToDeliveryStatus((message) => 
      this.processDeliveryStatusEvent(message)
    );
  }
}
