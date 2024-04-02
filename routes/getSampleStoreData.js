import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

import { sampleStoreData } from '../json/sampleStoreData.js';


const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const parsed = path.parse(__filename);

router.get(`/${parsed.name}`, async (req, res) => {  
   res.json(sampleStoreData);
});

export default router;
