import { Router } from 'express';
import authRoutes from './auth.routes';
import chatRoutes from './chat.routes';
import providerRoutes from './provider.routes';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use('/auth', authRoutes);
router.use('/chat', authMiddleware ,chatRoutes);
router.use('/provider', authMiddleware, providerRoutes);


export default router;

