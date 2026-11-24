export const CASE_STATUSES = [
  'REGISTERED',
  'UNDER_REVIEW',
  'HEARING_SCHEDULED',
  'ADJOURNED',
  'DECISION_RECORDED',
  'CLOSED',
] as const;

export type CaseStatus = (typeof CASE_STATUSES)[number];

export const CASE_CATEGORIES = [
  'LAND_DISPUTE',
  'FAMILY',
  'DEBT',
  'ASSAULT',
  'PROPERTY',
  'EMPLOYMENT',
  'PUBLIC_NUISANCE',
  'OTHER',
] as const;

export type CaseCategory = (typeof CASE_CATEGORIES)[number];

export const CASE_EVENT_TYPES = [
  'CASE_CREATED',
  'STATUS_CHANGE',
  'HEARING_SCHEDULED',
  'MILESTONE',
  'NOTE',
] as const;

export type CaseEventType = (typeof CASE_EVENT_TYPES)[number];

export const EVENT_SOURCES = ['USER_REPORTED', 'DEMO', 'OFFICER_UPDATE', 'SYSTEM'] as const;
export type EventSource = (typeof EVENT_SOURCES)[number];

export const STATUS_LABELS: Record<CaseStatus, string> = {
  REGISTERED: 'Registered',
  UNDER_REVIEW: 'Under review',
  HEARING_SCHEDULED: 'Hearing scheduled',
  ADJOURNED: 'Adjourned',
  DECISION_RECORDED: 'Decision recorded',
  CLOSED: 'Closed',
};

export const CATEGORY_LABELS: Record<CaseCategory, string> = {
  LAND_DISPUTE: 'Land dispute',
  FAMILY: 'Family matter',
  DEBT: 'Debt / money',
  ASSAULT: 'Assault',
  PROPERTY: 'Property',
  EMPLOYMENT: 'Employment',
  PUBLIC_NUISANCE: 'Public nuisance',
  OTHER: 'Other',
};

/** Allowed officer status transitions. CLOSED is terminal. */
export const ALLOWED_TRANSITIONS: Record<CaseStatus, CaseStatus[]> = {
  REGISTERED: ['UNDER_REVIEW', 'HEARING_SCHEDULED', 'CLOSED'],
  UNDER_REVIEW: ['HEARING_SCHEDULED', 'ADJOURNED', 'DECISION_RECORDED', 'CLOSED'],
  HEARING_SCHEDULED: ['ADJOURNED', 'DECISION_RECORDED', 'CLOSED'],
  ADJOURNED: ['HEARING_SCHEDULED', 'DECISION_RECORDED', 'CLOSED'],
  DECISION_RECORDED: ['CLOSED'],
  CLOSED: [],
};

export const ACTIVE_STATUSES: CaseStatus[] = [
  'REGISTERED',
  'UNDER_REVIEW',
  'HEARING_SCHEDULED',
  'ADJOURNED',
  'DECISION_RECORDED',
];


/* =========================================
   HYBRID CASE REGISTRATION
========================================= */

export const CASE_REQUEST_STATUSES = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'NEEDS_INFORMATION',
  'READY_FOR_REGISTRATION',
  'REFERRED',
  'DECLINED',
  'REGISTERED',
  'WITHDRAWN',
] as const;

export type CaseRequestStatus =
  (typeof CASE_REQUEST_STATUSES)[number];

export const REQUEST_STATUS_LABELS: Record<
  CaseRequestStatus,
  string
> = {
  SUBMITTED: 'Awaiting court review',
  UNDER_REVIEW: 'Under review',
  NEEDS_INFORMATION: 'Additional information required',
  READY_FOR_REGISTRATION: 'Ready for registration',
  REFERRED: 'Referred',
  DECLINED: 'Request declined',
  REGISTERED: 'Registered by court',
  WITHDRAWN: 'Withdrawn',
};

export const REQUEST_ALLOWED_TRANSITIONS: Record<
  CaseRequestStatus,
  CaseRequestStatus[]
> = {
  SUBMITTED: [
    'UNDER_REVIEW',
    'WITHDRAWN',
  ],

  UNDER_REVIEW: [
    'NEEDS_INFORMATION',
    'READY_FOR_REGISTRATION',
    'REFERRED',
    'DECLINED',
    'WITHDRAWN',
  ],

  NEEDS_INFORMATION: [
    'SUBMITTED',
    'WITHDRAWN',
  ],

  READY_FOR_REGISTRATION: [
    'REGISTERED',
    'UNDER_REVIEW',
    'WITHDRAWN',
  ],

  REFERRED: [],
  DECLINED: [],
  REGISTERED: [],
  WITHDRAWN: [],
};

export const REGISTRATION_SOURCES = [
  'ONLINE_REQUEST',
  'WALK_IN',
  'EXISTING_CASE',
  'LEGACY',
] as const;

export type RegistrationSource =
  (typeof REGISTRATION_SOURCES)[number];

export const VERIFICATION_STATUSES = [
  'UNVERIFIED',
  'COURT_VERIFIED',
] as const;

export type VerificationStatus =
  (typeof VERIFICATION_STATUSES)[number];

