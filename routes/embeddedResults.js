import { MongoClient } from 'mongodb';
import { pipeline } from '@xenova/transformers';
import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { group } from 'console';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const parsed = path.parse(__filename);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
const uri = process.env.MONGO_URI;

let client;
let isClientConnected = false;

// Function to calculate cosine similarity between two vectors
function cosineSimilarity(vecA, vecB) {
   const dotProduct = vecA.reduce((acc, val, idx) => acc + val * vecB[idx], 0);
   const magnitudeA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
   const magnitudeB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
   return dotProduct / (magnitudeA * magnitudeB);
}

// Function to average embeddings
const averageEmbedding = (tensor) => {
   const array = Array.from(tensor.data);
   const [numItems, numTokens, embeddingSize] = tensor.dims;
   const averagedEmbeddings = [];

   for (let i = 0; i < numItems; i++) {
      const itemEmbedding = new Array(embeddingSize).fill(0);
      for (let j = 0; j < numTokens; j++) {
         const startIndex = (i * numTokens + j) * embeddingSize;
         for (let k = 0; k < embeddingSize; k++) {
            itemEmbedding[k] += array[startIndex + k];
         }
      }
      const averagedItemEmbedding = itemEmbedding.map(value => value / numTokens);
      averagedEmbeddings.push(averagedItemEmbedding);
   }

   return averagedEmbeddings;
};



function groupSimilarItems(data, threshold = 0.5) {
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
            console.log(currentItem.name, compareItem.name)
            const similarity = cosineSimilarity(currentItem.embedding, compareItem.embedding);
            console.log(similarity);

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



const stores = ['hannaford', 'walgreens', 'cvs'];

// Initialize MongoDB client once when the server starts
async function initializeMongoClient() {
   try {
      if (!client) {
         client = new MongoClient(uri);
         await client.connect();
         console.log("Connected successfully to MongoDB");
         isClientConnected = true;
      }
   } catch (err) {
      console.error("Error connecting to MongoDB", err);
      isClientConnected = false;
   }
}

// Ensure the MongoDB client is connected before handling requests
async function ensureClientConnected() {
   if (!isClientConnected) {
      await initializeMongoClient();
   }
}

// Call the MongoDB initialization before any user interaction (e.g., when server starts)
await initializeMongoClient();

router.put(`/${parsed.name}`, async (req, res) => {
   try {
      // Ensure the MongoDB client is still connected
      await ensureClientConnected();

      // Access the database and collection
      const database = client.db('inventory');

      // Load the pre-trained model for embeddings
      const model = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

      // Get the search query from the request body
      const query = req.body.searchQuery;

      // Split the search query into individual words for keyword matching
      const searchWords = query.split(/\s+/).map(word => word.trim()).filter(Boolean);

      // Convert the query to an embedding
      const queryEmbedding = await model(query);
      const averagedQueryEmbedding = averageEmbedding(queryEmbedding);

      const results = [];

      for (const storeName of stores) {
         const store = database.collection(storeName);

         // Perform an `$or` query to find any items where name contains any word from searchWords
         const keywordFilteredItems = await store.find({
            $or: searchWords.map(word => ({ name: { $regex: word, $options: 'i' } }))
         }).toArray();


         // Calculate similarity for each item in the filtered results
         keywordFilteredItems.forEach(item => {
            const semanticSimilarity = cosineSimilarity(item.embedding, averagedQueryEmbedding[0]);
            let newItem = item;
            newItem['store'] = storeName;
            newItem['similarity'] = semanticSimilarity;
            results.push(newItem);
         });
      }

      // Sort results based on similarity in descending order
      results.sort((a, b) => b.similarity - a.similarity);

      const groupedItems = groupSimilarItems(results);

      const newItems = groupedItems.map(group => group[0]); 

      newItems.sort((a, b) => b.similarity - a.similarity);

      // const finalItems = await Promise.all(
      //    newItems.map(async (item) => {
      //       const store = item.store;
      
      //       // Remove the `embedding` field
      //       const { embedding, ...filteredItem } = item;
      
      //       // Call the store API
      //       const response = await axios.put('/getStores', { store });
      //       const data = await response.json();
      
      //       // Add store data if needed or return the filtered item
      //       console.log(data);
      //       return { ...filteredItem, storeData: data };
      //    })
      // );
      
      res.json(newItems);

   } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred' });
   }
});

export default router;
