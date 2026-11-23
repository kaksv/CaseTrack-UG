import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User } from '../models/User';
import { AppError, conflict, unauthorized } from '../lib/errors';
import { asyncHandler } from '../lib/asyncHandler';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { authLimiter, writeLimiter } from '../middleware/rateLimit';
import { signToken } from '../lib/tokens';
import { serializeUser } from '../lib/serialize';

export const authRouter = Router();

const passwordSchema = z.string().min(8, 'Password must be at least 8 characters').max(128);
const phoneSchema = z
  .string()
  .trim()
  .max(32)
  .refine((value) => value === '' || /^\+?[0-9 ()-]{7,20}$/.test(value), {
    message: 'Enter a valid phone number',
  })
  .optional();

const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(120),
    email: z.string().trim().email('Enter a valid email address').max(254).transform((v) => v.toLowerCase()),
    password: passwordSchema,
    phone: phoneSchema,
  })
  .strict();

const loginSchema = z
  .object({
    email: z.string().trim().email('Enter a valid email address').transform((v) => v.toLowerCase()),
    password: z.string().min(1, 'Password is required').max(128),
  })
  .strict();

authRouter.post(
  '/register',
  authLimiter,
  validate({ body: registerSchema }),
  asyncHandler(async (req, res) => {
    const { name, email, password, phone } = req.body as z.infer<typeof registerSchema>;

    const existing = await User.exists({ email });
    if (existing) throw conflict('An account with this email already exists');

    const passwordHash = await bcrypt.hash(password, 12);
    // Public registration is always CITIZEN. Officer accounts are provisioned
    // by the seed/admin process and can never be created through this route.
    const user = await User.create({
      name,
      email,
      phone: phone || undefined,
      passwordHash,
      role: 'CITIZEN',
      isDemo: false,
    });

    const token = signToken({ id: String(user._id), role: user.role });

    res.status(201).json({
      data: {
        token,
        user: serializeUser(user.toObject()),
      },
    });
  })
);

authRouter.post(
  '/login',
  authLimiter,
  validate({ body: loginSchema }),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body as z.infer<typeof loginSchema>;

    const user = await User.findOne({ email }).select('+passwordHash').populate('institution', 'name district');
    if (!user) throw unauthorized('Invalid email or password');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw unauthorized('Invalid email or password');

    const token = signToken({ id: String(user._id), role: user.role });
    res.json({
      data: {
        token,
        user: serializeUser(user.toObject()),
      },
    });
  })
);

authRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.authUser!.id).populate('institution', 'name district').lean();
    if (!user) throw new AppError(401, 'Account no longer exists', 'UNAUTHORIZED');
    res.json({ data: serializeUser(user) });
  })
);

const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(120),
    phone: phoneSchema,
  })
  .strict();

authRouter.patch(
  '/me',
  requireAuth,
  writeLimiter,
  validate({ body: updateProfileSchema }),
  asyncHandler(async (req, res) => {
    const { name, phone } = req.body as z.infer<typeof updateProfileSchema>;
    const user = await User.findByIdAndUpdate(
      req.authUser!.id,
      { $set: { name, ...(phone !== undefined ? { phone: phone || null } : {}) } },
      { new: true, runValidators: true }
    )
      .populate('institution', 'name district')
      .lean();
    if (!user) throw new AppError(404, 'Account not found', 'NOT_FOUND');
    res.json({ data: serializeUser(user) });
  })
);
