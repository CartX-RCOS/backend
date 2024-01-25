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
  if (items.isEmpty()) {
    return res.status(400).json({ error: 'Items are required' });
  }

  // No stores given
  if (stores.isEmpty()) {
    return res.status(400).json({ error: 'Stores are required' });
  }

  const output = {
    "target": {
      "2% milk": {
        price: "$5",
        imgUrl: "https://is3-ssl.mzstatic.com/image/thumb/Purple114/v4/be/25/86/be25865d-3a46-0a5f-f9a3-60877fda3deb/source/512x512bb.jpg",
        size: "5oz"
      }
    },
    "walmart": {
      "whole milk": {
        price: "$5",
        imgUrl: "https://is3-ssl.mzstatic.com/image/thumb/Purple114/v4/be/25/86/be25865d-3a46-0a5f-f9a3-60877fda3deb/source/512x512bb.jpg",
        size: "5oz"
      }
    }
  }
  
  res.json(output);
});

export default router;