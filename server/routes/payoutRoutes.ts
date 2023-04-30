import express from 'express';
import { getAgenda } from '../services/agenda';
import { ObjectId } from 'mongodb';
import { getDb } from '../database/conn';
import { findPayments } from '../database/dao/paymentDao';
import { centsToUsDollar } from '../utils/currencyUtils';

const router = express.Router();

router.post('/payout/:uploadId', async (req, res) => {
    const agenda = getAgenda();

    const uploadId = req.params.uploadId;
    agenda.now('process payout', { uploadId: new ObjectId(uploadId) });

    res.status(200).send();
});

router.get('/payout_summary/:uploadId', async (req, res) => {
    const db = getDb();
    const uploadId = req.params.uploadId;
    const payments = await findPayments(db, {
        uploadId: new ObjectId(uploadId),
    });
    const response = payments.map((payment) => {
        return {
            payor: payment.payor.name,
            payee: payment.payee.name,
            amount: centsToUsDollar(payment.amount),
        };
    });
    return res.json(response);
});

export default router;
