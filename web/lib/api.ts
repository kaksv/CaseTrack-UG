import type {
  AppNotification,
  AuthResponse,
  CaseCategory,
  CaseEvent,
  CaseStats,
  CaseStatus,
  CaseSummary,
  Institution,
  Paginated,
  User,
} from './types';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/+$/, '');

let authToken: string | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

export class ApiError extends Error {
  readonly status: number;
  readonly details?: Array<{ field: string; message: string }>;

  constructor(
    message: string,
    status: number,
    details?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

function buildQuery(params: Record<string, string | number | boolean | undefined | null>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}

async function request<T>(
  path: string,
  options: RequestInit & { skipAuth?: boolean } = {}
): Promise<T> {
  const { skipAuth, headers, ...rest } = options;
  const finalHeaders = new Headers(headers);
  if (!skipAuth && authToken) {
    finalHeaders.set('Authorization', `Bearer ${authToken}`);
  }
  if (rest.body && !finalHeaders.has('Content-Type')) {
    finalHeaders.set('Content-Type', 'application/json');
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...rest,
      headers: finalHeaders,
      cache: 'no-store',
    });
  } catch {
    throw new ApiError(
      'Cannot reach the CaseTrack API. Check your connection and try again.',
      0
    );
  }

  const payload = (await response.json().catch(() => null)) as
    | { data?: T; error?: { message?: string; details?: Array<{ field: string; message: string }> } }
    | null;

  if (!response.ok) {
    throw new ApiError(
      payload?.error?.message ?? 'Something went wrong. Please try again.',
      response.status,
      payload?.error?.details
    );
  }

  return payload as T;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface CreateCaseInput {
  title: string;
  category: CaseCategory;
  institutionId: string;
  description: string;
  reference?: string;
}

export interface CaseListParams {
  q?: string;
  status?: CaseStatus | '';
  page?: number;
  limit?: number;
}

export const api = {
  login(email: string, password: string): Promise<AuthResponse> {
    return request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    });
  },

  register(input: RegisterInput): Promise<AuthResponse> {
    return request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
      skipAuth: true,
    });
  },

  me(): Promise<{ data: User }> {
    return request<{ data: User }>('/api/auth/me');
  },

  updateProfile(input: { name: string; phone?: string }): Promise<{ data: User }> {
    return request<{ data: User }>('/api/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },

  institutions(): Promise<{ data: Institution[] }> {
    return request<{ data: Institution[] }>('/api/institutions');
  },

  stats(): Promise<{ data: CaseStats }> {
    return request<{ data: CaseStats }>('/api/cases/stats');
  },

  cases(params: CaseListParams = {}): Promise<Paginated<CaseSummary>> {
    return request<Paginated<CaseSummary>>(`/api/cases${buildQuery({ ...params })}`);
  },

  case(id: string): Promise<{ data: CaseSummary }> {
    return request<{ data: CaseSummary }>(`/api/cases/${id}`);
  },

  events(id: string): Promise<{ data: CaseEvent[]; meta: { total: number } }> {
    return request<{ data: CaseEvent[]; meta: { total: number } }>(`/api/cases/${id}/events`);
  },

  createCase(input: CreateCaseInput): Promise<{ data: CaseSummary }> {
    return request<{ data: CaseSummary }>('/api/cases', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  updateStatus(
    id: string,
    input: { status: CaseStatus; note?: string }
  ): Promise<{ data: { case: CaseSummary; event: CaseEvent } }> {
    return request<{ data: { case: CaseSummary; event: CaseEvent } }>(`/api/cases/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },

  addEvent(
    id: string,
    input:
      | { type: 'HEARING_SCHEDULED'; title?: string; description?: string; hearingDate: string }
      | { type: 'MILESTONE'; title: string; description?: string }
      | { type: 'NOTE'; title?: string; description: string }
  ): Promise<{ data: { case: CaseSummary; event: CaseEvent } }> {
    return request<{ data: { case: CaseSummary; event: CaseEvent } }>(`/api/cases/${id}/events`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  notifications(
    params: { page?: number; limit?: number; unread?: boolean } = {}
  ): Promise<Paginated<AppNotification>> {
    return request<Paginated<AppNotification>>(
      `/api/notifications${buildQuery({
        page: params.page,
        limit: params.limit,
        unread: params.unread === undefined ? undefined : String(params.unread),
      })}`
    );
  },

  markNotificationRead(id: string): Promise<{ data: AppNotification }> {
    return request<{ data: AppNotification }>(`/api/notifications/${id}/read`, {
      method: 'PATCH',
    });
  },

  markAllNotificationsRead(): Promise<{ data: { updated: number } }> {
    return request<{ data: { updated: number } }>('/api/notifications/read-all', {
      method: 'PATCH',
    });
  },
};

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}
