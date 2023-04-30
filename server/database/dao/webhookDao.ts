import { type Webhook } from '../models';

const getWebhook = async (db, query): Promise<Webhook> => {
    const webhooksCollection = db.collection('webhooks');
    return await webhooksCollection.findOne(query);
};

const insertWebhook = async (db, webhook: Webhook) => {
    const webhooksCollection = db.collection('webhooks');
    await webhooksCollection.insertOne(webhook);
};
export { getWebhook, insertWebhook };
