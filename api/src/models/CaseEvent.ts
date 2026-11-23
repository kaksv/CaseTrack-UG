import { Schema, model, type Types } from 'mongoose';
import type { CaseEventType, CaseStatus, EventSource } from '../lib/domain';

export interface ICaseEvent {
  case: Types.ObjectId;
  type: CaseEventType;
  title: string;
  description?: string;
  statusFrom?: CaseStatus | null;
  statusTo?: CaseStatus | null;
  hearingDate?: Date | null;
  source: EventSource;
  author?: Types.ObjectId | null;
  authorName: string;
  authorRole: 'CITIZEN' | 'OFFICER' | 'SYSTEM';
  createdAt: Date;
  updatedAt: Date;
}

const caseEventSchema = new Schema<ICaseEvent>(
  {
    case: { type: Schema.Types.ObjectId, ref: 'Case', required: true },
    type: {
      type: String,
      required: true,
      enum: ['CASE_CREATED', 'STATUS_CHANGE', 'HEARING_SCHEDULED', 'MILESTONE', 'NOTE'],
    },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, trim: true, maxlength: 4000 },
    statusFrom: {
      type: String,
      enum: ['REGISTERED', 'UNDER_REVIEW', 'HEARING_SCHEDULED', 'ADJOURNED', 'DECISION_RECORDED', 'CLOSED', null],
      default: null,
    },
    statusTo: {
      type: String,
      enum: ['REGISTERED', 'UNDER_REVIEW', 'HEARING_SCHEDULED', 'ADJOURNED', 'DECISION_RECORDED', 'CLOSED', null],
      default: null,
    },
    hearingDate: { type: Date, default: null },
    source: {
      type: String,
      enum: ['USER_REPORTED', 'DEMO', 'OFFICER_UPDATE', 'SYSTEM'],
      required: true,
    },
    author: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    authorName: { type: String, required: true, trim: true, maxlength: 120 },
    authorRole: { type: String, enum: ['CITIZEN', 'OFFICER', 'SYSTEM'], required: true },
  },
  { timestamps: true }
);

caseEventSchema.index({ case: 1, createdAt: 1 });
caseEventSchema.index({ author: 1, createdAt: -1 });

export const CaseEvent = model<ICaseEvent>('CaseEvent', caseEventSchema);
