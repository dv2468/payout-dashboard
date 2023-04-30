import { MongoClient } from 'mongodb';
import { getConfig } from '../config/config';

let _db;

const connectToMongo = async () => {
    let mongoClient;
    const config = getConfig();
    try {
        mongoClient = new MongoClient(config.db.url);
        console.log('Connecting to MongoDB...');
        await mongoClient.connect();
        console.log('Successfully connected to MongoDB!');
        _db = mongoClient.db('payout');
        return mongoClient;
    } catch (error) {
        console.error('Connection to MongoDB failed!', error);
        process.exit();
    }
};

const getDb = () => {
    if (!_db) {
        console.error(
            'Need to connect to MongoDB first before getting db instance',
        );
        process.exit();
    }
    return _db;
};

export { connectToMongo, getDb };
