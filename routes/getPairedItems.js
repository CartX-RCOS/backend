import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
const router = express.Router();

import { findMostSimilar } from '../utils/findMostSimilar.js';
import { getSimilarityScore } from '../utils/getSimilarityScore.js';



// Get file route name (Same as file name)
const __filename = fileURLToPath(import.meta.url);
const parsed = path.parse(__filename);

router.get(`/${parsed.name}`, async (req, res) => {
  // console.log(getSimilarityScore("Red Apple Re", "Red Apple"))

  // Example items
  const baseItemName = 'a red apple which I like';
  // const items = [{name: 'red apple'}, {name: 'green apple'}, {name: 'red grape'}, {name: 'applered'}];
  const items = ['my apple red', 'green apple', 'red grape', 'apple red'];

  let mostSimilarScore = -1;
  let mostSimilarItem = "";
  items.forEach(item => {
    const comparisonScore = getSimilarityScore(baseItemName, item);
    if (comparisonScore > mostSimilarScore) {
      mostSimilarScore = comparisonScore;
      mostSimilarItem = item;
    }
  })

  console.log(mostSimilarItem)
  console.log(mostSimilarScore)


// const mostSimilarItem = findMostSimilar(baseItemName, items);
// console.log('Most Similar Item:', mostSimilarItem);

  // Lists
  // const items = req.body.items;
  // const stores = req.body.stores;

  // // No items selected
  // if (!items || items.length == 0) {
  //   return res.status(400).json({ error: 'Items are required' });
  // }

  // // No stores given
  // if (!stores || stores.length == 0) {
  //   return res.status(400).json({ error: 'Stores are required' });
  // }

  // let rawData = await fetchItems(items, stores, req.db);



  res.json("ABC");
});

export default router;