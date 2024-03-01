import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
const router = express.Router();

import { matchItem } from '../utils/matchItem.js';
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
  const groups = []

  // Initialize to empty
  const used = {}
  storeMap.forEach((items, store) => {
    used[store] = {}
  } );

  // Loop through stores
  storeMap.forEach((baseItems, baseStore) => {
    // used[baseStore] = {}
    // Loop through each item in every store
    baseItems.forEach((baseData, baseItem) => {
      if (used[baseStore][baseItem] != undefined) {
        return
      }

      const group = {
        "url": "https://website.com",
        "quantity": "2",
        "matches": {
          [baseStore]: {
            "name": baseItem,
            "price": "$3",
            "quantity": "5"
          }
        }
      }
      
      storeMap.forEach((comparisonItems, comparisonStore) => {
        // Skip same store
        if (baseStore == comparisonStore) {
          return
        }

        const [closestMatch, score]  = matchItem(baseItem, comparisonItems)
        group["matches"][comparisonStore] = closestMatch
      } );

      // console.log(group)
      groups.push(group)
      Object.entries(group.matches).forEach(([store, { name, price, quantity }]) => {
        used[store][name] = true;
        // console.log(`Store: ${store}, Name: ${name}, Price: ${price}, Quantity: ${quantity}`);
      });
      
    } );
  } );

  // console.log(used)

  return groups
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