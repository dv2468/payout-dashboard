import { type BulkWriteResult } from 'mongodb';
import { type Payment } from '../models';

export interface UpdatePaymentQuery {
    filter: any;
    update: any;
}

export interface AggregatePaymentsQuery {
    filter: any;
    group: any;
}

const bulkInsertPayments = async (
    db,
    payments: Payment[],
): Promise<BulkWriteResult> => {
    const paymentsCollection = db.collection('payments');
    const paymentsBulk = paymentsCollection.initializeUnorderedBulkOp();
    payments.forEach((payment) => {
        paymentsBulk.insert(payment);
    });
    return await paymentsBulk.execute();
};

const findPayments = async (db, query): Promise<Payment[]> => {
    const paymentsCollection = db.collection('payments');
    return await paymentsCollection.find(query).toArray();
};

const aggregatePayments = async (
    db,
    query: AggregatePaymentsQuery,
): Promise<any[]> => {
    const payments = db.collection('payments');
    return await payments.aggregate([query.filter, query.group]).toArray();
};

const bulkUpdatePayments = async (
    db,
    queries: UpdatePaymentQuery[],
): Promise<BulkWriteResult> => {
    const paymentsCollection = db.collection('payments');
    const paymentsBulk = paymentsCollection.initializeUnorderedBulkOp();
    queries.forEach((query) => {
        paymentsBulk.find(query.filter).update(query.update);
    });
    return await paymentsBulk.execute();
};

const updatePayment = async (db, query: UpdatePaymentQuery) => {
    const paymentsCollection = db.collection('payments');
    await paymentsCollection.updateOne(query.filter, query.update);
};

export {
    bulkInsertPayments,
    findPayments,
    bulkUpdatePayments,
    aggregatePayments,
    updatePayment,
};
