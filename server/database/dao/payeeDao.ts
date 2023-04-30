import { type BulkWriteResult } from 'mongodb';
import { type Payee, type PayeeLoan } from '../models';

export interface UpdatePayeeQuery {
    filter: any;
    update: any;
}

const findPayees = async (db, query): Promise<Payee[]> => {
    const payeesCollection = db.collection('payees');
    return await payeesCollection.find(query).toArray();
};

const findPayeeLoans = async (db, query): Promise<PayeeLoan[]> => {
    const payeeLoansCollection = db.collection('payeeLoans');
    return await payeeLoansCollection.find(query).toArray();
};

const getPayeeLoan = async (db, query): Promise<PayeeLoan> => {
    const payeeLoansCollection = db.collection('payeeLoans');
    return await payeeLoansCollection.findOne(query);
};

const getPayee = async (db, query): Promise<Payee> => {
    const payeesCollection = db.collection('payees');
    return await payeesCollection.findOne(query);
};

const bulkInsertPayees = async (
    db,
    payees: Payee[],
): Promise<BulkWriteResult> => {
    const payeesCollection = db.collection('payees');
    const payeesBulk = payeesCollection.initializeUnorderedBulkOp();
    payees.forEach((payee) => {
        payeesBulk
            .find({ dunkinId: payee.dunkinId })
            .upsert()
            .update({ $setOnInsert: payee });
    });
    return await payeesBulk.execute();
};

const bulkUpdatePayees = async (
    db,
    queries: UpdatePayeeQuery[],
): Promise<BulkWriteResult> => {
    const payeesCollection = db.collection('payees');
    const payeesBulk = payeesCollection.initializeUnorderedBulkOp();
    queries.forEach((query) => {
        payeesBulk.find(query.filter).update(query.update);
    });
    return await payeesBulk.execute();
};

const bulkInsertPayeeLoans = async (db, payeeLoans: PayeeLoan[]) => {
    const payeeLoansCollection = db.collection('payeeLoans');
    const payeeLoansBulk = payeeLoansCollection.initializeUnorderedBulkOp();
    payeeLoans.forEach((payeeLoan) => {
        payeeLoansBulk
            .find({
                dunkinId: payeeLoan.dunkinId,
                plaidId: payeeLoan.plaidId,
                loanAccountNumber: payeeLoan.loanAccountNumber,
            })
            .upsert()
            .update({ $setOnInsert: payeeLoan });
    });
    return await payeeLoansBulk.execute();
};

const bulkUpdatePayeeLoans = async (
    db,
    queries: UpdatePayeeQuery[],
): Promise<BulkWriteResult> => {
    const payeeLoansCollection = db.collection('payeeLoans');
    const payeeLoansBulk = payeeLoansCollection.initializeUnorderedBulkOp();
    queries.forEach((query) => {
        payeeLoansBulk.find(query.filter).update(query.update);
    });
    return await payeeLoansBulk.execute();
};

export {
    bulkInsertPayees,
    bulkInsertPayeeLoans,
    bulkUpdatePayeeLoans,
    findPayees,
    bulkUpdatePayees,
    findPayeeLoans,
    getPayeeLoan,
    getPayee,
};
