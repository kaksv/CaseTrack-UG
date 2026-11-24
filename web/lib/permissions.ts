
import type { Role } from './types';

export const ROLE_LABELS: Record<Role, string> = {
    CITIZEN: 'Citizen',
    OFFICER: 'Court officer',
    COURT_ADMIN: 'Court administrator',
    SYSTEM_ADMIN: 'System administrator',
};

export const ROLE_WORKSPACES: Record<Role, string> = {
    CITIZEN: 'Citizen workspace',
    OFFICER: 'Officer workspace',
    COURT_ADMIN: 'Court administration',
    SYSTEM_ADMIN: 'System administration',
};

export const ROLE_DASHBOARDS: Record<Role, string> = {
    CITIZEN: '/dashboard',
    OFFICER: '/dashboard',
    COURT_ADMIN: '/court-admin',
    SYSTEM_ADMIN: '/admin',
};

export function isAdministrator(role: Role): boolean {
    return (
        role === 'COURT_ADMIN' ||
        role === 'SYSTEM_ADMIN'
    );
}

export function canSubmitCase(role: Role): boolean {
    return role === 'CITIZEN';
}

export function canUpdateAssignedCases(
    role: Role,
): boolean {
    return role === 'OFFICER';
}

export function canManageOfficers(
    role: Role,
): boolean {
    return role === 'COURT_ADMIN';
}

export function canAssignCases(
    role: Role,
): boolean {
    return role === 'COURT_ADMIN';
}

export function canManageInstitutions(
    role: Role,
): boolean {
    return role === 'SYSTEM_ADMIN';
}

export function canAppointCourtAdmins(
    role: Role,
): boolean {
    return role === 'SYSTEM_ADMIN';
}


export function canAccessRoute(
    role: Role,
    pathname: string,
): boolean {
    const path = pathname.replace(/\/+$/, '') || '/';

    const matches = (prefix: string) =>
        path === prefix ||
        path.startsWith(`${prefix}/`);

    // Shared authenticated pages.
    if (
        matches('/profile') ||
        matches('/notifications')
    ) {
        return true;
    }

    // System administration.
    if (matches('/admin')) {
        return role === 'SYSTEM_ADMIN';
    }

    // Court administration.
    if (matches('/court-admin')) {
        return role === 'COURT_ADMIN';
    }

    // Citizen case submission.
    if (matches('/cases/new')) {
        return role === 'CITIZEN';
    }

    // Existing citizen and officer workspaces.
    if (
        matches('/dashboard') ||
        matches('/cases')
    ) {
        return (
            role === 'CITIZEN' ||
            role === 'OFFICER'
        );
    }

    // Deny unrecognized protected routes.
    return false;
}


export function resolvePostLoginPath(
    role: Role,
    requestedPath?: string | null,
): string {
    const fallback = ROLE_DASHBOARDS[role] ?? '/';

    if (!requestedPath) {
        return fallback;
    }

    if (
        !requestedPath.startsWith('/') ||
        requestedPath.startsWith('//') ||
        requestedPath.includes('\\') ||
        /[\u0000-\u001F\u007F]/.test(requestedPath)
    ) {
        return fallback;
    }

    try {
        const base = 'https://casetrack.invalid';
        const url = new URL(requestedPath, base);

        if (url.origin !== base) {
            return fallback;
        }

        if (!canAccessRoute(role, url.pathname)) {
            return fallback;
        }

        return `${url.pathname}${url.search}${url.hash}`;
    } catch {
        return fallback;
    }
}

