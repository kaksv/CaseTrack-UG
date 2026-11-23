function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
}

function idOf(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (value instanceof Object && '_id' in value) {
    return String((value as { _id: unknown })._id);
  }
  return String(value);
}

function nameOf(value: unknown): string | null {
  const record = asRecord(value);
  return record && typeof record.name === 'string' ? record.name : null;
}

export function serializeUser(user: any): Record<string, unknown> {
  const institution = asRecord(user.institution);
  return {
    id: idOf(user._id),
    name: user.name,
    email: user.email,
    phone: user.phone ?? null,
    role: user.role,
    isDemo: user.isDemo ?? false,
    institution: institution
      ? { id: idOf(institution._id), name: institution.name, district: institution.district }
      : null,
    createdAt: user.createdAt,
  };
}

export function serializeInstitution(institution: any): Record<string, unknown> {
  return {
    id: idOf(institution._id),
    name: institution.name,
    level: institution.level,
    district: institution.district,
    subcounty: institution.subcounty,
    address: institution.address ?? null,
    isDemo: institution.isDemo ?? false,
  };
}

export function serializeCase(doc: any): Record<string, unknown> {
  const institution = asRecord(doc.institution);
  const citizen = asRecord(doc.citizen);
  const officer = asRecord(doc.assignedOfficer);

  return {
    id: idOf(doc._id),
    trackingId: doc.trackingId,
    title: doc.title,
    category: doc.category,
    description: doc.description,
    reference: doc.reference ?? null,
    status: doc.status,
    source: doc.source,
    isDemo: doc.isDemo ?? false,
    institution: institution
      ? {
          id: idOf(institution._id),
          name: institution.name,
          level: institution.level,
          district: institution.district,
          subcounty: institution.subcounty,
        }
      : { id: idOf(institution) ?? '' },
    citizen: citizen
      ? { id: idOf(citizen._id), name: citizen.name }
      : { id: idOf(doc.citizen) ?? '' },
    assignedOfficer:
      officer && officer.name
        ? { id: idOf(officer._id), name: officer.name }
        : null,
    nextHearingAt: doc.nextHearingAt ?? null,
    lastEventAt: doc.lastEventAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export function serializeCaseEvent(doc: any): Record<string, unknown> {
  return {
    id: idOf(doc._id),
    caseId: idOf(doc.case),
    type: doc.type,
    title: doc.title,
    description: doc.description ?? null,
    statusFrom: doc.statusFrom ?? null,
    statusTo: doc.statusTo ?? null,
    hearingDate: doc.hearingDate ?? null,
    source: doc.source,
    author: doc.author ? { id: idOf(doc.author), name: doc.authorName, role: doc.authorRole } : null,
    authorName: doc.authorName,
    authorRole: doc.authorRole,
    createdAt: doc.createdAt,
  };
}

export function serializeNotification(doc: any): Record<string, unknown> {
  const relatedCase = asRecord(doc.case);
  return {
    id: idOf(doc._id),
    title: doc.title,
    body: doc.body,
    read: doc.read,
    case: relatedCase
      ? { id: idOf(relatedCase._id), trackingId: relatedCase.trackingId, title: relatedCase.title }
      : null,
    createdAt: doc.createdAt,
  };
}

