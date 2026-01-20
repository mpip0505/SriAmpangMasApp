import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validator';

const router = Router();

// POST /api/v1/auth/register
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('full_name').trim().isLength({ min: 2, max: 255 }),
    body('role').isIn(['admin', 'resident', 'guard']),
    body('community_id').isUUID(),
    validate,
  ],
  authController.register
);

// POST /api/v1/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').exists(),
    validate,
  ],
  authController.login
);

// POST /api/v1/auth/refresh
router.post(
  '/refresh',
  [
    body('refresh_token').exists(),
    validate,
  ],
  authController.refreshToken
);

// POST /api/v1/auth/logout
router.post(
  '/logout',
  authenticate,
  authController.logout
);

// GET /api/v1/auth/me
router.get(
  '/me',
  authenticate,
  authController.getCurrentUser
);

// PUT /api/v1/auth/me
router.put(
  '/me',
  authenticate,
  [
    body('full_name').optional().trim().isLength({ min: 2, max: 255 }),
    body('phone').optional().trim(),
    validate,
  ],
  authController.updateCurrentUser
);

// POST /api/v1/auth/change-password
router.post(
  '/change-password',
  authenticate,
  [
    body('current_password').exists(),
    body('new_password').isLength({ min: 8 }),
    validate,
  ],
  authController.changePassword
);

export default router;