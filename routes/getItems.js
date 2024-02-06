import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
const router = express.Router();

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

  let results = {};
  const storePromises = stores.map(async (store) => {
    results[store] = {};

    try {
      // Generate item queries
      const queries = items.map(async (item) => {
        const query = `SELECT * FROM ${store} WHERE product_name LIKE '%${item}%'`;
        let response = await req.db.query(query);
        return [item, response[0]]; 
      });

      // Wait for all item queries to resolve
      const allResults = await Promise.all(queries);

      // Store in result
      allResults.forEach(([item, response]) => {
        results[store][item] = response;
      });

    // Could not connect to SQL or table does not exist
    } catch (error) {
      console.error(`Error querying store ${store}: ${error.message}`);
    }
  });

  // Wait for all store processes to resolve
  await Promise.all(storePromises);

  res.json(results);
});

export default router;