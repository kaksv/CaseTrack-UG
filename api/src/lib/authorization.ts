
import { Types } from 'mongoose';
import { forbidden } from './errors';
import { Institution } from '../models/Institution';
import type { AuthUser } from '../types';

/**
 * Require an officer with an active institution membership.
 */
export async function requireOfficerInstitution(
    user: AuthUser
): Promise<string> {
    if (user.role !== 'OFFICER') {
        throw forbidden(
            'This action is restricted to court officers'
        );
    }

    if (
        !user.institutionId ||
        !Types.ObjectId.isValid(user.institutionId)
    ) {
        throw forbidden(
            'Your account is not assigned to a court'
        );
    }

    const institution = await Institution.findOne({
        _id: user.institutionId,
        active: true,
    })
        .select('_id isDemo')
        .lean();

    if (!institution) {
        throw forbidden(
            'Your assigned court is not available'
        );
    }

    if (user.isDemo !== institution.isDemo) {
        throw forbidden(
            'Your account cannot operate in this institution'
        );
    }

    return String(institution._id);
}

/**
 * Ensure an officer belongs to the target institution.
 */
export async function assertInstitutionAccess(
    user: AuthUser,
    institutionId: string | Types.ObjectId
): Promise<void> {
    const officerInstitutionId =
        await requireOfficerInstitution(user);

    if (
        officerInstitutionId !== String(institutionId)
    ) {
        throw forbidden(
            'You cannot access records belonging to another court'
        );
    }
}


/**
 * Require a system administrator.
 */
export function requireSystemAdmin(
    user: AuthUser,
): void {
    if (user.role !== 'SYSTEM_ADMIN') {
        throw forbidden(
            'This action is restricted to system administrators',
        );
    }
}

/**
 * Require a court administrator with
 * an active institution membership.
 */
export async function requireCourtAdminInstitution(
    user: AuthUser,
): Promise<string> {
    if (user.role !== 'COURT_ADMIN') {
        throw forbidden(
            'This action is restricted to court administrators',
        );
    }

    if (
        !user.institutionId ||
        !Types.ObjectId.isValid(user.institutionId)
    ) {
        throw forbidden(
            'Your account is not assigned to a court',
        );
    }

    const institution = await Institution.findOne({
        _id: user.institutionId,
        active: true,
    })
        .select('_id isDemo')
        .lean();

    if (!institution) {
        throw forbidden(
            'Your assigned court is not available',
        );
    }

    if (user.isDemo !== institution.isDemo) {
        throw forbidden(
            'Your account cannot operate in this institution',
        );
    }

    return String(institution._id);
}

/**
 * Ensure a court administrator can only
 * manage their own institution.
 */
export async function assertCourtAdminAccess(
    user: AuthUser,
    institutionId: string | Types.ObjectId,
): Promise<void> {
    const adminInstitutionId =
        await requireCourtAdminInstitution(user);

    if (
        adminInstitutionId !== String(institutionId)
    ) {
        throw forbidden(
            'You cannot manage another court',
        );
    }
}
