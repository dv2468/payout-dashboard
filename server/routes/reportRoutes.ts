import express from 'express';
import { getDb } from '../database/conn';
import { ObjectId } from 'mongodb';
import { aggregatePayments, findPayments } from '../database/dao/paymentDao';
import { centsToUsDollar } from '../utils/currencyUtils';

const router = express.Router();

const processFundPerSource = async (db, uploadId: ObjectId) => {
    const payments = await aggregatePayments(db, {
        filter: { $match: { uploadId } },
        group: {
            $group: {
                _id: {
                    id: '$payor.id',
                    name: '$payor.name',
                    routing: '$payor.routing',
                    accountNumber: '$payor.accountNumber',
                },
                total: { $sum: '$amount' },
            },
        },
    });

    const response = payments.map((payment) => {
        return {
            name: payment._id.name,
            routing: payment._id.routing,
            accountNumber: payment._id.accountNumber,
            total: centsToUsDollar(payment.total),
        };
    });
    return response;
};

const processFundPerBranch = async (db, uploadId: ObjectId) => {
    const payments = await aggregatePayments(db, {
        filter: { $match: { uploadId } },
        group: {
            $group: {
                _id: { branchId: '$payee.dunkinBranch' },
                total: { $sum: '$amount' },
            },
        },
    });
    const response = payments.map((payment) => {
        return {
            branchId: payment._id.branchId,
            total: centsToUsDollar(payment.total),
        };
    });
    return response;
};

const processStatusPerPayment = async (db, uploadId: ObjectId) => {
    const payments = await findPayments(db, { uploadId });
    const response = payments.map((payment) => {
        return {
            payorName: payment.payor.name,
            payorRouting: payment.payor.routing,
            payorAccountNumber: payment.payor.accountNumber,
            payeeName: payment.payee.name,
            payeeLoanAccount: payment.payee.loanAccount,
            status: payment.status,
            amount: centsToUsDollar(payment.amount),
        };
    });
    return response;
};

router.get('/report/:uploadId/:type', async (req, res) => {
    const db = getDb();
    const uploadId = new ObjectId(req.params.uploadId);
    const type = req.params.type;
    let response = {};
    switch (type) {
        case 'fund_per_source':
            response = await processFundPerSource(db, uploadId);
            break;
        case 'fund_per_branch':
            response = await processFundPerBranch(db, uploadId);
            break;
        case 'status_per_payment':
            response = await processStatusPerPayment(db, uploadId);
            break;
    }

    res.json(response);
});

export default router;
