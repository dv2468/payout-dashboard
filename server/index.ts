import { config } from 'dotenv';

import express from 'express';
import cors from 'cors';

import { initializeAgendas } from './services/agenda';
import { connectToMongo, getDb } from './database/conn';
import { getWebhook } from './database/dao/webhookDao';
import { createMethodWebhook } from './services/webhookServices';
import uploadRoutes from './routes/uploadRoutes';
import payoutRoutes from './routes/payoutRoutes';
import reportRoutes from './routes/reportRoutes';
import webhookRoutes from './routes/webhookRoutes';

config();

const app = express();
const PORT = process.env.PORT || 5001;

const initWebhook = async () => {
    const db = getDb();
    const webhookType = 'payment.update';
    const result = await getWebhook(db, { type: webhookType });
    if (!result) {
        console.log('Creating webhook');
        await createMethodWebhook(webhookType);
        // TODO: Delete webhook on exitt
    }
};

app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' }));

connectToMongo().then(async () => {
    const agenda = initializeAgendas();
    agenda.start();

    await initWebhook();

    app.use('/api', uploadRoutes);
    app.use('/api', payoutRoutes);
    app.use('/api', reportRoutes);
    app.use('/api', webhookRoutes);

    app.listen(PORT, () => {
        console.log(`Payout Dashboard app listening on port ${PORT}`);
    });
});
