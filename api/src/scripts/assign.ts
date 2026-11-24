
import { env } from '../config';
import {
  connectDatabase,
  disconnectDatabase,
} from '../db';
import { Case } from '../models/Case';
import { User } from '../models/User';
import { CaseAccess } from '../models/CaseAccess';
import { Notification } from '../models/Notification';
import { assertInstitutionAccess } from '../lib/authorization';

async function assign(): Promise<void> {
  const [trackingId, email] = process.argv.slice(2);

  if (!trackingId || !email) {
    throw new Error(
      'Usage: npm run assign -- <tracking-id> <officer-email>'
    );
  }

  await connectDatabase(env.MONGODB_URI);

  const caseDoc = await Case.findOne({
    trackingId: trackingId.trim().toUpperCase(),
  });

  if (!caseDoc) {
    throw new Error(`Case not found: ${trackingId}`);
  }

  const officer = await User.findOne({
    email: email.trim().toLowerCase(),
    role: 'OFFICER',
  });

  if (!officer) {
    throw new Error(`Officer not found: ${email}`);
  }

  await assertInstitutionAccess(
    {
      id: String(officer._id),
      name: officer.name,
      email: officer.email,
      role: 'OFFICER',
      institutionId: officer.institution
        ? String(officer.institution)
        : null,
      isDemo: officer.isDemo ?? false,
    },
    caseDoc.institution
  );

  await CaseAccess.findOneAndUpdate(
    {
      case: caseDoc._id,
      user: officer._id,
    },
    {
      $set: {
        grantedBy: null,
        reason: 'MANUAL',
      },
    },
    {
      upsert: true,
      new: true,
    }
  );

  caseDoc.assignedOfficer = officer._id;
  await caseDoc.save();

  console.log(
    `Assigned ${caseDoc.trackingId} to ${officer.name} (${officer.email}).`
  );

  try {
    if (caseDoc.citizen) {
      await Notification.create({
        user: caseDoc.citizen,
        case: caseDoc._id,
        title: `Case ${caseDoc.trackingId} assigned`,
        body: `Your case has been assigned to ${officer.name} for review.`,
        read: false,
      });
    }

    await Notification.create({
      user: officer._id,
      case: caseDoc._id,
      title: `New case assigned — ${caseDoc.trackingId}`,
      body: `${caseDoc.title} is now in your assigned caseload.`,
      read: false,
    });
  } catch (error) {
    console.error(
      'Assignment saved, but notification failed:',
      error instanceof Error
        ? error.message
        : 'unknown error'
    );
  }
}

assign()
  .catch((error) => {
    console.error(
      'Assignment failed:',
      error instanceof Error
        ? error.message
        : 'unknown error'
    );

    process.exitCode = 1;
  })
  .finally(() => disconnectDatabase());
