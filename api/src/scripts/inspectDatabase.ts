
import mongoose from 'mongoose';
import { env } from '../config';
import { connectDatabase, disconnectDatabase } from '../db';
import { User } from '../models/User';
import { Institution } from '../models/Institution';

async function main(): Promise<void> {
    await connectDatabase(env.MONGODB_URI);

    console.log('\n=== DATABASE CONNECTION ===');

    console.log('Host:', mongoose.connection.host);
    console.log('Database:', mongoose.connection.name);
    console.log('Connection state:', mongoose.connection.readyState);

    console.log('\n=== DATABASE COLLECTIONS ===');

    const collections = await mongoose.connection.db!
        .listCollections()
        .toArray();

    console.table(
        collections.map((collection) => ({
            name: collection.name,
        }))
    );

    console.log('\n=== RECORD COUNTS ===');

    console.log('Total users:', await User.countDocuments());
    console.log(
        'Total officers:',
        await User.countDocuments({ role: 'OFFICER' })
    );
    console.log(
        'Total institutions:',
        await Institution.countDocuments()
    );

    console.log('\n=== REGISTERED USERS ===');

    const users = await User.find()
        .select('name email role institution isDemo')
        .limit(100)
        .lean();

    console.table(
        users.map((user) => ({
            id: String(user._id),
            name: user.name,
            email: user.email,
            role: user.role,
            institution: user.institution
                ? String(user.institution)
                : 'Unassigned',
            isDemo: user.isDemo,
        }))
    );

    console.log('\n=== DEMO OFFICER CHECK ===');

    const officer = await User.findOne({
        email: 'officer.demo@casetrack.ug',
    })
        .select('name email role institution isDemo')
        .lean();

    console.log(officer ?? 'Demo officer does not exist');
}

main()
    .catch((error) => {
        console.error(error.message);
        process.exitCode = 1;
    })
    .finally(() => disconnectDatabase());
