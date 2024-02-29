import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
const router = express.Router();

// import { matchItem } from '../utils/matchItem.js';
import { sampleStoreData } from '../json/sampleStoreData.js';

// Get file route name (Same as file name)
const __filename = fileURLToPath(import.meta.url);
const parsed = path.parse(__filename);

// Combines all items into a central format
function createStoreMap (storeMap, stores) {
  
  for (let store in stores) {
    const itemMap = new Map();
    stores[store].forEach(item => {
      itemMap.set(item.name, item);
    });

    storeMap.set(store, itemMap)
  }
}

// getGroups
function getGroups (storeMap, min_matches) {
  groups = {}
  storeMap.forEach((items, store) => {
    items.forEach((data, item) => {
      console.log(data)
    } );
  } );
} 

router.get(`/${parsed.name}`, async (req, res) => {  
  const storeMap = new Map();
  createStoreMap(storeMap, sampleStoreData);
  // console.log(Object.fromEntries(storeMap))

  let result = {}
  let minMatches = 3;
  while (storeMap.size != 0 && minMatches > 0) {
    const groups = getGroups(storeMap, minMatches);
    console.log(groups)
    minMatches--;
  }


  // baseGroup.forEach(baseItem => {
  //   const storeNames = Object.keys(stores)
  //   result[baseItem] = {
  //     "url": "https://website.com",
  //     "quantity": "2",
  //     "matches": {
  //       [baseStoreName]: {
  //         "name": baseItem,
  //         "price": "$3"
  //       }
  //     }
  //   }
  //   storeNames.forEach(storeName => {
  //     const storeItems = stores[storeName]
  //     const match = matchItem(baseItem, storeItems)
  //     result[baseItem]["matches"][storeName] = {
  //       "name": match[0],
  //       "price": "$2"
  //     }
  //   }); 
  // })

  res.json(result);
});

export default router;