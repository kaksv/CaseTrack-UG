import bcrypt from 'bcryptjs';
import { env } from './config';
import { connectDatabase, disconnectDatabase } from './db';
import { User } from './models/User';
import { Institution } from './models/Institution';
import { Case } from './models/Case';
import { CaseEvent } from './models/CaseEvent';
import { CaseAccess } from './models/CaseAccess';
import { Notification } from './models/Notification';
import type { CaseCategory, CaseEventType, CaseStatus } from './lib/domain';

/**
 * Destructive demo seed. Clears CaseTrack collections and inserts synthetic
 * Ugandan demo data. Never run against a database that holds real records.
 */
async function seed(): Promise<void> {
  if (env.NODE_ENV === 'production' && process.env.SEED_FORCE !== 'true') {
    console.error(
      'Refusing to reset a production database. Set SEED_FORCE=true only if you are sure this is the demo database.'
    );
    process.exit(1);
  }

  await connectDatabase(env.MONGODB_URI);

  console.log('Clearing existing CaseTrack collections…');
  await Promise.all([
    User.deleteMany({}),
    Institution.deleteMany({}),
    Case.deleteMany({}),
    CaseEvent.deleteMany({}),
    CaseAccess.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  const officerPassword = 'DemoOfficer2026!';
  const citizenPassword = 'DemoCitizen2026!';

  const officer = await User.create({
    name: 'Ssemakula Daniel',
    email: 'officer.demo@casetrack.ug',
    phone: '+256 700 000 101',
    passwordHash: await bcrypt.hash(officerPassword, 12),
    role: 'OFFICER',
    isDemo: true,
  });

  const citizen = await User.create({
    name: 'Namusoke Aisha',
    email: 'citizen.demo@casetrack.ug',
    phone: '+256 700 000 202',
    passwordHash: await bcrypt.hash(citizenPassword, 12),
    role: 'CITIZEN',
    isDemo: true,
  });

  const institutions = await Institution.insertMany([
    {
      name: 'Kawempe LC II Court',
      level: 'LC_II',
      district: 'Kampala',
      subcounty: 'Kawempe',
      address: 'Bombo Road, Kawempe',
      dutyOfficer: officer._id,
      isDemo: true,
    },
    {
      name: 'Nakawa LC III Court',
      level: 'LC_III',
      district: 'Kampala',
      subcounty: 'Nakawa',
      address: 'Nakawa Division Offices',
      dutyOfficer: officer._id,
      isDemo: true,
    },
    {
      name: 'Makindye LC II Court',
      level: 'LC_II',
      district: 'Kampala',
      subcounty: 'Makindye',
      address: 'Makindye Division Offices',
      dutyOfficer: officer._id,
      isDemo: true,
    },
    {
      name: 'Mukono LC III Court',
      level: 'LC_III',
      district: 'Mukono',
      subcounty: 'Mukono Central',
      address: 'Mukono Municipal Offices',
      dutyOfficer: officer._id,
      isDemo: true,
    },
    {
      name: 'Nansana LC II Court',
      level: 'LC_II',
      district: 'Wakiso',
      subcounty: 'Nansana',
      address: 'Nansana Municipal Offices',
      dutyOfficer: officer._id,
      isDemo: true,
    },
    {
      name: 'Kireka LC II Court',
      level: 'LC_II',
      district: 'Wakiso',
      subcounty: 'Kira',
      address: 'Kireka Trading Centre',
      dutyOfficer: officer._id,
      isDemo: true,
    },
    {
      name: 'Entebbe LC III Court',
      level: 'LC_III',
      district: 'Wakiso',
      subcounty: 'Entebbe',
      address: 'Entebbe Municipal Offices',
      dutyOfficer: officer._id,
      isDemo: true,
    },
    {
      name: 'Wakiso LC II Court',
      level: 'LC_II',
      district: 'Wakiso',
      subcounty: 'Wakiso',
      address: 'Wakiso Town Council',
      dutyOfficer: officer._id,
      isDemo: true,
    },
    {
      name: 'Gulu LC II Court',
      level: 'LC_II',
      district: 'Gulu',
      subcounty: 'Pece',
      address: 'Pece Division Offices',
      dutyOfficer: officer._id,
      isDemo: true,
    },
    {
      name: 'Mbarara LC III Court',
      level: 'LC_III',
      district: 'Mbarara',
      subcounty: 'Kamukuzi',
      address: 'Kamukuzi Division Offices',
      dutyOfficer: officer._id,
      isDemo: true,
    },
  ]);

  const byName = new Map(institutions.map((institution) => [institution.name, institution]));

  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;
  /**
   * A date a number of days from today, at a given hour in East Africa Time (UTC+3).
   * Anchoring to a fixed local hour keeps seeded timestamps plausible (office hours)
   * instead of inheriting the moment the seed script happened to run.
   */
  const atEat = (days: number, hourEat = 10, minute = 0): Date => {
    const date = new Date(now + days * DAY);
    date.setUTCHours(hourEat - 3, minute, 0, 0);
    return date;
  };
  const daysAgo = (days: number, hour = 10): Date => atEat(-days, hour);
  const daysAhead = (days: number, hour = 10): Date => atEat(days, hour);
  /** A hearing on a given day at 10:00 East Africa Time (UTC+3). */
  const hearingOn = (days: number, hourEat = 10): Date => atEat(days, hourEat);

  interface SeedEvent {
    type: CaseEventType;
    title: string;
    description?: string;
    statusFrom?: CaseStatus;
    statusTo?: CaseStatus;
    hearingDate?: Date;
    at: Date;
  }

  interface SeedCase {
    trackingId: string;
    title: string;
    category: CaseCategory;
    description: string;
    reference: string;
    institutionName: string;
    status: CaseStatus;
    createdAt: Date;
    nextHearingAt?: Date;
    events: SeedEvent[];
  }

  const demoCases: SeedCase[] = [
    {
      trackingId: 'CTUG-2026-DEM001',
      title: 'Boundary dispute over family plot',
      category: 'LAND_DISPUTE',
      description:
        'A disagreement about the boundary between two neighbouring family plots in Bwaise. Both parties have produced different survey documents and are asking the LC court to help establish the correct boundary.',
      reference: 'KWP/LC2/2026/041',
      institutionName: 'Kawempe LC II Court',
      status: 'HEARING_SCHEDULED',
      createdAt: daysAgo(24, 9),
      nextHearingAt: hearingOn(4),
      events: [
        {
          type: 'CASE_CREATED',
          title: 'Case registered',
          description: 'Case submitted by the complainant and recorded at Kawempe LC II Court.',
          statusTo: 'REGISTERED',
          at: daysAgo(24, 9),
        },
        {
          type: 'STATUS_CHANGE',
          title: 'Moved to review',
          description: 'The duty officer opened the file and began reviewing the submitted documents.',
          statusFrom: 'REGISTERED',
          statusTo: 'UNDER_REVIEW',
          at: daysAgo(20, 11),
        },
        {
          type: 'MILESTONE',
          title: 'Site visit completed',
          description:
            'The officer visited the disputed boundary with both parties present. Photographs and statements were added to the file.',
          at: daysAgo(16, 15),
        },
        {
          type: 'HEARING_SCHEDULED',
          title: 'Hearing scheduled',
          description: 'Both parties were informed to attend with their survey documents and witnesses.',
          statusFrom: 'UNDER_REVIEW',
          statusTo: 'HEARING_SCHEDULED',
          hearingDate: hearingOn(4),
          at: daysAgo(8, 12),
        },
      ],
    },
    {
      trackingId: 'CTUG-2026-DEM002',
      title: 'Unpaid wages for casual work',
      category: 'EMPLOYMENT',
      description:
        'The complainant says she worked for three weeks at a food stall in Nakawa and was not paid the agreed daily wage. She is asking the LC court to help recover the outstanding amount.',
      reference: 'NKW/LC3/2026/118',
      institutionName: 'Nakawa LC III Court',
      status: 'UNDER_REVIEW',
      createdAt: daysAgo(18, 14),
      events: [
        {
          type: 'CASE_CREATED',
          title: 'Case registered',
          description: 'Case submitted and recorded at Nakawa LC III Court.',
          statusTo: 'REGISTERED',
          at: daysAgo(18, 14),
        },
        {
          type: 'STATUS_CHANGE',
          title: 'Moved to review',
          description: 'The duty officer reviewed the written statement and the payment messages supplied by the complainant.',
          statusFrom: 'REGISTERED',
          statusTo: 'UNDER_REVIEW',
          at: daysAgo(15, 10),
        },
        {
          type: 'NOTE',
          title: 'Employer contacted',
          description:
            'The officer spoke with the employer by phone. Both parties were asked to submit written statements before a hearing date is fixed.',
          at: daysAgo(6, 16),
        },
      ],
    },
    {
      trackingId: 'CTUG-2026-DEM003',
      title: 'Noise complaint against a bar',
      category: 'PUBLIC_NUISANCE',
      description:
        'Residents near a bar in Makindye report loud music late into the night. They are asking the LC court to help agree on reasonable closing hours.',
      reference: 'MKD/LC2/2026/073',
      institutionName: 'Makindye LC II Court',
      status: 'ADJOURNED',
      createdAt: daysAgo(40, 8),
      events: [
        {
          type: 'CASE_CREATED',
          title: 'Case registered',
          description: 'Case submitted by a group of residents and recorded at Makindye LC II Court.',
          statusTo: 'REGISTERED',
          at: daysAgo(40, 8),
        },
        {
          type: 'STATUS_CHANGE',
          title: 'Moved to review',
          description: 'The duty officer reviewed the complaint and invited the bar owner to respond.',
          statusFrom: 'REGISTERED',
          statusTo: 'UNDER_REVIEW',
          at: daysAgo(35, 11),
        },
        {
          type: 'HEARING_SCHEDULED',
          title: 'First hearing scheduled',
          description: 'Both parties were invited to attend a hearing at the LC court offices.',
          statusFrom: 'UNDER_REVIEW',
          statusTo: 'HEARING_SCHEDULED',
          hearingDate: hearingOn(-12),
          at: daysAgo(20, 9),
        },
        {
          type: 'STATUS_CHANGE',
          title: 'Hearing adjourned',
          description:
            'The hearing was adjourned because the respondent did not appear. The officer directed that a fresh summons be issued.',
          statusFrom: 'HEARING_SCHEDULED',
          statusTo: 'ADJOURNED',
          at: daysAgo(12, 12),
        },
        {
          type: 'MILESTONE',
          title: 'Fresh summons issued',
          description: 'A fresh summons was prepared and delivered to the respondent’s premises.',
          at: daysAgo(5, 13),
        },
      ],
    },
    {
      trackingId: 'CTUG-2026-DEM004',
      title: 'Family land inheritance disagreement',
      category: 'FAMILY',
      description:
        'Members of one family disagree about how a piece of land in Mukono should be shared following the death of their father. They asked the LC court to mediate and record an agreement.',
      reference: 'MKN/LC3/2026/204',
      institutionName: 'Mukono LC III Court',
      status: 'DECISION_RECORDED',
      createdAt: daysAgo(60, 9),
      events: [
        {
          type: 'CASE_CREATED',
          title: 'Case registered',
          description: 'Case submitted by the family spokesperson and recorded at Mukono LC III Court.',
          statusTo: 'REGISTERED',
          at: daysAgo(60, 9),
        },
        {
          type: 'STATUS_CHANGE',
          title: 'Moved to review',
          description: 'The officer reviewed the family documents and invited all parties to mediation.',
          statusFrom: 'REGISTERED',
          statusTo: 'UNDER_REVIEW',
          at: daysAgo(55, 10),
        },
        {
          type: 'HEARING_SCHEDULED',
          title: 'Mediation hearing scheduled',
          description: 'All family members were invited to attend a mediation session.',
          statusFrom: 'UNDER_REVIEW',
          statusTo: 'HEARING_SCHEDULED',
          hearingDate: hearingOn(-30),
          at: daysAgo(40, 14),
        },
        {
          type: 'MILESTONE',
          title: 'Mediation session held',
          description:
            'The parties met with the LC court mediation panel. A draft sharing agreement was read back to the family.',
          at: daysAgo(30, 13),
        },
        {
          type: 'STATUS_CHANGE',
          title: 'Decision recorded',
          description:
            'A written decision was recorded: the land is to be shared in three portions, with access paths left open for all family members.',
          statusFrom: 'HEARING_SCHEDULED',
          statusTo: 'DECISION_RECORDED',
          at: daysAgo(25, 11),
        },
      ],
    },
    {
      trackingId: 'CTUG-2026-DEM005',
      title: 'Mobile money debt disagreement',
      category: 'DEBT',
      description:
        'A mobile money agent in Nansana says a customer collected money that was not repaid. The customer disputes part of the amount. The LC court helped the parties reconcile their records.',
      reference: 'NSN/LC2/2026/017',
      institutionName: 'Nansana LC II Court',
      status: 'CLOSED',
      createdAt: daysAgo(75, 10),
      events: [
        {
          type: 'CASE_CREATED',
          title: 'Case registered',
          description: 'Case submitted by the mobile money agent and recorded at Nansana LC II Court.',
          statusTo: 'REGISTERED',
          at: daysAgo(75, 10),
        },
        {
          type: 'STATUS_CHANGE',
          title: 'Moved to review',
          description: 'The officer reviewed the transaction printouts supplied by both parties.',
          statusFrom: 'REGISTERED',
          statusTo: 'UNDER_REVIEW',
          at: daysAgo(70, 15),
        },
        {
          type: 'HEARING_SCHEDULED',
          title: 'Hearing scheduled',
          description: 'Both parties were invited to attend with their transaction records.',
          statusFrom: 'UNDER_REVIEW',
          statusTo: 'HEARING_SCHEDULED',
          hearingDate: hearingOn(-45),
          at: daysAgo(55, 9),
        },
        {
          type: 'STATUS_CHANGE',
          title: 'Decision recorded',
          description:
            'The parties agreed on an outstanding balance of UGX 180,000, to be paid in two instalments. The agreement was recorded in writing.',
          statusFrom: 'HEARING_SCHEDULED',
          statusTo: 'DECISION_RECORDED',
          at: daysAgo(40, 12),
        },
        {
          type: 'STATUS_CHANGE',
          title: 'Case closed',
          description: 'Both parties confirmed that the agreed settlement had been completed. The file was closed.',
          statusFrom: 'DECISION_RECORDED',
          statusTo: 'CLOSED',
          at: daysAgo(30, 16),
        },
      ],
    },
    {
      trackingId: 'CTUG-2026-DEM006',
      title: 'Assault complaint at Kireka market',
      category: 'ASSAULT',
      description:
        'Two traders at Kireka market were involved in an altercation. The complainant says he was pushed and injured. He is asking the LC court to hear the matter and record statements.',
      reference: 'KRK/LC2/2026/089',
      institutionName: 'Kireka LC II Court',
      status: 'REGISTERED',
      createdAt: daysAgo(2, 11),
      events: [
        {
          type: 'CASE_CREATED',
          title: 'Case registered',
          description: 'Case submitted at Kireka LC II Court. A medical form was attached to the file.',
          statusTo: 'REGISTERED',
          at: daysAgo(2, 11),
        },
      ],
    },
    {
      trackingId: 'CTUG-2026-DEM007',
      title: 'Rental deposit refund dispute',
      category: 'PROPERTY',
      description:
        'A tenant in Entebbe says the landlord has not refunded a rental deposit after the tenancy ended. The landlord disputes the condition of the house. The LC court is reviewing the tenancy agreement.',
      reference: 'ENT/LC3/2026/312',
      institutionName: 'Entebbe LC III Court',
      status: 'HEARING_SCHEDULED',
      createdAt: daysAgo(30, 13),
      nextHearingAt: hearingOn(2),
      events: [
        {
          type: 'CASE_CREATED',
          title: 'Case registered',
          description: 'Case submitted by the tenant and recorded at Entebbe LC III Court.',
          statusTo: 'REGISTERED',
          at: daysAgo(30, 13),
        },
        {
          type: 'STATUS_CHANGE',
          title: 'Moved to review',
          description: 'The officer reviewed the tenancy agreement and the handover checklist.',
          statusFrom: 'REGISTERED',
          statusTo: 'UNDER_REVIEW',
          at: daysAgo(26, 10),
        },
        {
          type: 'HEARING_SCHEDULED',
          title: 'Hearing scheduled',
          description: 'Both parties were invited to attend with receipts and photographs of the property.',
          statusFrom: 'UNDER_REVIEW',
          statusTo: 'HEARING_SCHEDULED',
          hearingDate: hearingOn(2),
          at: daysAgo(10, 11),
        },
        {
          type: 'NOTE',
          title: 'Tenant submitted receipts',
          description: 'The tenant submitted the deposit receipt and photographs taken on the day of handover.',
          at: daysAgo(3, 14),
        },
      ],
    },
    {
      trackingId: 'CTUG-2026-DEM008',
      title: 'Crop damage caused by livestock',
      category: 'PROPERTY',
      description:
        'A farmer in Wakiso says goats belonging to a neighbour damaged a cassava garden. The neighbour disputes the extent of the damage. The LC court is arranging a valuation.',
      reference: 'WKS/LC2/2026/056',
      institutionName: 'Wakiso LC II Court',
      status: 'UNDER_REVIEW',
      createdAt: daysAgo(12, 8),
      events: [
        {
          type: 'CASE_CREATED',
          title: 'Case registered',
          description: 'Case submitted by the farmer and recorded at Wakiso LC II Court.',
          statusTo: 'REGISTERED',
          at: daysAgo(12, 8),
        },
        {
          type: 'STATUS_CHANGE',
          title: 'Moved to review',
          description: 'The officer reviewed the complaint and invited the neighbour to respond.',
          statusFrom: 'REGISTERED',
          statusTo: 'UNDER_REVIEW',
          at: daysAgo(9, 12),
        },
        {
          type: 'MILESTONE',
          title: 'Valuation requested',
          description:
            'The officer asked an agricultural extension officer to assess the damaged section of the garden before the next sitting.',
          at: daysAgo(4, 15),
        },
      ],
    },
  ];

  let eventCount = 0;

  for (const seedCase of demoCases) {
    const institution = byName.get(seedCase.institutionName);
    if (!institution) throw new Error(`Missing institution: ${seedCase.institutionName}`);

    const lastEvent = seedCase.events[seedCase.events.length - 1];
    if (!lastEvent) throw new Error(`No events for ${seedCase.trackingId}`);

    const caseDoc = await Case.create({
      trackingId: seedCase.trackingId,
      title: seedCase.title,
      category: seedCase.category,
      description: seedCase.description,
      reference: seedCase.reference,
      institution: institution._id,
      citizen: citizen._id,
      status: seedCase.status,
      source: 'DEMO',
      isDemo: true,
      assignedOfficer: officer._id,
      nextHearingAt: seedCase.nextHearingAt ?? null,
      lastEventAt: lastEvent.at,
      createdAt: seedCase.createdAt,
    });

    await CaseAccess.create({
      case: caseDoc._id,
      user: officer._id,
      grantedBy: null,
      reason: 'SEED',
    });

    for (const event of seedCase.events) {
      const isCitizenEvent = event.type === 'CASE_CREATED';
      await CaseEvent.create({
        case: caseDoc._id,
        type: event.type,
        title: event.title,
        description: event.description,
        statusFrom: event.statusFrom ?? null,
        statusTo: event.statusTo ?? null,
        hearingDate: event.hearingDate ?? null,
        source: 'DEMO',
        author: isCitizenEvent ? citizen._id : officer._id,
        authorName: isCitizenEvent ? citizen.name : officer.name,
        authorRole: isCitizenEvent ? 'CITIZEN' : 'OFFICER',
        createdAt: event.at,
      });
      eventCount += 1;
    }
  }

  const caseByTracking = new Map(
    (await Case.find({ trackingId: /^CTUG-2026-DEM/ }).lean()).map((doc) => [doc.trackingId, doc])
  );

  const notificationSeeds: Array<{
    trackingId: string;
    title: string;
    body: string;
    read: boolean;
    at: Date;
  }> = [
    {
      trackingId: 'CTUG-2026-DEM001',
      title: 'Hearing scheduled — CTUG-2026-DEM001',
      body: 'A hearing for your boundary dispute has been scheduled. Please attend with your survey documents.',
      read: false,
      at: daysAgo(8, 12),
    },
    {
      trackingId: 'CTUG-2026-DEM002',
      title: 'Officer note — CTUG-2026-DEM002',
      body: 'The officer contacted your employer. Please submit your written statement at Nakawa LC III Court.',
      read: false,
      at: daysAgo(6, 16),
    },
    {
      trackingId: 'CTUG-2026-DEM007',
      title: 'Hearing scheduled — CTUG-2026-DEM007',
      body: 'A hearing for your rental deposit dispute has been scheduled at Entebbe LC III Court.',
      read: false,
      at: daysAgo(10, 11),
    },
    {
      trackingId: 'CTUG-2026-DEM008',
      title: 'Progress update — CTUG-2026-DEM008',
      body: 'A valuation of the damaged garden has been requested. You will be notified when a date is fixed.',
      read: false,
      at: daysAgo(4, 15),
    },
    {
      trackingId: 'CTUG-2026-DEM004',
      title: 'Decision recorded — CTUG-2026-DEM004',
      body: 'A written decision has been recorded in the family land matter. Contact the LC court to collect a copy.',
      read: true,
      at: daysAgo(25, 11),
    },
    {
      trackingId: 'CTUG-2026-DEM005',
      title: 'Case closed — CTUG-2026-DEM005',
      body: 'Your mobile money debt case has been closed after both parties confirmed the settlement.',
      read: true,
      at: daysAgo(30, 16),
    },
  ];

  for (const seedNotification of notificationSeeds) {
    const related = caseByTracking.get(seedNotification.trackingId);
    if (!related) continue;
    await Notification.create({
      user: citizen._id,
      case: related._id,
      title: seedNotification.title,
      body: seedNotification.body,
      read: seedNotification.read,
      createdAt: seedNotification.at,
    });
  }

  const officerCase = caseByTracking.get('CTUG-2026-DEM006');
  if (officerCase) {
    await Notification.create({
      user: officer._id,
      case: officerCase._id,
      title: 'New case assigned — CTUG-2026-DEM006',
      body: 'An assault complaint from Kireka market has been assigned to you for review.',
      read: false,
      createdAt: daysAgo(2, 12),
    });
  }

  await Promise.all([
    User.syncIndexes(),
    Institution.syncIndexes(),
    Case.syncIndexes(),
    CaseEvent.syncIndexes(),
    CaseAccess.syncIndexes(),
    Notification.syncIndexes(),
  ]);

  const counts = {
    users: await User.countDocuments(),
    institutions: await Institution.countDocuments(),
    cases: await Case.countDocuments(),
    events: await CaseEvent.countDocuments(),
    notifications: await Notification.countDocuments(),
    caseAccess: await CaseAccess.countDocuments(),
  };

  console.log('\nSeed complete — all records are synthetic DEMO data.');
  console.log(counts);
  console.log('\nDemo accounts (clearly labelled DEMO in the app):');
  console.log('  Officer: officer.demo@casetrack.ug / ' + officerPassword);
  console.log('  Citizen: citizen.demo@casetrack.ug / ' + citizenPassword);
  console.log(`\nInserted ${eventCount} timeline events across ${demoCases.length} demo cases.`);
  console.log('New citizen cases are assigned to the demo duty officer for their selected court.\n');

  await disconnectDatabase();
}

seed().catch(async (error) => {
  console.error('Seed failed:', error instanceof Error ? error.message : 'unknown error');
  await disconnectDatabase().catch(() => undefined);
  process.exit(1);
});
