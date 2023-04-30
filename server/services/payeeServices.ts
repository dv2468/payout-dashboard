import { getDb } from '../database/conn';
import {
    type UpdatePayeeQuery,
    bulkInsertPayeeLoans,
    bulkInsertPayees,
    bulkUpdatePayeeLoans,
    bulkUpdatePayees,
} from '../database/dao/payeeDao';
import { type Payee, type PayeeLoan } from '../database/models';
import { getBatches, sleep } from '../utils/commonUtils';
import { toyyyymmdd } from '../utils/dateUtils';
import { getMerchants } from './merchantServices';
import { createIndividualEntity, createLiabilityAccount } from './method';

const createPayees = async (rawPayouts: any[]) => {
    const db = getDb();
    const payees: Record<string, Payee> = {};
    rawPayouts.forEach((data) => {
        payees[data.Employee.DunkinId] = {
            dunkinId: data.Employee.DunkinId,
            dOB: data.Employee.DOB,
            dunkinBranch: data.Employee.DunkinBranch,
            firstName: data.Employee.FirstName,
            lastName: data.Employee.LastName,
            phoneNumber: data.Employee.PhoneNumber,
            email: data.Employee.Email,
        };
    });
    await bulkInsertPayees(db, Object.values(payees));
};

const createPayeeLoans = async (rawPayouts: any[]) => {
    const db = getDb();
    const payeeLoans: Record<string, PayeeLoan> = {};
    rawPayouts.map((data) => {
        const dunkinId = data.Employee.DunkinId;
        const plaidId = data.Payee.PlaidId;
        const loanAccountNumber = data.Payee.LoanAccountNumber;
        const key = `${dunkinId}:${plaidId}:${loanAccountNumber}`;
        payeeLoans[key] = {
            dunkinId,
            plaidId,
            loanAccountNumber,
        };
    });
    await bulkInsertPayeeLoans(db, Object.values(payeeLoans));
};

const createPayeeEntities = async (
    payees: Payee[],
    job: any,
): Promise<Record<string, string>> => {
    const db = getDb();
    const updates: UpdatePayeeQuery[] = [];

    const dunkinToEntity = {};
    const batches = getBatches(payees);
    const errors = [];

    for (const batch of batches) {
        const promises = [];
        for (let j = 0; j < batch.length; j++) {
            const payee = batch[j];
            const promise = (async () => {
                try {
                    const entity = await createIndividualEntity({
                        firstName: payee.firstName,
                        lastName: payee.lastName,
                        dob: payee.dOB && toyyyymmdd(payee.dOB),
                        ...(payee.email && { email: payee.email }),
                    });
                    updates.push({
                        filter: { dunkinId: payee.dunkinId },
                        update: { $set: { entityId: entity.id } },
                    });
                    dunkinToEntity[payee.dunkinId] = entity.id;
                } catch (err) {
                    if (err.code === 400 && err.type === 'INVALID_REQUEST') {
                        console.error(
                            `Invalid request when creating individual entity. Code: ${err.code}: `,
                            err.message,
                        );
                    } else if (err.code === 429) {
                        errors.push(payee._id);
                    } else {
                        errors.push(payee._id);
                    }
                }
            })();
            promises.push(promise);
        }
        await Promise.all(promises);
        job.touch();
    }
    console.log(`${errors.length} errors when creating payee entities`);
    if (updates.length > 0) {
        await bulkUpdatePayees(db, updates);
    } else {
        console.log('No individual entities created for payees');
    }
    return dunkinToEntity;
};

const createPayeeLoanAccounts = async (
    payeeLoans: PayeeLoan[],
    dunkinToEntity: Record<string, string>,
    job: any,
) => {
    const db = getDb();

    const updates: UpdatePayeeQuery[] = [];

    const plaidIdToMerchant = await getMerchants(payeeLoans, job);

    const batches = getBatches(payeeLoans);
    const errors = [];

    for (const batch of batches) {
        const promises = [];
        for (let j = 0; j < batch.length; j++) {
            const payeeLoan = batch[j];

            const promise = (async () => {
                try {
                    const merchant = plaidIdToMerchant[payeeLoan.plaidId];
                    if (!merchant) {
                        return;
                    }
                    const entityId = dunkinToEntity[payeeLoan.dunkinId];
                    if (!entityId) {
                        return;
                    }
                    const account = await createLiabilityAccount({
                        entityId: entityId,
                        merchantId: merchant.mch_id,
                        accountNumber: payeeLoan.loanAccountNumber,
                    });
                    if (account) {
                        updates.push({
                            filter: {
                                dunkinId: payeeLoan.dunkinId,
                                plaidId: payeeLoan.plaidId,
                                loanAccountNumber: payeeLoan.loanAccountNumber,
                            },
                            update: { $set: { accountId: account.id } },
                        });
                    }
                } catch (err) {
                    if (err.code === 400 && err.type === 'INVALID_REQUEST') {
                        console.error(
                            `Invalid request when creating payee liability account. Code: ${err.code}: `,
                            err.message,
                        );
                    } else if (err.code === 429) {
                        console.log(
                            'Reached limit. Sleep for 1 minutes before retrying',
                        );
                        errors.push(payeeLoan._id);
                    } else {
                        errors.push(payeeLoan._id);
                    }
                }
            })();
            promises.push(promise);
        }
        await Promise.all(promises);
        job.touch();
    }
    console.log(`${errors.length} errors when creating payee loan accounts`);

    if (updates.length > 0) {
        await bulkUpdatePayeeLoans(db, updates);
    } else {
        console.log('No liability accounts created for payees');
    }
};
export {
    createPayees,
    createPayeeLoans,
    createPayeeEntities,
    createPayeeLoanAccounts,
};
