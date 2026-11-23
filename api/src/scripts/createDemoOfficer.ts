import bcrypt from 'bcryptjs';
import { env } from '../config';
import { connectDatabase, disconnectDatabase } from '../db';
import { User } from '../models/User';

async function main() {
  const email = 'officer.demo@casetrack.ug';
  const password = process.env.DEMO_OFFICER_PASSWORD;

  if (!password || password.length < 12) {
    throw new Error('Set DEMO_OFFICER_PASSWORD to at least 12 characters');
  }

  await connectDatabase(env.MONGODB_URI);

  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Account already exists. No changes made.');
    return;
  }

  await User.create({
    name: 'Ssemakula Daniel',
    email,
    passwordHash: await bcrypt.hash(password, 12),
    role: 'OFFICER',
    isDemo: true,
  });

  console.log('Demo officer created:', email);
}

main()
  .catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => disconnectDatabase());
