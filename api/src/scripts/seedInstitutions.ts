import { env } from '../config';
import { connectDatabase, disconnectDatabase } from '../db';
import { Institution } from '../models/Institution';

const courts = [
  ['Kawempe LC II Court', 'LC_II', 'Kampala', 'Kawempe'],
  ['Nakawa LC III Court', 'LC_III', 'Kampala', 'Nakawa'],
  ['Makindye LC II Court', 'LC_II', 'Kampala', 'Makindye'],
  ['Mukono LC III Court', 'LC_III', 'Mukono', 'Mukono Central'],
  ['Nansana LC II Court', 'LC_II', 'Wakiso', 'Nansana'],
  ['Kireka LC II Court', 'LC_II', 'Wakiso', 'Kira'],
  ['Entebbe LC III Court', 'LC_III', 'Wakiso', 'Entebbe'],
  ['Wakiso LC II Court', 'LC_II', 'Wakiso', 'Wakiso'],
  ['Gulu LC II Court', 'LC_II', 'Gulu', 'Pece'],
  ['Mbarara LC III Court', 'LC_III', 'Mbarara', 'Kamukuzi'],
] as const;

async function main() {
  await connectDatabase(env.MONGODB_URI);

  let created = 0;

  for (const [name, level, district, subcounty] of courts) {
    const result = await Institution.updateOne(
      { name, district },
      {
        $setOnInsert: {
          name,
          level,
          district,
          subcounty,
          active: true,
          isDemo: true,
        },
      },
      { upsert: true }
    );

    if (result.upsertedCount) created++;
  }

  console.log(`Created ${created} demo courts.`);
  console.log(`Already existing: ${courts.length - created}`);
}

main()
  .catch((error) => {
    console.error('Institution seed failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => disconnectDatabase());
