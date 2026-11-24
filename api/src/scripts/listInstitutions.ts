
import { env } from '../config';
import { connectDatabase, disconnectDatabase } from '../db';
import { Institution } from '../models/Institution';

async function main(): Promise<void> {
    await connectDatabase(env.MONGODB_URI);

    const institutions = await Institution.find({
        active: true,
    })
        .sort({ district: 1, name: 1 })
        .lean();

    console.table(
        institutions.map((institution) => ({
            id: String(institution._id),
            name: institution.name,
            level: institution.level,
            district: institution.district,
            isDemo: institution.isDemo,
            dutyOfficer: institution.dutyOfficer
                ? String(institution.dutyOfficer)
                : 'Unassigned',
        }))
    );

    console.log(`Total institutions: ${institutions.length}`);
}

main()
    .catch((error) => {
        console.error(error.message);
        process.exitCode = 1;
    })
    .finally(() => disconnectDatabase());
