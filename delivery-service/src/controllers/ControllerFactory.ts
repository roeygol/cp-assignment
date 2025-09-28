import { DeliveryController } from './DeliveryController.js';
import { HealthController } from './HealthController.js';
import { ServiceFactory } from '../services/ServiceFactory.js';

export class ControllerFactory {
  private static instance: ControllerFactory;
  private deliveryController: DeliveryController;
  private healthController: HealthController;

  private constructor(serviceFactory: ServiceFactory) {
    this.deliveryController = new DeliveryController(serviceFactory.getDeliveryService());
    this.healthController = new HealthController(serviceFactory.getHealthService());
  }

  static getInstance(serviceFactory: ServiceFactory): ControllerFactory {
    if (!ControllerFactory.instance) {
      ControllerFactory.instance = new ControllerFactory(serviceFactory);
    }
    return ControllerFactory.instance;
  }

  getDeliveryController(): DeliveryController {
    return this.deliveryController;
  }

  getHealthController(): HealthController {
    return this.healthController;
  }
}
