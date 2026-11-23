import { env } from '../config';
import { connectDatabase, disconnectDatabase } from '../db';
import { Case } from '../models/Case';
import { User } from '../models/User';
import { CaseAccess } from '../models/CaseAccess';
import { Notification } from '../models/Notification';

/**
 * Explicitly assign an officer to a case (creates the CaseAccess record).
 *
 * Usage:
 *   npm run assign -- CTUG-2026-ABC123 officer@example.com
 */
async function assign(): Promise<void> {
  const [trackingId, email] = process.argv.slice(2);

  if (!trackingId || !email) {
    console.error('Usage: npm run assign -- <tracking-id> <officer-email>');
    process.exit(1);
  }

  await connectDatabase(env.MONGODB_URI);

  const caseDoc = await Case.findOne({ trackingId: trackingId.toUpperCase() });
  if (!caseDoc) {
    console.error(`Case not found: ${trackingId}`);
    await disconnectDatabase();
    process.exit(1);
  }

  const officer = await User.findOne({ email: email.toLowerCase(), role: 'OFFICER' });
  if (!officer) {
    console.error(`Officer not found: ${email}`);
    await disconnectDatabase();
    process.exit(1);
  }

  await CaseAccess.findOneAndUpdate(
    { case: caseDoc._id, user: officer._id },
    { $set: { grantedBy: null, reason: 'MANUAL' } },
    { upsert: true, new: true }
  );

  caseDoc.assignedOfficer = officer._id;
  await caseDoc.save();

  await Notification.create({
    user: caseDoc.citizen,
    case: caseDoc._id,
    title: `Case ${caseDoc.trackingId} assigned`,
    body: `Your case has been assigned to ${officer.name} for review.`,
    read: false,
  });

  await Notification.create({
    user: officer._id,
    case: caseDoc._id,
    title: `New case assigned — ${caseDoc.trackingId}`,
    body: `${caseDoc.title} is now in your assigned caseload.`,
    read: false,
  });

  console.log(`Assigned ${caseDoc.trackingId} to ${officer.name} (${officer.email}).`);
  await disconnectDatabase();
}

assign().catch(async (error) => {
  console.error('Assignment failed:', error instanceof Error ? error.message : 'unknown error');
  await disconnectDatabase().catch(() => undefined);
  process.exit(1);
});
