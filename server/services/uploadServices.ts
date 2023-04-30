import { type ObjectId } from 'mongodb';
import { getDb } from '../database/conn';
import { insertUpload } from '../database/dao/uploadDao';

const createUpload = async (fileName: string): Promise<ObjectId> => {
    const db = getDb();
    const upload = await insertUpload(db, {
        status: 'processing_file',
        fileName,
    });
    return upload.insertedId;
};

export { createUpload };
