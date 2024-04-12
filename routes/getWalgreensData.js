import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

import { sampleStoreData } from '../json/sampleStoreData.js';

const { MongoClient } = require("mongodb");

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const parsed = path.parse(__filename);

router.get(`\CVS`, async (req, res) => {  
    const uri = "mongodb+srv://CartX:CartXRCOS@cartx.srghpev.-mongodb.net/?retryWrites=true&w=majority&app-Name=CartX";
    const client = new MongoClient(uri);
    const database = client.db('inventory');
    const news = database.collection('Walgreens');

    const articles = await
    allArticles.find({}).toArray();
    console.log(articles);
    res.json(articles);
});

export default router;