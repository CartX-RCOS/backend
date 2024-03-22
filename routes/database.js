import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import { MongoClient } from 'mongodb';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const parsed = path.parse(__filename);

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
const database = client.db('inventory');
const cvs_connection = database.collection('cvs');
const hannaford_connection = database.collection('hannaford');

router.post(`/${parsed.name}`, async (req, res) => {  

   const name_id = req.body.name;

   try {
      
      const cvs = await cvs_connection.find({}).toArray();
      const hannaford = await hannaford_connection.find({}).toArray();
      res.json({cvs, hannaford});

   } catch (err) {
      console.error('Failed to connect to the database:', err);
      res.json({ canConnect: false });
   }
});

export default router;
