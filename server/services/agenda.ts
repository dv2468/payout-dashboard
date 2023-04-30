import { type ObjectId } from 'mongodb';
import { getDb } from '../database/conn';
import { findPayors } from '../database/dao/payorDao';
import { createPayorAccounts, createPayorEntities } from './payorServices';
import { findPayeeLoans, findPayees } from '../database/dao/payeeDao';
import { createPayeeEntities, createPayeeLoanAccounts } from './payeeServices';
import { updateUpload } from '../database/dao/uploadDao';
import { Agenda } from '@hokify/agenda';
import { getConfig } from '../config/config';
import { processPayments } from './paymentServices';

let _agenda;

const initializeAgendas = (): Agenda => {
    const config = getConfig();
    _agenda = new Agenda({ db: { address: config.db.url } });

    _agenda.define('process entity', async (job) => {
        console.log(
            `Processing entities through agenda with uploadId: ${job.attrs.data.uploadId}`,
        );
        await processMethodEntites(job);

        console.log('Agenda process entity complete');
    });
    _agenda.define('process payout', async (job) => {
        console.log(
            `Processing payouts through agenda with uploadId: ${job.attrs.data.uploadId}`,
        );

        await processMethodPayment(job);
        console.log('Agenda process payout complete');
    });
    return _agenda;
};

const getAgenda = () => {
    return _agenda;
};

const processMethodEntites = async (job: any) => {
    const uploadId: ObjectId = job.attrs.data.uploadId;

    const db = getDb();

    const payorsWithouEntity = await findPayors(db, {
        entityId: { $exists: false },
    });
    if (payorsWithouEntity.length > 0) {
        await createPayorEntities(payorsWithouEntity);
    } else {
        console.log('No payors without entity found');
    }

    const payorsWithoutAccount = await findPayors(db, {
        accountId: { $exists: false },
        entityId: { $exists: true },
    });
    if (payorsWithoutAccount.length > 0) {
        await createPayorAccounts(payorsWithoutAccount);
    } else {
        console.log('No payouts without account found');
    }

    const payeesWithoutEntity = await findPayees(db, {
        entityId: { $exists: false },
    });
    let payeeDunkinToEntity = {};

    if (payeesWithoutEntity.length > 0) {
        payeeDunkinToEntity = await createPayeeEntities(
            payeesWithoutEntity,
            job,
        );
    } else {
        console.log('No payees without entity found');
    }

    const payeeLoansWithoutAccount = await findPayeeLoans(db, {
        accountId: { $exists: false },
    });
    if (payeeLoansWithoutAccount.length > 0) {
        await createPayeeLoanAccounts(
            payeeLoansWithoutAccount,
            payeeDunkinToEntity,
            job,
        );
    } else {
        console.log('No payee loans without entity found');
    }

    await updateUpload(db, {
        filter: { _id: uploadId },
        update: { $set: { status: 'ready_for_payout' } },
    });
};

const processMethodPayment = async (job: any) => {
    const uploadId: ObjectId = job.attrs.data.uploadId;
    const db = getDb();
    const result = await updateUpload(db, {
        filter: { _id: uploadId, status: 'ready_for_payout' },
        update: { $set: { status: 'processing_payout' } },
    });
    if (result.matchedCount === 0) {
        console.log('No matching uploads in ready_for_payout');
        return;
    }

    await processPayments(uploadId, job);
    await updateUpload(db, {
        filter: { _id: uploadId, status: 'processing_payout' },
        update: { $set: { status: 'payout_complete' } },
    });
};

export { initializeAgendas, getAgenda };
