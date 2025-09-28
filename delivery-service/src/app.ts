import express from 'express';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import YAML from 'yaml';
import { config, validateConfig } from './config.js';
import { ServiceFactory } from './services/ServiceFactory.js';
import { ControllerFactory } from './controllers/ControllerFactory.js';
import { createDeliveryRoutes } from './routes/deliveryRoutes.js';
import { createHealthRoutes } from './routes/healthRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class App {
  private app: express.Application;
  private serviceFactory: ServiceFactory;
  private controllerFactory: ControllerFactory;

  constructor() {
    this.app = express();
    this.serviceFactory = ServiceFactory.getInstance();
    this.controllerFactory = ControllerFactory.getInstance(this.serviceFactory);
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(express.json());
    
    const swaggerPath = path.join(__dirname, '../swagger.yaml');
    const swaggerDoc = YAML.parse(fs.readFileSync(swaggerPath, 'utf8'));
    this.app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
  }

  private setupRoutes(): void {
    this.app.use('/health', createHealthRoutes(this.controllerFactory));
    this.app.use('/api/v1/deliveries', createDeliveryRoutes(this.controllerFactory));
  }

  async start(): Promise<void> {
    try {
      const deliveryService = this.serviceFactory.getDeliveryService();
      await deliveryService.startOrderCreatedConsumer();
      
      this.app.listen(config.PORT, () => {
        console.log(`Mocked Delivery service running on :${config.PORT}`);
      });
    } catch (error) {
      console.error('Fatal start error', error);
      process.exit(1);
    }
  }
}
