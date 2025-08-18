// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { router as healthRouter } from './routes/health';
import { errorHandler } from './middleware/error';
import { router as authRouter } from './routes/auth';


const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

app.use('/health', healthRouter);
app.use(errorHandler);
app.use('/auth', authRouter);


export default app;
