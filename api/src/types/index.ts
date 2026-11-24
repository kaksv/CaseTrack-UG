import type { Types } from 'mongoose';

export type UserRole = 'CITIZEN' | 'OFFICER';


export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  institutionId: string | null;
  isDemo: boolean;
}


declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      authUser?: AuthUser;
    }
  }
}

export type ObjectIdLike = Types.ObjectId | string;

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}
