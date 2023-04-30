import { getDb } from '../database/conn';
import {
    type UpdatePayorQuery,
    bulkInsertPayors,
    bulkUpdatePayors,
} from '../database/dao/payorDao';
import { type Payor } from '../database/models';
import { sleep } from '../utils/commonUtils';
import { createCheckingAccount, createCoporateEntity } from './method';

const createPayors = async (rawPayouts: any[]) => {
    const db = getDb();
    const payors: Record<string, Payor> = {};
    rawPayouts.forEach((data) => {
        payors[data.Payor.DunkinId] = {
            dunkinId: data.Payor.DunkinId,
            name: data.Payor.Name,
            dBA: data.Payor.DBA,
            eIN: data.Payor.EIN,
            aBARouting: data.Payor.ABARouting,
            accountNumber: data.Payor.AccountNumber,
            address: {
                line1: data.Payor.Address.Line1,
                line2: data.Payor.Address.Line2,
                city: data.Payor.Address.City,
                state: data.Payor.Address.State,
                zip: data.Payor.Address.Zip,
            },
        };
    });
    await bulkInsertPayors(db, Object.values(payors));
};

const createPayorEntities = async (payors: Payor[]) => {
    const db = getDb();
    const updates: UpdatePayorQuery[] = [];
    let i: number = 0;
    while (i < payors.length) {
        const payor = payors[i];
        try {
            const entity = await createCoporateEntity({
                name: payor.name,
                dba: payor.dBA,
                ein: payor.eIN,
                address: {
                    line1: payor.address.line1,
                    line2: payor.address.line2,
                    city: payor.address.city,
                    state: payor.address.state,
                    zip: payor.address.zip,
                },
            });
            updates.push({
                filter: { dunkinId: payor.dunkinId },
                update: { $set: { entityId: entity.id } },
            });
            i++;
        } catch (err) {
            if (err.code === 400 && err.type === 'INVALID_REQUEST') {
                console.error(
                    `Invalid request when creating payor coporate entity. Code: ${err.code}: ${err.message}.`,
                );
                i++;
            } else if (err.code === 429) {
                console.log(
                    'Reached limit. Sleep for 1 minutes before retrying',
                );
                sleep(60000);
            } else {
                console.error(err);
            }
        }
    }
    if (updates.length > 0) {
        await bulkUpdatePayors(db, updates);
    } else {
        console.log('No coporate entities created for payors');
    }
};

const createPayorAccounts = async (payors: Payor[]) => {
    const db = getDb();
    const updates: UpdatePayorQuery[] = [];
    let i: number = 0;
    while (i < payors.length) {
        const payor = payors[i];
        try {
            const account = await createCheckingAccount({
                entityId: payor.entityId,
                routingNumber: payor.aBARouting,
                accountNumber: payor.accountNumber,
            });
            updates.push({
                filter: { dunkinId: payor.dunkinId },
                update: { $set: { accountId: account.id } },
            });
            i++;
        } catch (err) {
            if (err.code === 400 && err.type === 'INVALID_REQUEST') {
                console.error(
                    `Invalid request  when creating payor accounts. Code: ${err.code}: `,
                    err.message,
                );
                i++;
            } else if (err.code === 429) {
                console.log(
                    'Reached limit. Sleep for 1 minutes before retrying',
                );
                sleep(60000);
            } else {
                console.error(err);
            }
        }
    }
    if (updates.length > 0) {
        await bulkUpdatePayors(db, updates);
    } else {
        console.log('No accounts created for payors');
    }
};
export { createPayors, createPayorEntities, createPayorAccounts };
