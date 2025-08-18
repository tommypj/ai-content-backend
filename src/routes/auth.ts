// src/routes/auth.ts
import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export const router = Router();

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

router.post('/register', async (req, res, next) => {
  try {
    const { email, password } = RegisterSchema.parse(req.body);
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already registered' });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ email, passwordHash });
    return res.status(201).json({ id: user.id, email: user.email });
  } catch (e) { next(e); }
});

const LoginSchema = RegisterSchema;

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = LoginSchema.parse(req.body);
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ sub: user.id, plan: user.plan }, process.env.JWT_SECRET!, { expiresIn: '1h' });
    const refresh = jwt.sign({ sub: user.id }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' });
    res.json({ token, refresh });
  } catch (e) { next(e); }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const { refresh } = req.body;
    const payload = jwt.verify(refresh, process.env.JWT_REFRESH_SECRET!) as any;
    const token = jwt.sign({ sub: payload.sub }, process.env.JWT_SECRET!, { expiresIn: '1h' });
    res.json({ token });
  } catch (e) { next(e); }
});
