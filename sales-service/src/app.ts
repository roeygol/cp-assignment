import express from 'express';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import YAML from 'yaml';
import { v4 as uuidv4 } from 'uuid';
import helmet from 'helmet';
import cors from 'cors';
import { config, validateConfig } from './config.js';
import { sequelize } from './database/connection.js';
import { initializeOrderModel } from './models/OrderModel.js';
import { initializeProcessedEventModel } from './models/ProcessedEventModel.js';
import { initializeIdempotencyModel } from './repositories/IdempotencyRepository.js';
import { initializeUserModel } from './repositories/UserRepository.js';
import { ServiceFactory } from './services/ServiceFactory.js';
import { ControllerFactory } from './controllers/ControllerFactory.js';
import { createOrderRoutes } from './routes/orderRoutes.js';
import { createHealthRoutes } from './routes/healthRoutes.js';
import { createAuthRoutes } from './routes/authRoutes.js';
import { ORDER_STATUS } from './types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class App {
  private app: express.Application;
  private serviceFactory: ServiceFactory;
  private controllerFactory: ControllerFactory | null = null;

  constructor() {
    this.app = express();
    this.serviceFactory = ServiceFactory.getInstance();
    this.setupMiddleware();
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    this.app.use(cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true
    }));
    
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Swagger
    const swaggerPath = path.join(__dirname, '../swagger.yaml');
    const swaggerDoc = YAML.parse(fs.readFileSync(swaggerPath, 'utf8'));
    this.app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
  }

  private setupRoutes(): void {
    if (!this.controllerFactory) {
      throw new Error('ControllerFactory not initialized. Call initializeControllerFactory() first.');
    }

    this.app.use('/health', createHealthRoutes(this.controllerFactory));
    this.app.use('/api/v1/auth', createAuthRoutes(this.controllerFactory));
    this.app.use('/api/v1/orders', createOrderRoutes(this.controllerFactory, this.serviceFactory));
  }

  private initializeControllerFactory(): void {
    this.controllerFactory = ControllerFactory.getInstance(this.serviceFactory);
    this.setupRoutes();
  }

  private async seedInitialData(): Promise<void> {
    const orderRepository = this.serviceFactory.getOrderRepository();
    const existingOrders = await orderRepository.count();
    
    if (existingOrders === 0) {
      const seedOrders = [
        {
          orderId: uuidv4(),
          customerId: 'customer-001',
          items: [
            { productId: 'p1', sku: 'SKU-1001', name: 'Widget A', quantity: 2, price: 19.99 },
            { productId: 'p2', sku: 'SKU-1002', name: 'Widget B', quantity: 1, price: 9.99 }
          ],
          totalAmount: 49.97,
          status: ORDER_STATUS.PENDING_SHIPMENT,
        },
        {
          orderId: uuidv4(),
          customerId: 'customer-002',
          items: [
            { productId: 'p3', sku: 'SKU-2001', name: 'Gadget X', quantity: 3, price: 14.5 }
          ],
          totalAmount: 43.5,
          status: ORDER_STATUS.PENDING_SHIPMENT,
        }
      ];

      for (const order of seedOrders) {
        await orderRepository.createOrder(order);
      }
      console.log('Seeded initial orders');
    }
  }

  async start(): Promise<void> {
    try {
      initializeOrderModel(sequelize);
      initializeProcessedEventModel(sequelize);
      const idempotencyModel = initializeIdempotencyModel(sequelize);
      const userModel = initializeUserModel(sequelize);

      this.serviceFactory.initializeRepositories(idempotencyModel, userModel);

      this.initializeControllerFactory();

      await sequelize.sync();
      
      await this.seedInitialData();
      
      const authService = this.serviceFactory.getAuthService();
      await authService.createDefaultUsers();
      
      const eventService = this.serviceFactory.getEventService();
      await eventService.startDeliveryStatusConsumer();
      
      this.app.listen(config.PORT, () => {
        console.log(`Sales service running on :${config.PORT}`);
        console.log(`Health check: http://localhost:${config.PORT}/health`);
        console.log(`API docs: http://localhost:${config.PORT}/docs`);
        console.log(`Auth endpoints: http://localhost:${config.PORT}/api/v1/auth`);
        console.log(`Order endpoints: http://localhost:${config.PORT}/api/v1/orders`);
      });
    } catch (error) {
      console.error('Fatal start error', error);
      process.exit(1);
    }
  }
}
