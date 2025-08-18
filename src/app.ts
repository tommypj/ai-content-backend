// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { router as healthRouter } from './routes/health.js';
import { router as authRouter } from './routes/auth.js';
import authRoutes from './routes/auth.js';
import healthRoutes from './routes/health.js';
import { errorHandler } from './middleware/error.js';


export const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/health', healthRoutes);

app.get('/', (_req, res) => res.json({ ok: true }));

app.use(errorHandler);