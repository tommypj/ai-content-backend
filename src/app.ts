// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import authRouter from './routes/auth.js';
import healthRouter from './routes/health.js';
import { errorHandler } from './middleware/error.js';

export const app = express();

// Core middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/health', healthRouter);

// Root
app.get('/', (_req, res) => res.json({ ok: true }));

// 404
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// Error handler (last)
app.use(errorHandler);
