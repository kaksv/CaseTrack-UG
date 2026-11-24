
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

import { env } from '../config';
import {
    connectDatabase,
    disconnectDatabase,
} from '../db';

import { User } from '../models/User';

async function main() {
    const name = 'CaseTrack System Administrator';

    const email = 'admin.demo@casetrack.ug';

    const password = process.env.SYSTEM_ADMIN_PASSWORD;

    const expectedDatabase =
        process.env.SYSTEM_ADMIN_EXPECTED_DB;

    if (!expectedDatabase) {
        throw new Error(
            'Set SYSTEM_ADMIN_EXPECTED_DB before continuing.',
        );
    }

    if (
        !password ||
        password.length < 16 ||
        Buffer.byteLength(password, 'utf8') > 72
    ) {
        throw new Error(
            'Password must contain at least 16 characters and no more than 72 UTF-8 bytes.',
        );
    }

    await connectDatabase(env.MONGODB_URI);

    const database = mongoose.connection.name;

    console.log('Connected database:', database);
    console.log('Database host:', mongoose.connection.host);

    if (database !== expectedDatabase) {
        throw new Error(
            'Database does not match the expected development database.',
        );
    }

    const existing = await User.findOne({ email });

    if (existing) {
        console.log('An account with this email already exists.');
        console.log('No changes were made.');
        return;
    }

    const existingAdmin = await User.exists({
        role: 'SYSTEM_ADMIN',
    });

    if (existingAdmin) {
        throw new Error(
            'A system administrator already exists. Bootstrap refused.',
        );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await User.create({
        name,
        email,
        passwordHash,
        role: 'SYSTEM_ADMIN',
        accountStatus: 'ACTIVE',
        institution: null,
        isDemo: true,
        createdBy: null,
        activatedAt: new Date(),
    });

    console.log('\nSYSTEM ADMINISTRATOR CREATED');
    console.log('--------------------------------');
    console.log('ID:', String(admin._id));
    console.log('Name:', admin.name);
    console.log('Email:', admin.email);
    console.log('Role:', admin.role);
    console.log('Status:', admin.accountStatus);
    console.log('Demo account:', admin.isDemo);
    console.log('--------------------------------');
}

main()
    .catch((error: unknown) => {
        console.error(
            error instanceof Error
                ? error.message
                : 'Administrator provisioning failed.',
        );

        process.exitCode = 1;
    })
    .finally(async () => {
        await disconnectDatabase();
    });
