import { Router } from 'express';
import { body, query as validateQuery } from 'express-validator';
import * as deliveryController from '../controllers/delivery.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validator';

const router = Router();

router.use(authenticate);

// POST /api/v1/deliveries - Register delivery (Resident)
router.post(
  '/',
  authorize('resident', 'admin'),
  [
    body('delivery_service').trim().isLength({ min: 2, max: 100 }),
    body('vehicle_plate').trim().isLength({ min: 1, max: 20 }),
    body('estimated_arrival').isISO8601().toDate(),
    body('notes').optional().trim(),
    validate,
  ],
  deliveryController.registerDelivery
);

// GET /api/v1/deliveries/my - Get my deliveries (Resident)
router.get(
  '/my',
  authorize('resident', 'admin'),
  deliveryController.getMyDeliveries
);

// GET /api/v1/deliveries - Get all deliveries (Guard)
router.get(
  '/',
  authorize('guard', 'admin'),
  deliveryController.getAllDeliveries
);

// GET /api/v1/deliveries/passcode/:passcode - Validate passcode (Guard)
router.get(
  '/passcode/:passcode',
  authorize('guard', 'admin'),
  deliveryController.validatePasscode
);

// POST /api/v1/deliveries/:id/arrived - Mark as arrived (Guard)
router.post(
  '/:id/arrived',
  authorize('guard', 'admin'),
  deliveryController.markArrived
);

// POST /api/v1/deliveries/:id/collected - Mark as collected (Guard)
router.post(
  '/:id/collected',
  authorize('guard', 'admin'),
  deliveryController.markCollected
);

// DELETE /api/v1/deliveries/:id - Cancel delivery (Resident)
router.delete(
  '/:id',
  authorize('resident', 'admin'),
  deliveryController.cancelDelivery
);

export default router;