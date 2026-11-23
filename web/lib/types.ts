export type Role = 'CITIZEN' | 'OFFICER';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
  isDemo: boolean;
  institution: { id: string; name: string; district: string } | null;
  createdAt: string;
}

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

export type CaseEventType =
  | 'CASE_CREATED'
  | 'STATUS_CHANGE'
  | 'HEARING_SCHEDULED'
  | 'MILESTONE'
  | 'NOTE';

export type EventSource = 'USER_REPORTED' | 'DEMO' | 'OFFICER_UPDATE' | 'SYSTEM';

export interface Institution {
  id: string;
  name: string;
  level: 'LC_I' | 'LC_II' | 'LC_III';
  district: string;
  subcounty: string;
  address: string | null;
  isDemo: boolean;
}

export interface CaseSummary {
  id: string;
  trackingId: string;
  title: string;
  category: CaseCategory;
  description: string;
  reference: string | null;
  status: CaseStatus;
  source: 'USER_REPORTED' | 'DEMO';
  isDemo: boolean;
  institution: {
    id: string;
    name: string;
    level: 'LC_I' | 'LC_II' | 'LC_III';
    district: string;
    subcounty: string;
  };
  citizen: { id: string; name: string };
  assignedOfficer: { id: string; name: string } | null;
  nextHearingAt: string | null;
  lastEventAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CaseEvent {
  id: string;
  caseId: string;
  type: CaseEventType;
  title: string;
  description: string | null;
  statusFrom: CaseStatus | null;
  statusTo: CaseStatus | null;
  hearingDate: string | null;
  source: EventSource;
  author: { id: string; name: string; role: Role } | null;
  authorName: string;
  authorRole: Role | 'SYSTEM';
  createdAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  case: { id: string; trackingId: string; title: string } | null;
  createdAt: string;
}

export interface CaseStats {
  total: number;
  active: number;
  statusCounts: Record<CaseStatus, number>;
  upcomingHearings: CaseSummary[];
  recentCases: CaseSummary[];
  unreadNotifications: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
  unreadCount?: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface AuthResponse {
  data: { token: string; user: User };
}
