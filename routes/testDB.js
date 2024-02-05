import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const parsed = path.parse(__filename);

router.get(`/${parsed.name}`, async (req, res) => {  
   try {
      await req.db.query('SELECT 1');
      res.json({ canConnect: true });
   } catch (err) {
      console.error('Failed to connect to the database:', err);
      res.json({ canConnect: false });
   }
});

export default router;