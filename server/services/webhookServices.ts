import { type TWebhookTypes } from 'method-node';
import { createWebhook } from './method';
import { getDb } from '../database/conn';
import { insertWebhook } from '../database/dao/webhookDao';

const createMethodWebhook = async (type: TWebhookTypes) => {
    const db = getDb();
    await createWebhook({ type });
    await insertWebhook(db, { type });
};

export { createMethodWebhook };
