import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import * as userModel from '../models/user.model.js';
import { signToken } from '../utils/jwt.js';
import { AppError } from '../middleware/errorHandler.js';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function register(req: Request, res: Response): Promise<void> {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.issues[0].message });
    return;
  }

  const { email, password, first_name, last_name } = parsed.data;

  const existing = await userModel.findByEmail(email);
  if (existing) {
    throw new AppError(409, 'Email already registered');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await userModel.create(email, passwordHash, first_name, last_name);

  const token = signToken({
    user_id: user.id,
    email: user.email,
    tier: user.subscription_tier,
  });

  res.status(201).json({
    success: true,
    data: { user, token },
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.issues[0].message });
    return;
  }

  const { email, password } = parsed.data;

  const passwordHash = await userModel.getPasswordHash(email);
  if (!passwordHash) {
    throw new AppError(401, 'Invalid email or password');
  }

  const valid = await bcrypt.compare(password, passwordHash);
  if (!valid) {
    throw new AppError(401, 'Invalid email or password');
  }

  const user = await userModel.findByEmail(email);
  if (!user) throw new AppError(401, 'Invalid email or password');

  const token = signToken({
    user_id: user.id,
    email: user.email,
    tier: user.subscription_tier,
  });

  res.json({
    success: true,
    data: { user, token },
  });
}

export async function getMe(req: Request, res: Response): Promise<void> {
  const user = await userModel.findById(req.user!.user_id);
  if (!user) {
    throw new AppError(404, 'User not found');
  }

  res.json({ success: true, data: user });
}
