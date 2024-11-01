import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const parsed = path.parse(__filename);
const router = express.Router();

function cosineSimilarity(vecA, vecB) {
   const dotProduct = vecA.reduce((acc, val, idx) => acc + val * vecB[idx], 0);
   const magnitudeA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
   const magnitudeB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
   return dotProduct / (magnitudeA * magnitudeB);
}

function groupSimilarItems(data, threshold = 0.9) {
   const groupedItems = [];
   const processedIndices = new Set();

   for (let i = 0; i < data.length; i++) {
      if (processedIndices.has(i)) continue;

      const currentItem = data[i];
      const currentGroup = [currentItem];

      for (let j = i + 1; j < data.length; j++) {
         if (processedIndices.has(j)) continue;

         const compareItem = data[j];
         
         if (currentItem.store !== compareItem.store) {
            const similarity = cosineSimilarity(currentItem.embedding, compareItem.embedding);

            if (similarity >= threshold) {
               currentGroup.push(compareItem);
               processedIndices.add(j);
            }
         }
      }

      groupedItems.push(currentGroup);
      processedIndices.add(i);
   }

   return groupedItems;
}

router.put(`/${parsed.name}`, async (req, res) => {
   const data = req.body.results;

   try {
      const groupedItems = groupSimilarItems(data);

      res.json({ groupedItems });
   } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while grouping items' });
   }
});

export default router;
