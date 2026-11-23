import { Router } from 'express';
import { z } from 'zod';
import { Institution } from '../models/Institution';
import { asyncHandler } from '../lib/asyncHandler';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { serializeInstitution } from '../lib/serialize';

export const institutionsRouter = Router();

const querySchema = z.object({
  q: z.string().trim().max(100).optional(),
  district: z.string().trim().max(80).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(100),
});

institutionsRouter.get(
  '/',
  requireAuth,
  validate({ query: querySchema }),
  asyncHandler(async (req, res) => {
    const { q, district, limit } = req.query as unknown as z.infer<typeof querySchema>;
    const filter: Record<string, unknown> = { active: true };
    if (district) filter.district = district;
    if (q) {
      const safe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { name: { $regex: safe, $options: 'i' } },
        { district: { $regex: safe, $options: 'i' } },
        { subcounty: { $regex: safe, $options: 'i' } },
      ];
    }

    const institutions = await Institution.find(filter)
      .sort({ district: 1, name: 1 })
      .limit(limit)
      .lean();

    res.json({ data: institutions.map(serializeInstitution) });
  })
);
