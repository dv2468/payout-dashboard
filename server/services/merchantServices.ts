import { IMerchant } from 'method-node';
import { PayeeLoan } from '../database/models';
import { getBatches, sleep } from '../utils/commonUtils';
import { findMerchants } from './method';

const getMerchants = async (
    payeeLoans: PayeeLoan[],
    job: any,
): Promise<{ [key: string]: IMerchant }> => {
    const plaidIds = Array.from(
        new Set(payeeLoans.map((payeeLoan) => payeeLoan.plaidId)),
    );
    const plaidIdToMerchant = {};
    const batches = getBatches(plaidIds);
    const errors = [];

    for (const batch of batches) {
        const promises = [];
        for (let j = 0; j < batch.length; j++) {
            const plaidId = batch[j];
            const promise = (async () => {
                try {
                    const merchants = await findMerchants(plaidId);
                    if (merchants.length === 0) {
                        console.log(
                            `Can't find merchant for plad id: ${plaidId}`,
                        );
                        return;
                    }
                    plaidIdToMerchant[plaidId] = merchants[0];
                } catch (err) {
                    if (err.code === 400 && err.type === 'INVALID_REQUEST') {
                        console.error(
                            `Invalid request when finding merchant. Code: ${err.code}: `,
                            err.message,
                        );
                    } else if (err.code === 429) {
                        console.log(
                            'Reached limit. Sleep for 1 minutes before retrying',
                        );
                        errors.push(plaidId);
                    } else {
                        errors.push(plaidId);
                    }
                }
            })();
            promises.push(promise);
        }
        await Promise.all(promises);
        job.touch();
    }
    console.log(`${errors.length} errors when finding merchants`);

    return plaidIdToMerchant;
};

export { getMerchants };
