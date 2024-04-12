import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
const router = express.Router();

import { matchItem } from '../utils/matchItem.js';
// import { sampleStoreData } from '../json/sampleStoreData.js';
import { fetchItems } from '../utils/fetchItems.js';

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
function getGroups (stores, storeMap, min_matches, min_score) {
  const used = {}
  const groups = []

  // Initialize to empty
  storeMap.forEach((items, store) => {
    used[store] = {}
  } );

  // Loop through stores
  storeMap.forEach((baseItems, baseStore) => {
    // Loop through each item in every store
    baseItems.forEach((baseData, baseItem) => {
      if (used[baseStore][baseItem] != undefined) {
        return
      }

      const group = {
        ...baseData,
        matches: {
          [baseStore]: {
            ...baseData,
            "matched": true
          }
        }
      };
      
      storeMap.forEach((comparisonItems, comparisonStore) => {
        // Skip same store
        if (baseStore == comparisonStore) {
          return
        }

        const [closestMatch, score] = matchItem(baseItem, comparisonItems)

        // Do not include matches below a certain score
        if (score < min_score) {
          return
        }
        group["matches"][comparisonStore] = {
          ...closestMatch,
          "matched": true
        }
      } );

      // Don't include groups that did not reach minimum matches
      const groupSize = Object.entries(group.matches).length
      if (groupSize < min_matches) {
        return
      }

      stores.forEach((storeName) => {
        if (group.matches[storeName] != undefined) {
          return
        }

        group.matches[storeName] = {
          "matched": false
        }
      })

      groups.push(group)
      Object.entries(group.matches).forEach(([store, { name, price, quantity }]) => {
        used[store][name] = true;
      });
      
    } );
  } );

  return groups
}

router.post(`/${parsed.name}`, async (req, res) => { 
  const stores = req.body.stores;
  const searchQuery = req.body.searchQuery;
  
  if (stores == undefined || stores.length == 0) {
    return res.status(400).json({ error: 'stores of at least length 1 is required' });
  }

  if (searchQuery == undefined || searchQuery == "") {
    return res.status(400).json({ error: 'searchQuery is required and cannot be ""' });
  }

  const storeData = await fetchItems(req.db, searchQuery, stores)

  const storeMap = new Map();
  createStoreMap(storeMap, storeData);

  const minMatches = 2;
  const min_score = 75; //% match
  const groups = getGroups(stores, storeMap, minMatches, min_score);

  // console.log(groups.length)
  res.json(groups);
});

export default router;