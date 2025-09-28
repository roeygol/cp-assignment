import { Router } from 'express';
import { ControllerFactory } from '../controllers/ControllerFactory.js';
import { ServiceFactory } from '../services/ServiceFactory.js';
import { SecurityMiddleware } from '../middleware/security.js';
import { IdempotencyMiddleware } from '../middleware/idempotency.js';
import { orderCreationLimiter, generalLimiter } from '../middleware/rateLimiting.js';

export function createOrderRoutes(controllerFactory: ControllerFactory, serviceFactory: ServiceFactory): Router {
  const router = Router();
  const orderController = controllerFactory.getOrderController();
  const idempotencyRepository = serviceFactory.getIdempotencyRepository();
  const idempotencyMiddleware = new IdempotencyMiddleware(idempotencyRepository);

  // Apply general rate limiting
  router.use(generalLimiter);

  // GET routes - API key authentication
  router.get('/:id', SecurityMiddleware.validateApiKey, (req, res) => orderController.getOrderById(req, res));
  router.get('/customer/:customerId', SecurityMiddleware.validateApiKey, (req, res) => orderController.getOrdersByCustomerId(req, res));
  router.get('/status/:status', SecurityMiddleware.validateApiKey, (req, res) => orderController.getOrdersByStatus(req, res));

  // POST route - JWT authentication + idempotency + rate limiting
  router.post('/', 
    orderCreationLimiter,
    SecurityMiddleware.validateJWT,
    (req, res, next) => idempotencyMiddleware.handleIdempotency(req, res, next),
    (req, res) => orderController.createOrder(req, res)
  );

  return router;
}
