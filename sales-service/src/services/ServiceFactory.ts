import { OrderRepository } from '../repositories/OrderRepository.js';
import { ProcessedEventRepository } from '../repositories/ProcessedEventRepository.js';
import { IdempotencyRepository } from '../repositories/IdempotencyRepository.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { MessageService } from './MessageService.js';
import { EventService } from './EventService.js';
import { OrderService } from './OrderService.js';
import { AuthService } from './AuthService.js';
import { HealthService } from './HealthService.js';

export class ServiceFactory {
  private static instance: ServiceFactory;
  private orderRepository: OrderRepository;
  private processedEventRepository: ProcessedEventRepository;
  private idempotencyRepository: IdempotencyRepository;
  private userRepository: UserRepository;
  private messageService: MessageService;
  private eventService: EventService;
  private orderService: OrderService;
  private authService: AuthService;
  private healthService: HealthService;

  private constructor() {
    this.orderRepository = new OrderRepository();
    this.processedEventRepository = new ProcessedEventRepository();
    this.idempotencyRepository = null as any;
    this.userRepository = null as any;
    
    this.messageService = new MessageService();
    this.eventService = new EventService(
      this.messageService,
      this.processedEventRepository,
      this.orderRepository
    );
    this.orderService = new OrderService(
      this.orderRepository,
      this.eventService
    );
    this.authService = null as any;
    this.healthService = new HealthService();
  }

  static getInstance(): ServiceFactory {
    if (!ServiceFactory.instance) {
      ServiceFactory.instance = new ServiceFactory();
    }
    return ServiceFactory.instance;
  }

  getOrderRepository(): OrderRepository {
    return this.orderRepository;
  }

  getProcessedEventRepository(): ProcessedEventRepository {
    return this.processedEventRepository;
  }

  getMessageService(): MessageService {
    return this.messageService;
  }

  getEventService(): EventService {
    return this.eventService;
  }

  getOrderService(): OrderService {
    return this.orderService;
  }

  getHealthService(): HealthService {
    return this.healthService;
  }

  getIdempotencyRepository(): IdempotencyRepository {
    return this.idempotencyRepository;
  }

  getUserRepository(): UserRepository {
    return this.userRepository;
  }

  getAuthService(): AuthService {
    if (!this.authService) {
      throw new Error('AuthService not initialized. Call initializeRepositories() first.');
    }
    return this.authService;
  }

  initializeRepositories(idempotencyModel: any, userModel: any): void {
    this.idempotencyRepository = new IdempotencyRepository(idempotencyModel);
    this.userRepository = new UserRepository(userModel);
    this.authService = new AuthService(this.userRepository);
  }
}
