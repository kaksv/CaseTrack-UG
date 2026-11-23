import { Schema, model, type Types } from 'mongoose';
import type { CaseCategory, CaseStatus } from '../lib/domain';

export interface ICase {
  trackingId: string;
  title: string;
  category: CaseCategory;
  description: string;
  reference?: string;
  institution: Types.ObjectId;
  citizen: Types.ObjectId;
  status: CaseStatus;
  source: 'USER_REPORTED' | 'DEMO';
  isDemo: boolean;
  assignedOfficer?: Types.ObjectId | null;
  nextHearingAt?: Date | null;
  lastEventAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const caseSchema = new Schema<ICase>(
  {
    trackingId: { type: String, required: true, trim: true, uppercase: true, maxlength: 20 },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    category: {
      type: String,
      required: true,
      enum: [
        'LAND_DISPUTE',
        'FAMILY',
        'DEBT',
        'ASSAULT',
        'PROPERTY',
        'EMPLOYMENT',
        'PUBLIC_NUISANCE',
        'OTHER',
      ],
    },
    description: { type: String, required: true, trim: true, maxlength: 4000 },
    reference: { type: String, trim: true, maxlength: 80 },
    institution: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
    citizen: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      required: true,
      enum: ['REGISTERED', 'UNDER_REVIEW', 'HEARING_SCHEDULED', 'ADJOURNED', 'DECISION_RECORDED', 'CLOSED'],
      default: 'REGISTERED',
    },
    source: { type: String, enum: ['USER_REPORTED', 'DEMO'], default: 'USER_REPORTED', required: true },
    isDemo: { type: Boolean, default: false },
    assignedOfficer: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    nextHearingAt: { type: Date, default: null },
    lastEventAt: { type: Date, default: () => new Date(), required: true },
  },
  { timestamps: true }
);

caseSchema.index({ trackingId: 1 }, { unique: true });
caseSchema.index({ citizen: 1, createdAt: -1 });
caseSchema.index({ assignedOfficer: 1, status: 1 });
caseSchema.index({ institution: 1, createdAt: -1 });
caseSchema.index({ status: 1, nextHearingAt: 1 });
caseSchema.index({ title: 'text', reference: 'text' });

export const Case = model<ICase>('Case', caseSchema);
