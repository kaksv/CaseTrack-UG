import { Schema, model, type Types } from 'mongoose';

export const INSTITUTION_LEVELS = ['LC_I', 'LC_II', 'LC_III'] as const;
export type InstitutionLevel = (typeof INSTITUTION_LEVELS)[number];

export interface IInstitution {
  name: string;
  level: InstitutionLevel;
  district: string;
  subcounty: string;
  address?: string;
  dutyOfficer?: Types.ObjectId | null;
  active: boolean;
  isDemo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const institutionSchema = new Schema<IInstitution>(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    level: { type: String, enum: INSTITUTION_LEVELS, required: true },
    district: { type: String, required: true, trim: true, maxlength: 80 },
    subcounty: { type: String, required: true, trim: true, maxlength: 120 },
    address: { type: String, trim: true, maxlength: 240 },
    dutyOfficer: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    active: { type: Boolean, default: true },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

institutionSchema.index({ active: 1, district: 1, name: 1 });
institutionSchema.index({ name: 1, district: 1 }, { unique: true });

export const Institution = model<IInstitution>('Institution', institutionSchema);
