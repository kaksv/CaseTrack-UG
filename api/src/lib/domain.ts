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
