import { ShipmentRepository } from '../repositories/ShipmentRepository.js';
import { MessageService } from './MessageService.js';
import { DeliveryService } from './DeliveryService.js';
import { HealthService } from './HealthService.js';

export class ServiceFactory {
  private static instance: ServiceFactory;
  private shipmentRepository: ShipmentRepository;
  private messageService: MessageService;
  private deliveryService: DeliveryService;
  private healthService: HealthService;

  private constructor() {
    // Initialize repositories
    this.shipmentRepository = new ShipmentRepository();
    
    // Initialize services
    this.messageService = new MessageService();
    this.deliveryService = new DeliveryService(
      this.shipmentRepository,
      this.messageService
    );
    this.healthService = new HealthService();
  }

  static getInstance(): ServiceFactory {
    if (!ServiceFactory.instance) {
      ServiceFactory.instance = new ServiceFactory();
    }
    return ServiceFactory.instance;
  }

  getShipmentRepository(): ShipmentRepository {
    return this.shipmentRepository;
  }

  getMessageService(): MessageService {
    return this.messageService;
  }

  getDeliveryService(): DeliveryService {
    return this.deliveryService;
  }

  getHealthService(): HealthService {
    return this.healthService;
  }
}
