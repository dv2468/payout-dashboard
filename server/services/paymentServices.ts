import { type ObjectId } from 'mongodb';
import { uSDollarToCents } from '../utils/currencyUtils';
import {
    type UpdatePaymentQuery,
    bulkInsertPayments,
    bulkUpdatePayments,
    findPayments,
} from '../database/dao/paymentDao';
import { type Payment } from '../database/models';
import { getDb } from '../database/conn';
import { getPayor } from '../database/dao/payorDao';
import { getPayeeLoan } from '../database/dao/payeeDao';
import { createPayment as createMethodPayment } from './method';
import { getBatches } from '../utils/commonUtils';

const createPayments = async (rawPayouts: any[], uploadId: ObjectId) => {
    const db = getDb();
    const payments: Payment[] = rawPayouts.map((data) => {
        return {
            payor: {
                dunkinId: data.Payor.DunkinId,
                name: data.Payor.Name,
                routing: data.Payor.ABARouting,
                accountNumber: data.Payor.AccountNumber,
            },
            payee: {
                dunkinId: data.Employee.DunkinId,
                plaidId: data.Payee.PlaidId,
                loanAccount: data.Payee.LoanAccountNumber,
                name: `${data.Employee.FirstName} ${data.Employee.LastName}`,
                dunkinBranch: data.Employee.DunkinBranch,
            },
            amount: uSDollarToCents(data.Amount),
            uploadId,
        };
    });
    await bulkInsertPayments(db, payments);
};

const processPayments = async (uploadId: ObjectId, job: any) => {
    const db = getDb();
    const payments = await findPayments(db, { uploadId });
    const updates: UpdatePaymentQuery[] = [];
    const batches = getBatches(payments);
    const errors = [];

    for (const batch of batches) {
        const promises = [];
        for (let j = 0; j < batch.length; j++) {
            const payment = batch[j];
            const promise = (async () => {
                const payor = await getPayor(db, {
                    dunkinId: payment.payor.dunkinId,
                });
                const payeeLoan = await getPayeeLoan(db, {
                    dunkinId: payment.payee.dunkinId,
                    plaidId: payment.payee.plaidId,
                    loanAccountNumber: payment.payee.loanAccount,
                });
                if (payor.accountId && payeeLoan.accountId && payment.amount) {
                    try {
                        const methodPayment = await createMethodPayment({
                            amount: parseFloat(payment.amount.toFixed(2)),
                            sourceAccountId: payor.accountId,
                            detinationAccountId: payeeLoan.accountId,
                        });
                        updates.push({
                            filter: { _id: payment._id },
                            update: {
                                $set: {
                                    paymentId: methodPayment.id,
                                    status: methodPayment.status,
                                },
                            },
                        });
                    } catch (err) {
                        errors.push(payment._id);
                    }
                }
            })();
            promises.push(promise);
        }
        await Promise.all(promises);
        job.touch();
    }
    console.log(`${errors.length} errors when creating payments`);

    await bulkUpdatePayments(db, updates);
};
export { createPayments, processPayments };
