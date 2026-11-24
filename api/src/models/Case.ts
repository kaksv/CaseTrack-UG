
import { Schema, model, type Types } from 'mongoose';

import {
  CASE_CATEGORIES,
  CASE_STATUSES,
  REGISTRATION_SOURCES,
  VERIFICATION_STATUSES,
  type CaseCategory,
  type CaseStatus,
  type RegistrationSource,
  type VerificationStatus,
} from '../lib/domain';

export interface ICase {
  trackingId: string;

  title: string;
  category: CaseCategory;
  description: string;

  // Legacy reference retained for compatibility
  reference?: string;

  // Formal court registration reference
  officialReference?: string;

  institution: Types.ObjectId;

  // Account is optional for walk-in citizens
  citizen?: Types.ObjectId | null;

  // Citizen details for officer-assisted registration
  citizenName?: string;
  citizenPhone?: string;

  status: CaseStatus;

  // Existing source field retained
  source: 'USER_REPORTED' | 'DEMO' | 'OFFICER_REGISTERED';

  registrationSource: RegistrationSource;
  verificationStatus: VerificationStatus;

  // Link to the original online request
  request?: Types.ObjectId | null;

  // Registration accountability
  registeredBy?: Types.ObjectId | null;
  registeredAt?: Date | null;

  isDemo: boolean;

  assignedOfficer?: Types.ObjectId | null;
  nextHearingAt?: Date | null;

  lastEventAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const caseSchema = new Schema<ICase>(
  {
    trackingId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 20,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },

    category: {
      type: String,
      required: true,
      enum: CASE_CATEGORIES,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 4000,
    },

    reference: {
      type: String,
      trim: true,
      maxlength: 80,
    },

    officialReference: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: 120,
    },

    institution: {
      type: Schema.Types.ObjectId,
      ref: 'Institution',
      required: true,
    },

    citizen: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    citizenName: {
      type: String,
      trim: true,
      maxlength: 120,
    },

    citizenPhone: {
      type: String,
      trim: true,
      maxlength: 32,
      select: false,
    },

    status: {
      type: String,
      required: true,
      enum: CASE_STATUSES,
      default: 'REGISTERED',
    },

    source: {
      type: String,
      enum: [
        'USER_REPORTED',
        'DEMO',
        'OFFICER_REGISTERED',
      ],
      default: 'USER_REPORTED',
      required: true,
    },

    registrationSource: {
      type: String,
      enum: REGISTRATION_SOURCES,
      default: 'LEGACY',
      required: true,
    },

    verificationStatus: {
      type: String,
      enum: VERIFICATION_STATUSES,
      default: 'UNVERIFIED',
      required: true,
    },

    request: {
      type: Schema.Types.ObjectId,
      ref: 'CaseRequest',
      default: null,
    },

    registeredBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    registeredAt: {
      type: Date,
      default: null,
    },

    isDemo: {
      type: Boolean,
      default: false,
    },

    assignedOfficer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    nextHearingAt: {
      type: Date,
      default: null,
    },

    lastEventAt: {
      type: Date,
      default: () => new Date(),
      required: true,
    },
  },

  {
    timestamps: true,
  }
);

/* Registration validation */

caseSchema.pre('validate', function () {
  if (!this.citizen && !this.citizenName) {
    this.invalidate(
      'citizenName',
      'A citizen account or citizen name is required'
    );
  }

  if (this.verificationStatus === 'COURT_VERIFIED') {
    if (!this.officialReference) {
      this.invalidate(
        'officialReference',
        'An official court reference is required'
      );
    }

    if (!this.registeredBy) {
      this.invalidate(
        'registeredBy',
        'The registering officer is required'
      );
    }

    if (!this.registeredAt) {
      this.invalidate(
        'registeredAt',
        'The registration date is required'
      );
    }

    if (this.registrationSource === 'LEGACY') {
      this.invalidate(
        'registrationSource',
        'Verified registration requires a valid registration source'
      );
    }
  }

  if (this.registrationSource === 'ONLINE_REQUEST') {
    if (!this.request) {
      this.invalidate(
        'request',
        'The original case request is required'
      );
    }

    if (!this.citizen) {
      this.invalidate(
        'citizen',
        'Online registration requires a citizen account'
      );
    }
  }
});

/* Existing indexes */

caseSchema.index(
  { trackingId: 1 },
  { unique: true }
);

caseSchema.index({
  citizen: 1,
  createdAt: -1,
});

caseSchema.index({
  assignedOfficer: 1,
  status: 1,
});

caseSchema.index({
  institution: 1,
  createdAt: -1,
});

caseSchema.index({
  status: 1,
  nextHearingAt: 1,
});

caseSchema.index({
  title: 'text',
  reference: 'text',
});

/* Prevent duplicate registration of an online request */

caseSchema.index(
  { request: 1 },
  {
    unique: true,
    partialFilterExpression: {
      request: { $type: 'objectId' },
    },
  }
);

/* Official reference uniqueness within a court */

caseSchema.index(
  {
    institution: 1,
    officialReference: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      officialReference: { $type: 'string' },
    },
  }
);

/* Institution verification queue */

caseSchema.index({
  institution: 1,
  verificationStatus: 1,
  createdAt: -1,
});

export const Case = model<ICase>(
  'Case',
  caseSchema
);
