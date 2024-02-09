import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
const router = express.Router();
import { fetchItems } from '../utils/fetchItems.js';

// Get file route name (Same as file name)
const __filename = fileURLToPath(import.meta.url);
const parsed = path.parse(__filename);

router.put(`/${parsed.name}`, async (req, res) => {
  // Lists
  const items = req.body.items;
  const stores = req.body.stores;

  // No items selected
  if (!items || items.length == 0) {
    return res.status(400).json({ error: 'Items are required' });
  }

  // No stores given
  if (!stores || stores.length == 0) {
    return res.status(400).json({ error: 'Stores are required' });
  }

  let result = await fetchItems(items, stores, req.db);
  res.json(result);
});

export default router;