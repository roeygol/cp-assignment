import { Router } from 'express';
import { ControllerFactory } from '../controllers/ControllerFactory.js';

export function createHealthRoutes(controllerFactory: ControllerFactory): Router {
  const router = Router();
  const healthController = controllerFactory.getHealthController();

  router.get('/', (req, res) => healthController.getHealth(req, res));

  return router;
}
