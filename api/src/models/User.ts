
import { Schema, model, type Types } from 'mongoose';

import {
  USER_ROLES,
  ACCOUNT_STATUSES,
  type UserRole,
  type AccountStatus,
} from '../types';

export interface IUser {
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;

  role: UserRole;
  accountStatus: AccountStatus;

  isDemo: boolean;
  institution?: Types.ObjectId | null;

  createdBy?: Types.ObjectId | null;
  activatedAt?: Date | null;
  suspendedAt?: Date | null;
  suspendedBy?: Types.ObjectId | null;

  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },

    phone: {
      type: String,
      trim: true,
      maxlength: 32,
    },

    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: USER_ROLES,
      default: 'CITIZEN',
      required: true,
    },

    accountStatus: {
      type: String,
      enum: ACCOUNT_STATUSES,
      default: 'ACTIVE',
      required: true,
    },

    isDemo: {
      type: Boolean,
      default: false,
    },

    institution: {
      type: Schema.Types.ObjectId,
      ref: 'Institution',
      default: null,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    activatedAt: {
      type: Date,
      default: null,
    },

    suspendedAt: {
      type: Date,
      default: null,
    },

    suspendedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre('validate', function () {
  if (
    this.role === 'COURT_ADMIN' &&
    !this.institution
  ) {
    this.invalidate(
      'institution',
      'Court administrators must belong to an institution',
    );
  }

  if (
    this.role === 'SYSTEM_ADMIN' &&
    this.institution
  ) {
    this.invalidate(
      'institution',
      'System administrators cannot belong to a single institution',
    );
  }
});

userSchema.index(
  { email: 1 },
  { unique: true },
);

userSchema.index({
  role: 1,
  institution: 1,
});

userSchema.index({
  institution: 1,
  role: 1,
  accountStatus: 1,
});

export const User = model<IUser>(
  'User',
  userSchema,
);
