import { Router } from 'express';
import { ControllerFactory } from '../controllers/ControllerFactory.js';

export function createDeliveryRoutes(controllerFactory: ControllerFactory): Router {
  const router = Router();
  const deliveryController = controllerFactory.getDeliveryController();

  router.get('/', (req, res) => deliveryController.getAllDeliveries(req, res));
  router.get('/:id', (req, res) => deliveryController.getDeliveryById(req, res));
  router.get('/customer/:customerId', (req, res) => deliveryController.getDeliveriesByCustomerId(req, res));
  router.get('/status/:status', (req, res) => deliveryController.getDeliveriesByStatus(req, res));

  return router;
}
