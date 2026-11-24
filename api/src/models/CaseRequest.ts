
import { Schema, model, type Types } from 'mongoose';

import {
    CASE_CATEGORIES,
    CASE_REQUEST_STATUSES,
    type CaseCategory,
    type CaseRequestStatus,
} from '../lib/domain';

export interface ICaseRequest {
    requestId: string;

    title: string;
    category: CaseCategory;
    description: string;
    disputeLocation: string;

    institution: Types.ObjectId;
    citizen: Types.ObjectId;

    status: CaseRequestStatus;

    citizenReference?: string;

    reviewedBy?: Types.ObjectId | null;
    reviewedAt?: Date | null;
    reviewNote?: string;

    additionalInformation?: string;

    referredInstitution?: Types.ObjectId | null;

    registeredCase?: Types.ObjectId | null;
    registeredAt?: Date | null;

    isDemo: boolean;

    createdAt: Date;
    updatedAt: Date;
}

const caseRequestSchema = new Schema<ICaseRequest>(
    {
        requestId: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
            maxlength: 30,
            immutable: true,
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

        disputeLocation: {
            type: String,
            required: true,
            trim: true,
            maxlength: 240,
        },

        institution: {
            type: Schema.Types.ObjectId,
            ref: 'Institution',
            required: true,
        },

        citizen: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            immutable: true,
        },

        status: {
            type: String,
            required: true,
            enum: CASE_REQUEST_STATUSES,
            default: 'SUBMITTED',
        },

        citizenReference: {
            type: String,
            trim: true,
            maxlength: 80,
        },

        reviewedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },

        reviewedAt: {
            type: Date,
            default: null,
        },

        reviewNote: {
            type: String,
            trim: true,
            maxlength: 2000,
        },

        additionalInformation: {
            type: String,
            trim: true,
            maxlength: 4000,
        },

        referredInstitution: {
            type: Schema.Types.ObjectId,
            ref: 'Institution',
            default: null,
        },

        registeredCase: {
            type: Schema.Types.ObjectId,
            ref: 'Case',
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
    },

    {
        timestamps: true,
    }
);

/* Unique public request identifier */

caseRequestSchema.index(
    { requestId: 1 },
    { unique: true }
);

/* Citizen request history */

caseRequestSchema.index({
    citizen: 1,
    createdAt: -1,
});

/* Institution review queue */

caseRequestSchema.index({
    institution: 1,
    status: 1,
    createdAt: -1,
});

/* Officer review history */

caseRequestSchema.index({
    reviewedBy: 1,
    reviewedAt: -1,
});

/* Prevent multiple requests linking to the same case */

caseRequestSchema.index(
    { registeredCase: 1 },
    {
        unique: true,
        partialFilterExpression: {
            registeredCase: { $type: 'objectId' },
        },
    }
);

export const CaseRequest = model<ICaseRequest>(
    'CaseRequest',
    caseRequestSchema
);
