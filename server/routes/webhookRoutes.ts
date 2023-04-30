import express from 'express';
import { getDb } from '../database/conn';
import { getPaymentStatus } from '../services/method';
import { updatePayment } from '../database/dao/paymentDao';

const router = express.Router();

/**
 * Example payload: { type: 'payment.update', op: 'update', id: 'pmt_AyqU8jc8WU' }
 */
router.post('/hook/method', async (req, res) => {
    const db = getDb();
    const data = req.body;
    if (!data || data.type !== 'payment.update') {
        return res.status(200).json();
    }
    const payment = await getPaymentStatus({ id: data.id });

    await updatePayment(db, {
        filter: { paymentId: data.id },
        update: { $set: { status: payment.status } },
    });

    res.status(200).json();
});

export default router;
