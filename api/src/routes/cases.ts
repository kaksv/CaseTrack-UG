import { Router } from 'express';
import { randomInt } from 'node:crypto';
import { z } from 'zod';
import { Types, type FilterQuery } from 'mongoose';
import { Case, type ICase } from '../models/Case';
import { CaseEvent } from '../models/CaseEvent';
import { CaseAccess } from '../models/CaseAccess';
import { Institution } from '../models/Institution';
import { Notification } from '../models/Notification';
import {
  ALLOWED_TRANSITIONS,
  CASE_CATEGORIES,
  CASE_STATUSES,
  STATUS_LABELS,
  type CaseCategory,
  type CaseStatus,
} from '../lib/domain';
import { badRequest, forbidden, notFound } from '../lib/errors';
import { asyncHandler } from '../lib/asyncHandler';
import { requireAuth, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { writeLimiter } from '../middleware/rateLimit';
import { serializeCase, serializeCaseEvent } from '../lib/serialize';
import { notify } from '../lib/notify';
import { escapeRegex, formatKampala } from '../lib/format';
import type { AuthUser } from '../types';

export const casesRouter = Router();

casesRouter.use(requireAuth);

const CASE_POPULATE = [
  { path: 'institution', select: 'name level district subcounty' },
  { path: 'citizen', select: 'name' },
  { path: 'assignedOfficer', select: 'name' },
];

const caseIdParams = z.object({
  id: z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid case id'),
});

function citizenIdOf(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (value instanceof Types.ObjectId) return value.toString();
  if (typeof value === 'object' && '_id' in value) {
    return String((value as { _id: unknown })._id);
  }
  return String(value);
}

async function assertViewAccess(
  caseDoc: { _id: unknown; citizen?: unknown },
  user: AuthUser
): Promise<void> {
  if (user.role === 'CITIZEN') {
    const citizenId = citizenIdOf(caseDoc.citizen);

    if (!citizenId || citizenId !== user.id) {
      throw forbidden('You are not authorized to access this case');
    }

    return;
  }

  if (user.role !== 'OFFICER') {
    throw forbidden('You are not authorized to access this case');
  }

  const access = await CaseAccess.exists({
    case: caseDoc._id,
    user: user.id,
  });

  if (!access) {
    throw forbidden('This case is not assigned to you');
  }
}



async function scopeFilter(user: AuthUser): Promise<FilterQuery<ICase>> {
  if (user.role === 'CITIZEN') {
    return { citizen: new Types.ObjectId(user.id) };
  }
  const assigned = await CaseAccess.find({ user: user.id }).distinct('case');
  return { _id: { $in: assigned } };
}

function addSearch(filter: FilterQuery<ICase>, q: string | undefined): void {
  if (!q) return;
  const safe = escapeRegex(q);
  filter.$or = [
    { trackingId: { $regex: safe, $options: 'i' } },
    { title: { $regex: safe, $options: 'i' } },
    { reference: { $regex: safe, $options: 'i' } },
  ];
}

const statusEnum = z.enum([...CASE_STATUSES] as [CaseStatus, ...CaseStatus[]]);
const categoryEnum = z.enum([...CASE_CATEGORIES] as [CaseCategory, ...CaseCategory[]]);

const listQuery = z.object({
  q: z.string().trim().max(100).optional(),
  status: statusEnum.optional(),
  category: categoryEnum.optional(),
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  sort: z.enum(['recent', 'created']).default('recent'),
});

const createSchema = z
  .object({
    title: z.string().trim().min(6, 'Give the case a descriptive title').max(160),
    category: categoryEnum,
    institutionId: z.string().regex(/^[a-f0-9]{24}$/i, 'Choose a valid LC court'),
    description: z
      .string()
      .trim()
      .min(20, 'Please describe the matter in at least 20 characters')
      .max(4000),
    reference: z.string().trim().max(80).optional(),
  })
  .strict();

const statusSchema = z
  .object({
    status: statusEnum,
    note: z.string().trim().max(1000).optional(),
  })
  .strict();

const hearingSchema = z
  .object({
    type: z.literal('HEARING_SCHEDULED'),
    title: z.string().trim().min(3).max(160).optional(),
    description: z.string().trim().max(4000).optional(),
    hearingDate: z.coerce.date().refine((date) => date.getTime() > Date.now() - 60_000, {
      message: 'Choose a future hearing date and time',
    }),
  })
  .strict();

const milestoneSchema = z
  .object({
    type: z.literal('MILESTONE'),
    title: z.string().trim().min(3, 'Add a short milestone title').max(160),
    description: z.string().trim().max(4000).optional(),
  })
  .strict();

const noteSchema = z
  .object({
    type: z.literal('NOTE'),
    title: z.string().trim().min(3).max(160).optional(),
    description: z.string().trim().min(3, 'Write a note').max(4000),
  })
  .strict();

const eventSchema = z.discriminatedUnion('type', [hearingSchema, milestoneSchema, noteSchema]);

function generateTrackingId(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 6; i += 1) {
    suffix += alphabet[randomInt(alphabet.length)];
  }
  return `CTUG-${new Date().getUTCFullYear()}-${suffix}`;
}

casesRouter.get(
  '/',
  validate({ query: listQuery }),
  asyncHandler(async (req, res) => {
    const { q, status, category, page, limit, sort } = req.query as unknown as z.infer<
      typeof listQuery
    >;
    const user = req.authUser!;
    const filter = await scopeFilter(user);
    if (status) filter.status = status;
    if (category) filter.category = category;
    addSearch(filter, q);

    const [items, total] = await Promise.all([
      Case.find(filter)
        .populate(CASE_POPULATE)
        .sort(sort === 'created' ? { createdAt: -1 } : { lastEventAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Case.countDocuments(filter),
    ]);

    res.json({
      data: items.map(serializeCase),
      meta: {
        page,
        limit,
        total,
        pages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  })
);

casesRouter.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const user = req.authUser!;
    const filter = await scopeFilter(user);
    const now = new Date();

    const [allCases, upcoming, recent, unread] = await Promise.all([
      Case.find(filter).select('status').lean(),
      Case.find({ ...filter, status: 'HEARING_SCHEDULED', nextHearingAt: { $gte: now } })
        .populate(CASE_POPULATE)
        .sort({ nextHearingAt: 1 })
        .limit(5)
        .lean(),
      Case.find(filter)
        .populate(CASE_POPULATE)
        .sort({ lastEventAt: -1 })
        .limit(5)
        .lean(),
      Notification.countDocuments({ user: user.id, read: false }),
    ]);

    const statusCounts = Object.fromEntries(CASE_STATUSES.map((status) => [status, 0])) as Record<
      CaseStatus,
      number
    >;
    for (const item of allCases) {
      statusCounts[item.status] += 1;
    }

    res.json({
      data: {
        total: allCases.length,
        active: allCases.filter((item) => item.status !== 'CLOSED').length,
        statusCounts,
        upcomingHearings: upcoming.map(serializeCase),
        recentCases: recent.map(serializeCase),
        unreadNotifications: unread,
      },
    });
  })
);

casesRouter.post(
  '/',
  requireRole('CITIZEN'),
  writeLimiter,
  validate({ body: createSchema }),
  asyncHandler(async (req, res) => {
    const { title, category, institutionId, description, reference } = req.body as z.infer<
      typeof createSchema
    >;
    const user = req.authUser!;

    const institution = await Institution.findOne({ _id: institutionId, active: true }).lean();
    if (!institution) throw badRequest('The selected LC court is not available');

    let trackingId = generateTrackingId();
    for (let attempt = 0; attempt < 5; attempt += 1) {
      if (!(await Case.exists({ trackingId }))) break;
      trackingId = generateTrackingId();
    }

    const now = new Date();
    const assignedOfficer = institution.dutyOfficer ?? null;

    const created = await Case.create({
      trackingId,
      title,
      category,
      description,
      reference: reference || undefined,
      institution: institution._id,
      citizen: user.id,
      status: 'REGISTERED',
      source: 'USER_REPORTED',
      isDemo: false,
      assignedOfficer,
      lastEventAt: now,
    });

    await CaseEvent.create({
      case: created._id,
      type: 'CASE_CREATED',
      title: 'Case registered',
      description: `Case submitted by ${user.name} and recorded against ${institution.name}.`,
      statusTo: 'REGISTERED',
      source: 'USER_REPORTED',
      author: user.id,
      authorName: user.name,
      authorRole: 'CITIZEN',
      createdAt: now,
    });

    if (assignedOfficer) {
      await CaseAccess.create({
        case: created._id,
        user: assignedOfficer,
        grantedBy: null,
        reason: 'DUTY_OFFICER',
      });
    }

    try {
      await notify({
        userId: user.id,
        caseId: created._id,
        title: `Case registered — ${trackingId}`,
        body: `Your case has been recorded with ${institution.name}. Keep your tracking ID safe.`,
      });
      if (assignedOfficer) {
        await notify({
          userId: assignedOfficer,
          caseId: created._id,
          title: `New case assigned — ${trackingId}`,
          body: `${title} was submitted to ${institution.name}. Review the case when ready.`,
        });
      }
    } catch (error) {
      // Case creation must not fail because a notification write failed.
      console.error('Notification write failed:', error instanceof Error ? error.message : 'unknown');
    }

    const populated = await Case.findById(created._id).populate(CASE_POPULATE).lean();
    res.status(201).json({ data: serializeCase(populated ?? created.toObject()) });
  })
);

casesRouter.get(
  '/:id',
  validate({ params: caseIdParams }),
  asyncHandler(async (req, res) => {
    const caseDoc = await Case.findById(req.params.id).populate(CASE_POPULATE).lean();
    if (!caseDoc) throw notFound('Case not found');
    await assertViewAccess(caseDoc, req.authUser!);
    res.json({ data: serializeCase(caseDoc) });
  })
);

casesRouter.get(
  '/:id/events',
  validate({ params: caseIdParams }),
  asyncHandler(async (req, res) => {
    const caseDoc = await Case.findById(req.params.id).select('citizen').lean();
    if (!caseDoc) throw notFound('Case not found');
    await assertViewAccess(caseDoc, req.authUser!);

    const events = await CaseEvent.find({ case: caseDoc._id }).sort({ createdAt: 1 }).limit(300).lean();

    res.json({
      data: events.map(serializeCaseEvent),
      meta: { total: events.length },
    });
  })
);

casesRouter.patch(
  '/:id/status',
  requireRole('OFFICER'),
  writeLimiter,
  validate({ params: caseIdParams, body: statusSchema }),
  asyncHandler(async (req, res) => {
    const { status, note } = req.body as z.infer<typeof statusSchema>;
    const user = req.authUser!;

    const caseDoc = await Case.findById(req.params.id).populate(CASE_POPULATE).lean();
    if (!caseDoc) throw notFound('Case not found');
    await assertViewAccess(caseDoc, user);

    if (caseDoc.status === status) {
      throw badRequest(`The case is already ${STATUS_LABELS[status].toLowerCase()}`);
    }
    if (status === 'HEARING_SCHEDULED') {
      throw badRequest('Use the “Schedule hearing” action so a hearing date is recorded');
    }
    if (!ALLOWED_TRANSITIONS[caseDoc.status].includes(status)) {
      throw badRequest(
        `A case cannot move from ${STATUS_LABELS[caseDoc.status]} to ${STATUS_LABELS[status]}`
      );
    }

    const citizenId = citizenIdOf(caseDoc.citizen);


    const now = new Date();
    const updated = await Case.findByIdAndUpdate(
      caseDoc._id,
      { $set: { status, lastEventAt: now } },
      { new: true, runValidators: true }
    )
      .populate(CASE_POPULATE)
      .lean();
    if (!updated) throw notFound('Case not found');

    const event = await CaseEvent.create({
      case: caseDoc._id,
      type: 'STATUS_CHANGE',
      title: `Status changed to ${STATUS_LABELS[status]}`,
      description: note || `Status updated by ${user.name}.`,
      statusFrom: caseDoc.status,
      statusTo: status,
      source: 'OFFICER_UPDATE',
      author: user.id,
      authorName: user.name,
      authorRole: 'OFFICER',
      createdAt: now,
    });


    if (citizenId) {
      try {
        await notify({
          userId: citizenId,
          caseId: caseDoc._id,
          title: `Case ${caseDoc.trackingId} updated`,
          body: `The status is now “${STATUS_LABELS[status]}”.${note ? ` Officer note: ${note.slice(0, 400)}` : ''}`,
        });
      } catch (error) {
        console.error('Notification write failed:', error instanceof Error ? error.message : 'unknown');
      }
    }


    res.json({
      data: {
        case: serializeCase(updated),
        event: serializeCaseEvent(event.toObject()),
      },
    });
  })
);

casesRouter.post(
  '/:id/events',
  requireRole('OFFICER'),
  writeLimiter,
  validate({ params: caseIdParams, body: eventSchema }),
  asyncHandler(async (req, res) => {
    const payload = req.body as z.infer<typeof eventSchema>;
    const user = req.authUser!;

    const caseDoc = await Case.findById(req.params.id).populate(CASE_POPULATE).lean();
    if (!caseDoc) throw notFound('Case not found');
    await assertViewAccess(caseDoc, user);

    const citizenId = citizenIdOf(caseDoc.citizen);
    const now = new Date();

    if (payload.type === 'HEARING_SCHEDULED') {
      if (caseDoc.status === 'CLOSED') {
        throw badRequest('A closed case cannot receive a new hearing');
      }
      if (caseDoc.status === 'DECISION_RECORDED') {
        throw badRequest('A decision has already been recorded for this case');
      }

      const updated = await Case.findByIdAndUpdate(
        caseDoc._id,
        {
          $set: {
            status: 'HEARING_SCHEDULED',
            nextHearingAt: payload.hearingDate,
            lastEventAt: now,
          },
        },
        { new: true, runValidators: true }
      )
        .populate(CASE_POPULATE)
        .lean();
      if (!updated) throw notFound('Case not found');

      const event = await CaseEvent.create({
        case: caseDoc._id,
        type: 'HEARING_SCHEDULED',
        title: payload.title || 'Hearing scheduled',
        description: payload.description || `Hearing scheduled by ${user.name}.`,
        statusFrom: caseDoc.status,
        statusTo: 'HEARING_SCHEDULED',
        hearingDate: payload.hearingDate,
        source: 'OFFICER_UPDATE',
        author: user.id,
        authorName: user.name,
        authorRole: 'OFFICER',
        createdAt: now,
      });


      if (citizenId) {
        try {
          await notify({
            userId: citizenId,
            caseId: caseDoc._id,
            title: `Hearing scheduled — ${caseDoc.trackingId}`,
            body: `A hearing has been scheduled for ${formatKampala(payload.hearingDate)}.`,
          });
        } catch (error) {
          console.error('Notification write failed:', error instanceof Error ? error.message : 'unknown');
        }
      }


      res.status(201).json({
        data: {
          case: serializeCase(updated),
          event: serializeCaseEvent(event.toObject()),
        },
      });
      return;
    }

    const isMilestone = payload.type === 'MILESTONE';
    const title = isMilestone ? payload.title : payload.title || 'Officer note';

    await Case.findByIdAndUpdate(caseDoc._id, { $set: { lastEventAt: now } });

    const event = await CaseEvent.create({
      case: caseDoc._id,
      type: payload.type,
      title,
      description: payload.description,
      source: 'OFFICER_UPDATE',
      author: user.id,
      authorName: user.name,
      authorRole: 'OFFICER',
      createdAt: now,
    });


    if (citizenId) {
      try {
        await notify({
          userId: citizenId,
          caseId: caseDoc._id,
          title: `${isMilestone ? 'Progress update' : 'Officer note'} — ${caseDoc.trackingId}`,
          body: payload.description || title,
        });
      } catch (error) {
        console.error('Notification write failed:', error instanceof Error ? error.message : 'unknown');
      }
    }


    const refreshed = await Case.findById(caseDoc._id).populate(CASE_POPULATE).lean();
    res.status(201).json({
      data: {
        case: serializeCase(refreshed ?? caseDoc),
        event: serializeCaseEvent(event.toObject()),
      },
    });
  })
);

