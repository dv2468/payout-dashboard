import { type BulkWriteResult } from 'mongodb';
import { type Payor } from '../models';

export interface UpdatePayorQuery {
    filter: any;
    update: any;
}

const bulkInsertPayors = async (
    db,
    payors: Payor[],
): Promise<BulkWriteResult> => {
    const payorsCollection = db.collection('payors');
    const payorsBulk = payorsCollection.initializeUnorderedBulkOp();
    payors.forEach((payor) => {
        payorsBulk
            .find({ dunkinId: payor.dunkinId })
            .upsert()
            .update({ $setOnInsert: payor });
    });
    return await payorsBulk.execute();
};

const bulkUpdatePayors = async (
    db,
    queries: UpdatePayorQuery[],
): Promise<BulkWriteResult> => {
    const payorsCollection = db.collection('payors');
    const payorsBulk = payorsCollection.initializeUnorderedBulkOp();
    queries.forEach((query) => {
        payorsBulk.find(query.filter).update(query.update);
    });
    return await payorsBulk.execute();
};

const getPayor = async (db, query): Promise<Payor> => {
    const payorsCollection = db.collection('payors');
    return await payorsCollection.findOne(query);
};
const findPayors = async (db, query): Promise<Payor[]> => {
    const payorsCollection = db.collection('payors');
    return await payorsCollection.find(query).toArray();
};

export { bulkInsertPayors, findPayors, bulkUpdatePayors, getPayor };
