import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { getPort } from './utils/env';
import authRoutes from './auth/routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);

app.use(errorHandler);

const port = getPort();
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Backend listening on http://localhost:${port}`);
  });
}

export default app;
