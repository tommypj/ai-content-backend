// src/server.ts
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import authRoutes from './routes/auth.js';

import { app } from './app.js';
import { connectMongo } from './startup/mongo.js';

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Health
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// Routes
app.use('/api/auth', authRoutes);

// 404
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// Error handler (last)
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const msg = err instanceof Error ? err.message : 'Internal error';
  const code = typeof (err as any)?.status === 'number' ? (err as any).status : 500;
  if (process.env.NODE_ENV !== 'production') {
    console.error('[server] error:', err);
  }
  res.status(code).json({ error: msg });
});

const PORT = Number(process.env.PORT || 8080);
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error('Missing MONGODB_URI');

(async () => {
  await connectMongo(MONGODB_URI);
  app.listen(PORT, '0.0.0.0', () => console.log(`API listening on :${PORT}`));
})();

export default app;
