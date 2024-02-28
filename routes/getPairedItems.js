import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
const router = express.Router();

import { matchItem } from '../utils/matchItem.js';



// Get file route name (Same as file name)
const __filename = fileURLToPath(import.meta.url);
const parsed = path.parse(__filename);

router.get(`/${parsed.name}`, async (req, res) => {
  // console.log(getSimilarityScore("Red Apple Re", "Red Apple"))

  // Example items
  // const baseItemName = 'a red apple which I like';
  // const items = [{name: 'red apple'}, {name: 'green apple'}, {name: 'red grape'}, {name: 'applered'}];
  // const items = ['my apple red', 'green apple', 'red grape', 'apple red'];
  const baseGroup = ['Red Apple', 'Blue Banana', 'Milk', '5% Milk', 'Oranges']
  const baseStoreName = "Base Store"
  const stores = {
    "cvs": ['Red Apple', 'Red Banana', '2% Milk', 'brokenmilk', 'abcd', 'Grape'],
    "hannafords": ['Apple', 'Nothing', 'Random', 'Orange juice'],
    "walmart": ["chair", "water", "regular banana", "1% milk", "no fat milk", "apple red"]
  }
  
  let result = {}

  baseGroup.forEach(baseItem => {
    const storeNames = Object.keys(stores)
    result[baseItem] = {
      "url": "https://website.com",
      "quantity": "2",
      "matches": {
        [baseStoreName]: {
          "name": baseItem,
          "price": "$3"
        }
      }
    }
    storeNames.forEach(storeName => {
      const storeItems = stores[storeName]
      const match = matchItem(baseItem, storeItems)
      result[baseItem]["matches"][storeName] = {
        "name": match[0],
        "price": "$2"
      }
    }); 
  })

  res.json(result);
});

export default router;