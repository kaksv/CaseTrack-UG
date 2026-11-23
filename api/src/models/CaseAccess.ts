import { Schema, model, type Types } from 'mongoose';

/**
 * Explicit assignment of an officer to a case. Every officer read/write path
 * checks this collection — an officer can never reach a case without a record.
 */
export interface ICaseAccess {
  case: Types.ObjectId;
  user: Types.ObjectId;
  grantedBy?: Types.ObjectId | null;
  reason: 'SEED' | 'DUTY_OFFICER' | 'MANUAL';
  createdAt: Date;
  updatedAt: Date;
}

const caseAccessSchema = new Schema<ICaseAccess>(
  {
    case: { type: Schema.Types.ObjectId, ref: 'Case', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    grantedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    reason: { type: String, enum: ['SEED', 'DUTY_OFFICER', 'MANUAL'], default: 'DUTY_OFFICER' },
  },
  { timestamps: true }
);

caseAccessSchema.index({ case: 1, user: 1 }, { unique: true });
caseAccessSchema.index({ user: 1, createdAt: -1 });

export const CaseAccess = model<ICaseAccess>('CaseAccess', caseAccessSchema);
