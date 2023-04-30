import express from 'express';
import multer from 'multer';
import xml2js from 'xml2js';

import { createUpload } from '../services/uploadServices';
import { createPayors } from '../services/payorServices';
import { createPayments } from '../services/paymentServices';
import { createPayeeLoans, createPayees } from '../services/payeeServices';
import { getAgenda } from '../services/agenda';
import { getDb } from '../database/conn';
import { findUplaods } from '../database/dao/uploadDao';

const router = express.Router();
const storage = multer.memoryStorage();
const uploadFile = multer({ storage });

// Handle file upload request with XML data
router.post('/upload', uploadFile.single('file'), async (req, res) => {
    const agenda = getAgenda();
    const xmlData = req.file.buffer.toString();
    let parsedData;
    try {
        parsedData = await xml2js.parseStringPromise(xmlData, {
            explicitArray: false,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error parsing XML data');
        return;
    }

    const data = JSON.parse(JSON.stringify(parsedData));
    const rawPayouts = data.root.row;

    const uploadId = await createUpload(req.body.fileName);
    const payorsPromise = createPayors(rawPayouts);
    const payeesPromise = createPayees(rawPayouts);
    const paymentsPromise = createPayments(rawPayouts, uploadId);
    const payeeLoansPromise = createPayeeLoans(rawPayouts);
    await Promise.all([
        payorsPromise,
        payeesPromise,
        paymentsPromise,
        payeeLoansPromise,
    ]);

    agenda.now('process entity', { uploadId });

    res.status(200).send({ uploadId });
});

router.get('/uploads', async (req, res) => {
    const db = getDb();
    const uploads = await findUplaods(db, {});

    const response = uploads.map((upload) => {
        return {
            uplaodTime: upload._id.getTimestamp().toLocaleDateString(),
            fileName: upload.fileName,
            status: upload.status,
            uploadId: upload._id,
        };
    });
    return res.json(response);
});

export default router;
