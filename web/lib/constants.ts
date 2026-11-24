import type { CaseCategory, CaseEventType, CaseStatus, EventSource } from './types';

export const STATUS_META: Record<
  CaseStatus,
  { label: string; short: string; description: string; badge: string; dot: string }
> = {
  REGISTERED: {
    label: 'Registered',
    short: 'Registered',
    description: 'The case has been received by the LC court.',
    badge: 'bg-ink-100 text-ink-700 ring-ink-200',
    dot: 'bg-ink-500',
  },
  UNDER_REVIEW: {
    label: 'Under review',
    short: 'Review',
    description: 'The assigned officer is reviewing the case file.',
    badge: 'bg-sky-50 text-sky-700 ring-sky-200',
    dot: 'bg-sky-500',
  },
  HEARING_SCHEDULED: {
    label: 'Hearing scheduled',
    short: 'Hearing',
    description: 'A hearing date has been set. Check the details below.',
    badge: 'bg-gold-50 text-gold-800 ring-gold-300',
    dot: 'bg-gold-500',
  },
  ADJOURNED: {
    label: 'Adjourned',
    short: 'Adjourned',
    description: 'The hearing was postponed. A new date may be set.',
    badge: 'bg-orange-50 text-orange-700 ring-orange-200',
    dot: 'bg-orange-500',
  },
  DECISION_RECORDED: {
    label: 'Decision recorded',
    short: 'Decision',
    description: 'A decision has been recorded on the case file.',
    badge: 'bg-violet-50 text-violet-700 ring-violet-200',
    dot: 'bg-violet-500',
  },
  CLOSED: {
    label: 'Closed',
    short: 'Closed',
    description: 'The case has been closed.',
    badge: 'bg-ink-100 text-ink-500 ring-ink-200',
    dot: 'bg-ink-400',
  },
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

export const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS) as Array<[CaseCategory, string]>;

export const LEVEL_LABELS: Record<'LC_I' | 'LC_II' | 'LC_III', string> = {
  LC_I: 'LC I',
  LC_II: 'LC II',
  LC_III: 'LC III',
};

export const EVENT_LABELS: Record<CaseEventType, string> = {
  CASE_CREATED: 'Case registered',
  STATUS_CHANGE: 'Status update',
  HEARING_SCHEDULED: 'Hearing',
  MILESTONE: 'Milestone',
  NOTE: 'Officer note',
};

export const SOURCE_LABELS: Record<EventSource, string> = {
  USER_REPORTED: 'Reported by citizen',
  DEMO: 'Demo record',
  OFFICER_UPDATE: 'Court officer',
  SYSTEM: 'System',
};

export { ROLE_LABELS } from './permissions';

/**
 * Status options shown to officers in the status form. HEARING_SCHEDULED is
 * intentionally omitted — it is only set through the schedule-hearing form.
 */
export const OFFICER_STATUS_OPTIONS: Record<CaseStatus, CaseStatus[]> = {
  REGISTERED: ['UNDER_REVIEW', 'CLOSED'],
  UNDER_REVIEW: ['ADJOURNED', 'DECISION_RECORDED', 'CLOSED'],
  HEARING_SCHEDULED: ['ADJOURNED', 'DECISION_RECORDED', 'CLOSED'],
  ADJOURNED: ['DECISION_RECORDED', 'CLOSED'],
  DECISION_RECORDED: ['CLOSED'],
  CLOSED: [],
};
