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
         "validItems": [],
         "invalidItems": {}
      };
   });

   // Loop through matches and add to analysisObject ($1 = 1 point)
   groupData.groups.forEach(group => {
      Object.keys(group.matches).forEach((storeName) => {
         const match = group.matches[storeName]
         analysisObject[storeName].analysisPoints += parseFloat(match.price)
         analysisObject[storeName].validItems.push(match)
      })
   })

   // Find average
   Object.keys(analysisObject).forEach((storeName) => {
      const analysisPoints = analysisObject[storeName].analysisPoints
      const totalItems = analysisObject[storeName].validItems.length
      analysisObject[storeName]["averageAnalysisPoints"] = parseFloat((analysisPoints / totalItems).toFixed(2));
   })


   res.json(analysisObject)
});

export default router;
