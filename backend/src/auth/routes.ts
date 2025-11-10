import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import * as controller from './controller';

const router = Router();

router.post('/register', asyncHandler(controller.register));
router.post('/login', asyncHandler(controller.login));

// Placeholder for Google OAuth
router.get('/google', (_req, res) => {
  res.status(501).json({ error: 'Google OAuth not implemented yet' });
});
router.get('/google/callback', (_req, res) => {
  res.status(501).json({ error: 'Google OAuth not implemented yet' });
});

export default router;
