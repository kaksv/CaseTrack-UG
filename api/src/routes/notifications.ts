import { Router } from 'express';
import { z } from 'zod';
import { Notification } from '../models/Notification';
import { asyncHandler } from '../lib/asyncHandler';
import { notFound } from '../lib/errors';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { writeLimiter } from '../middleware/rateLimit';
import { serializeNotification } from '../lib/serialize';

export const notificationsRouter = Router();

notificationsRouter.use(requireAuth);

const listQuery = z.object({
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  unread: z.enum(['true', 'false']).optional(),
});

notificationsRouter.get(
  '/',
  validate({ query: listQuery }),
  asyncHandler(async (req, res) => {
    const { page, limit, unread } = req.query as unknown as z.infer<typeof listQuery>;
    const userId = req.authUser!.id;
    const filter: Record<string, unknown> = { user: userId };
    if (unread === 'true') filter.read = false;

    const [items, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .populate('case', 'trackingId title')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ user: userId, read: false }),
    ]);

    res.json({
      data: items.map(serializeNotification),
      meta: {
        page,
        limit,
        total,
        pages: Math.max(1, Math.ceil(total / limit)),
        unreadCount,
      },
    });
  })
);

notificationsRouter.patch(
  '/read-all',
  writeLimiter,
  asyncHandler(async (req, res) => {
    const result = await Notification.updateMany(
      { user: req.authUser!.id, read: false },
      { $set: { read: true } }
    );
    res.json({ data: { updated: result.modifiedCount } });
  })
);

const idParams = z.object({ id: z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid notification id') });

notificationsRouter.patch(
  '/:id/read',
  writeLimiter,
  validate({ params: idParams }),
  asyncHandler(async (req, res) => {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.authUser!.id },
      { $set: { read: true } },
      { new: true }
    )
      .populate('case', 'trackingId title')
      .lean();

    if (!notification) throw notFound('Notification not found');
    res.json({ data: serializeNotification(notification) });
  })
);
