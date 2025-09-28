import { Router } from 'express';
import { ControllerFactory } from '../controllers/ControllerFactory.js';
import { SecurityMiddleware } from '../middleware/security.js';
import { authLimiter } from '../middleware/rateLimiting.js';

export function createAuthRoutes(controllerFactory: ControllerFactory): Router {
  const router = Router();
  const authController = controllerFactory.getAuthController();

  // Apply rate limiting to auth endpoints
  router.use(authLimiter);

  router.post('/login', (req, res) => authController.login(req, res));
  router.post('/register', (req, res) => authController.register(req, res));

  return router;
}
