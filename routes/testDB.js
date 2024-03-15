import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const parsed = path.parse(__filename);

router.get(`/${parsed.name}`, async (req, res) => {  
   try {
      // Assuming `req.db` is your MongoDB database instance
      // Replace 'yourCollectionName' with an actual collection name in your database
      // This attempts to find a single document in the specified collection
      await req.db.collection('inventory').findOne({});
      res.json({ canConnect: true });
   } catch (err) {
      console.error('Failed to connect to the database:', err);
      res.json({ canConnect: false });
   }
});

export default router;
