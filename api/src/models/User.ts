import { Schema, model, type Types } from 'mongoose';
import type { UserRole } from '../types';

export interface IUser {
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: UserRole;
  isDemo: boolean;
  institution?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
    phone: { type: String, trim: true, maxlength: 32 },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['CITIZEN', 'OFFICER'], default: 'CITIZEN', required: true },
    isDemo: { type: Boolean, default: false },
    institution: { type: Schema.Types.ObjectId, ref: 'Institution', default: null },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1, institution: 1 });

export const User = model<IUser>('User', userSchema);
