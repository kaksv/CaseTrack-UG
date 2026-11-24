
import { Router } from 'express';
import { z } from 'zod';
import type { FilterQuery } from 'mongoose';

import {
    Institution,
    INSTITUTION_LEVELS,
    type IInstitution,
} from '../models/Institution';

import { requireAuth, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../lib/asyncHandler';
import { serializeInstitution } from '../lib/serialize';

import {
    conflict,
    notFound,
} from '../lib/errors';

export const adminRouter = Router();

// All administrative endpoints require an active
// system administrator account.
adminRouter.use(
    requireAuth,
    requireRole('SYSTEM_ADMIN'),
);

const institutionIdSchema = z.object({
    id: z.string().regex(/^[a-fA-F0-9]{24}$/),
});

const institutionFields = z.object({
    name: z.string().trim().min(3).max(160),

    level: z.enum(INSTITUTION_LEVELS),

    district: z.string().trim().min(2).max(80),

    subcounty: z.string().trim().min(2).max(120),

    address: z.string().trim().max(240).optional(),
}).strict();

const createInstitutionSchema = institutionFields;

const updateInstitutionSchema = institutionFields
    .partial()
    .refine(
        (value) => Object.keys(value).length > 0,
        'Provide at least one field to update',
    );

const institutionQuerySchema = z.object({
    q: z.string().trim().max(100).optional(),

    district: z.string().trim().max(80).optional(),

    active: z.enum([
        'true',
        'false',
        'all',
    ]).default('all'),

    page: z.coerce.number().int().min(1).max(10000).default(1),

    limit: z.coerce.number().int().min(1).max(100).default(20),
}).strict();

function isDuplicateKey(error: unknown): boolean {
    return (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 11000
    );
}

// ============================================
// GET /api/admin/institutions
// ============================================

adminRouter.get(
    '/institutions',

    validate({
        query: institutionQuerySchema,
    }),

    asyncHandler(async (req, res) => {
        const actor = req.authUser!;

        const {
            q,
            district,
            active,
            page,
            limit,
        } = req.query as unknown as z.infer<
            typeof institutionQuerySchema
        >;

        // Demo administrators cannot access
        // non-demo institutions.
        const filter: FilterQuery<IInstitution> = {
            isDemo: actor.isDemo,
        };

        if (district) {
            filter.district = district;
        }

        if (active !== 'all') {
            filter.active = active === 'true';
        }

        if (q) {
            const safe = q.replace(
                /[.*+?^${}()|[\]\\]/g,
                '\\$&',
            );

            filter.$or = [
                {
                    name: {
                        $regex: safe,
                        $options: 'i',
                    },
                },
                {
                    district: {
                        $regex: safe,
                        $options: 'i',
                    },
                },
                {
                    subcounty: {
                        $regex: safe,
                        $options: 'i',
                    },
                },
            ];
        }

        const [institutions, total] =
            await Promise.all([
                Institution.find(filter)
                    .sort({
                        district: 1,
                        name: 1,
                        _id: 1,
                    })
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .lean(),

                Institution.countDocuments(filter),
            ]);

        res.json({
            data: institutions.map(
                serializeInstitution,
            ),

            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    }),
);

// ============================================
// POST /api/admin/institutions
// ============================================

adminRouter.post(
    '/institutions',

    validate({
        body: createInstitutionSchema,
    }),

    asyncHandler(async (req, res) => {
        const actor = req.authUser!;

        const input = req.body as z.infer<
            typeof createInstitutionSchema
        >;

        try {
            const institution = await Institution.create({
                ...input,

                active: true,

                // Derived from the authenticated administrator.
                // Never accepted from the request body.
                isDemo: actor.isDemo,

                dutyOfficer: null,
            });

            res.status(201).json({
                data: serializeInstitution(institution),
            });
        } catch (error) {
            if (isDuplicateKey(error)) {
                throw conflict(
                    'An institution with this name and district already exists',
                );
            }

            throw error;
        }
    }),
);

// ============================================
// PATCH /api/admin/institutions/:id
// ============================================

adminRouter.patch(
    '/institutions/:id',

    validate({
        params: institutionIdSchema,
        body: updateInstitutionSchema,
    }),

    asyncHandler(async (req, res) => {
        const actor = req.authUser!;

        const input = req.body as z.infer<
            typeof updateInstitutionSchema
        >;

        try {
            const institution =
                await Institution.findOneAndUpdate(
                    {
                        _id: req.params.id,
                        isDemo: actor.isDemo,
                    },
                    {
                        $set: input,
                    },
                    {
                        new: true,
                        runValidators: true,
                    },
                );

            if (!institution) {
                throw notFound('Institution not found');
            }

            res.json({
                data: serializeInstitution(institution),
            });
        } catch (error) {
            if (isDuplicateKey(error)) {
                throw conflict(
                    'An institution with this name and district already exists',
                );
            }

            throw error;
        }
    }),
);
