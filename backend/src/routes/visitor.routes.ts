// src/routes/visitor.routes.ts
import { Router } from 'express';
import { body, query as validateQuery } from 'express-validator';
import * as visitorController from '../controllers/visitor.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// POST /api/v1/visitors - Register visitor (Resident only)
router.post(
  '/',
  authorize('resident', 'admin'),
  [
    body('visitor_name').trim().isLength({ min: 2, max: 255 }),
    body('visitor_phone').optional().trim(),
    body('visitor_ic_passport').optional().trim(),
    body('vehicle_plate').optional().trim(),
    body('purpose').optional().trim(),
    body('expected_arrival').isISO8601().toDate(),
    body('expected_departure').optional().isISO8601().toDate(),
    body('property_id').isUUID(),
    validate,
  ],
  visitorController.registerVisitor
);

// GET /api/v1/visitors - List visitors
router.get(
  '/',
  [
    validateQuery('status').optional().isIn(['pending', 'approved', 'checked_in', 'checked_out', 'cancelled']),
    validateQuery('date').optional().isDate(),
    validateQuery('property_id').optional().isUUID(),
    validateQuery('page').optional().isInt({ min: 1 }),
    validateQuery('limit').optional().isInt({ min: 1, max: 100 }),
    validate,
  ],
  visitorController.getVisitors
);

// GET /api/v1/visitors/:id - Get visitor details
router.get('/:id', visitorController.getVisitorById);

// GET /api/v1/visitors/qr/:qrCode - Validate QR code (Guard)
router.get('/qr/:qrCode', authorize('guard', 'admin'), visitorController.validateVisitorQR);

// POST /api/v1/visitors/:id/check-in - Check in visitor (Guard)
router.post('/:id/check-in', authorize('guard', 'admin'), visitorController.checkInVisitor);

// POST /api/v1/visitors/:id/check-out - Check out visitor (Guard)
router.post('/:id/check-out', authorize('guard', 'admin'), visitorController.checkOutVisitor);

// DELETE /api/v1/visitors/:id - Cancel visitor
router.delete('/:id', authorize('resident', 'admin'), visitorController.cancelVisitor);

export default router;