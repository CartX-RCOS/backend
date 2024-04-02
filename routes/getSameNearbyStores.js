import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

import { nearbyStoreData } from '../json/sameNearbyStores.js';


const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const parsed = path.parse(__filename);

router.get(`/${parsed.name}`, async (req, res) => {  
   res.json(nearbyStoreData);
});

export default router;
