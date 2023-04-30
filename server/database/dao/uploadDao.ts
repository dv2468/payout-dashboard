import { type Upload } from '../models';

export interface UpdateUploadQuery {
    filter: any;
    update: any;
}

const insertUpload = async (db, upload: Upload): Promise<any> => {
    const uploads = db.collection('uploads');
    const result = await uploads.insertOne(upload);
    return result;
};

const updateUpload = async (db, query: UpdateUploadQuery): Promise<any> => {
    return await db.collection('uploads').updateOne(query.filter, query.update);
};

const findUplaods = async (db, query): Promise<Upload[]> => {
    return await db.collection('uploads').find(query).toArray();
};

export { insertUpload, updateUpload, findUplaods };
