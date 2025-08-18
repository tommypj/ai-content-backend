// src/routes/auth.ts
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import type { Secret, SignOptions } from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

// ⚠️ NodeNext + ESM: keep .js in relative imports
import { UserModel } from '../models/User.js';

// ---------- Schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// ---------- Helpers
function assertEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw Object.assign(new Error(`Missing required env: ${name}`), { status: 500 });
  return v;
}

const JWT_SECRET: Secret = assertEnv('JWT_SECRET');
type JwtExpires = NonNullable<SignOptions['expiresIn']>;
const JWT_EXPIRES_IN: JwtExpires = (process.env.JWT_EXPIRES_IN ?? '7d') as JwtExpires;


export function signAuthToken(payload: { sub: string; email: string; plan?: string }): string {
  const opts: SignOptions = { expiresIn: JWT_EXPIRES_IN }; // no undefined here
  return jwt.sign(payload, JWT_SECRET, opts);
}

function parse<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const msg = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw Object.assign(new Error(msg), { status: 400 });
  }
  return result.data;
}

// Middleware: Bearer auth
function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) throw Object.assign(new Error('Missing token'), { status: 401 });
    const token = header.slice('Bearer '.length);
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string; email: string; plan?: string };
    (req as any).auth = payload;
    next();
  } catch {
    next(Object.assign(new Error('Unauthorized'), { status: 401 }));
  }
}

// ---------- Router
const router = Router();

/**
 * POST /api/auth/register
 * body: { email, password }
 */
router.post('/register', async (req, res, next) => {
  try {
    const { email, password } = parse(registerSchema, req.body);
    const normalizedEmail = email.trim().toLowerCase();

    const exists = await UserModel.exists({ email: normalizedEmail }).exec();
    if (exists) throw Object.assign(new Error('Email already in use'), { status: 409 });

    const passwordHash = await bcrypt.hash(password, 12);
    const doc = await UserModel.create({ email: normalizedEmail, passwordHash, plan: 'free' });

    const token = signAuthToken({ sub: String(doc._id), email: doc.email, plan: doc.plan }); // <- fixed
    res.status(201).json({ token, user: { id: doc._id, email: doc.email, plan: doc.plan } });
  } catch (err: any) {
    // handles rare race where unique index throws E11000
    if (err?.code === 11000) return next(Object.assign(new Error('Email already in use'), { status: 409 }));
    next(err);
  }
});

/**
 * POST /api/auth/login
 * body: { email, password }
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = parse(loginSchema, req.body);
    const normalizedEmail = email.trim().toLowerCase();

    const user = await UserModel.findOne({ email: normalizedEmail }).exec(); // hydrated doc
    if (!user) throw Object.assign(new Error('Invalid credentials'), { status: 401 });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw Object.assign(new Error('Invalid credentials'), { status: 401 });

    const token = signAuthToken({ sub: String(user._id), email: user.email, plan: user.plan }); // <- fixed
    res.json({ token, user: { id: user._id, email: user.email, plan: user.plan } });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/auth/me
 * header: Authorization: Bearer <token>
 */
router.get('/me', requireAuth, async (req, res) => {
  const auth = (req as any).auth as { sub: string; email: string; plan?: string };
  res.json({ user: { id: auth.sub, email: auth.email, plan: auth.plan ?? 'free' } });
});

export default router;
