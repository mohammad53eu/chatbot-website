import { Router } from 'express';
import authRoutes from './auth.routes.js';
import chatRoutes from './chat.routes.js';
import providerRoutes from './provider.routes.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/chat', authMiddleware ,chatRoutes);
router.use('/provider', authMiddleware, providerRoutes);


export default router;

