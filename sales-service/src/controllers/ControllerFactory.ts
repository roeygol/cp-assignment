import { OrderController } from './OrderController.js';
import { HealthController } from './HealthController.js';
import { AuthController } from './AuthController.js';
import { ServiceFactory } from '../services/ServiceFactory.js';
import { IdempotencyMiddleware } from '../middleware/idempotency.js';

export class ControllerFactory {
  private static instance: ControllerFactory;
  private orderController: OrderController;
  private healthController: HealthController;
  private authController: AuthController;

  private constructor(serviceFactory: ServiceFactory) {
    const idempotencyMiddleware = new IdempotencyMiddleware(serviceFactory.getIdempotencyRepository());
    this.orderController = new OrderController(serviceFactory.getOrderService(), idempotencyMiddleware);
    this.healthController = new HealthController(serviceFactory.getHealthService());
    this.authController = new AuthController(serviceFactory.getAuthService());
  }

  static getInstance(serviceFactory: ServiceFactory): ControllerFactory {
    if (!ControllerFactory.instance) {
      ControllerFactory.instance = new ControllerFactory(serviceFactory);
    }
    return ControllerFactory.instance;
  }

  getOrderController(): OrderController {
    return this.orderController;
  }

  getHealthController(): HealthController {
    return this.healthController;
  }

  getAuthController(): AuthController {
    return this.authController;
  }
}
