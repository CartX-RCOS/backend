import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
const router = express.Router();
import axios from 'axios';

import { matchItem } from '../utils/matchItem.js';

// this is where he will give the data from the database
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
function getGroups (stores, storeMap, min_matches) {
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
        if (score < 75) {
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

router.get(`/${parsed.name}`, async (req, res) => { 
  // const stores = ["target", "cvs", "hannaford", "shopright"] 

  const stores = ["cvs", "hannaford"]
  // search query
  const searchQuery = "queso";
  const storeMap = new Map();

  // sample store data send it
  try {
    const response = await axios.post("http://localhost:8080/testDB", {name: searchQuery});
    createStoreMap(storeMap, response.data);

    const minMatches = 2;
    const groups = getGroups(stores, storeMap, minMatches);
    res.json(groups);
  } catch (error){
    console.log(error);
    res.send("error");
  }
});

export default router;