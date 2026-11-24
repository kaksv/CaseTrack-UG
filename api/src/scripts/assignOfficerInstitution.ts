
import { Types } from 'mongoose';
import { env } from '../config';
import { connectDatabase, disconnectDatabase } from '../db';
import { User } from '../models/User';
import { Institution } from '../models/Institution';

async function main(): Promise<void> {
    const [email, institutionId] = process.argv.slice(2);

    if (!email || !institutionId) {
        throw new Error(
            'Usage: assignOfficerInstitution.ts <officer-email> <institution-id>'
        );
    }

    if (!Types.ObjectId.isValid(institutionId)) {
        throw new Error('Invalid institution ID');
    }

    await connectDatabase(env.MONGODB_URI);

    const officer = await User.findOne({
        email: email.trim().toLowerCase(),
        role: 'OFFICER',
    });

    if (!officer) {
        throw new Error('Officer account not found');
    }

    const institution = await Institution.findOne({
        _id: institutionId,
        active: true,
    });

    if (!institution) {
        throw new Error('Active institution not found');
    }

    if (!officer.isDemo || !institution.isDemo) {
        throw new Error(
            'This script is restricted to demonstration accounts and courts'
        );
    }

    if (officer.institution) {
        if (String(officer.institution) === institutionId) {
            console.log('Officer already belongs to this institution.');
            return;
        }

        throw new Error(
            'Officer already belongs to another institution. Reassignment requires manual review.'
        );
    }

    const result = await User.updateOne(
        {
            _id: officer._id,
            role: 'OFFICER',
            isDemo: true,
            institution: null,
        },
        {
            $set: {
                institution: institution._id,
            },
        },
        {
            runValidators: true,
        }
    );

    if (result.modifiedCount !== 1) {
        throw new Error('Assignment failed. Account may have changed.');
    }

    console.log('\nOFFICER ASSIGNMENT SUCCESSFUL');
    console.log('Officer:', officer.name);
    console.log('Email:', officer.email);
    console.log('Institution:', institution.name);
    console.log('Institution ID:', String(institution._id));
    console.log('District:', institution.district);
    console.log('Role:', officer.role);
}

main()
    .catch((error) => {
        console.error(error.message);
        process.exitCode = 1;
    })
    .finally(() => disconnectDatabase());
