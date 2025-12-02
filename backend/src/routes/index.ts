import { Router } from 'express';
import authRoutes from './auth.routes';
import chatRoutes from './chat.routes';
import providerRoutes from './provider.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/chat', chatRoutes);
router.use('/provider', providerRoutes);


export default router;

