import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import { nearbyStoreData } from '../json/sameNearbyStores.js';
import { groupData } from '../json/sampleGroupData.js';



const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const parsed = path.parse(__filename);

router.get(`/${parsed.name}`, async (req, res) => { 
   // Initiate Object with analysisPoints = travelTime (1 minute = 1 point)
   const analysisObject = {}; 
   Object.keys(nearbyStoreData.stores).forEach((storeName) => {
      const store = nearbyStoreData.stores[storeName];
      analysisObject[storeName] = {
         ...store,
         "analysisPoints": parseFloat(store.travelTime),
         "matchedItems": [],
         "notMatchedItems": []
      };
   });

   // Loop through matches and add to analysisObject ($1 = 1 point)
   groupData.groups.forEach(group => {
      Object.keys(group.matches).forEach((storeName) => {
         const match = group.matches[storeName]

         // Skip and store unmatched items
         if (match.matched == false) {
            const { matches, ...groupWithoutMatches } = group;
            analysisObject[storeName].notMatchedItems.push(groupWithoutMatches)
            return
         }

         // Add to analysisPoints and store match
         analysisObject[storeName].analysisPoints += parseFloat(match.price)
         analysisObject[storeName].matchedItems.push(match)
      })
   })

   // Find average
   Object.keys(analysisObject).forEach((storeName) => {
      const analysisPoints = analysisObject[storeName].analysisPoints
      const totalItems = analysisObject[storeName].matchedItems.length
      analysisObject[storeName]["averageAnalysisPoints"] = parseFloat((analysisPoints / totalItems).toFixed(2));
   })

   const analysisArray = Object.entries(analysisObject);

   analysisArray.sort((a, b) => {
      return a[1].averageAnalysisPoints - b[1].averageAnalysisPoints;
   });

   const sortedAnalysisObject = Object.fromEntries(analysisArray);

   res.json(sortedAnalysisObject)
});

export default router;
