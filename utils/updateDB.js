import { MongoClient } from 'mongodb';
import { pipeline } from '@xenova/transformers';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch, { Headers } from 'node-fetch';
global.fetch = fetch;
global.Headers = Headers;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
const uri = process.env.MONGO_URI;

const averageEmbedding = (tensor) => {

   // Get the dimensions from the tensor
   const [numItems, numTokens, embeddingSize] = tensor.dims;

   console.log(`numItems: ${numItems}, numTokens: ${numTokens}, embeddingSize: ${embeddingSize}`);

   // Convert the tensor data to a standard array
   const array = Array.from(tensor.data);

   const averagedEmbeddings = [];

   for (let i = 0; i < numItems; i++) {
      const itemEmbedding = new Array(embeddingSize).fill(0);

      // Sum up the embeddings for all tokens in this item
      for (let j = 0; j < numTokens; j++) {
         const startIndex = (i * numTokens + j) * embeddingSize;  // Calculate the start index for this token's embedding
         for (let k = 0; k < embeddingSize; k++) {
            itemEmbedding[k] += array[startIndex + k];  // Sum the values for this embedding dimension
         }
      }
      // Calculate the average embedding for this item by dividing by the number of tokens (numTokens)
      const averagedItemEmbedding = itemEmbedding.map(value => value / numTokens);
      averagedEmbeddings.push(averagedItemEmbedding);  // Store the averaged embedding for this item
   }

   return averagedEmbeddings;  // This will be an array of size [numItems][embeddingSize]
};



const client = new MongoClient(uri);

//store names - MUST BE SAME AS MONGODB NAME
const stores = ['walgreens', 'cvs', 'hannaford'];


// Define a batch size (e.g., 1000 items per batch)
const BATCH_SIZE = 1000;

async function run() {
   try {
      // Connect to the MongoDB cluster
      await client.connect();

      console.log("Connected successfully to MongoDB");

      // Model for generating vector embeddings
      const model = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

      // Access the inventory database
      const database = client.db('inventory');

      for (let i = 0; i < stores.length; i++) {
         const store = database.collection(stores[i]);

         // Returns items in collection as arrays
         const storeData = await store.find().toArray();
         const storeItemNames = storeData.map(item => item.name);

         console.log(`Processing ${storeItemNames.length} items for ${stores[i]}`);

         for (let start = 0; start < storeItemNames.length; start += BATCH_SIZE) {
            // Slice the items to process in the current batch
            const batchItemNames = storeItemNames.slice(start, start + BATCH_SIZE);
            console.log(`Processing batch ${start / BATCH_SIZE + 1}: ${batchItemNames.length} items`);

            // Generate vector embeddings for the current batch of items
            const embeddings = await model(batchItemNames);

            if (embeddings.data instanceof Float32Array) {
               const nameEmbeddings = averageEmbedding(embeddings);

               // Update each document in the batch with the corresponding embedding
               for (let j = 0; j < nameEmbeddings.length; j++) {
                  const embedding = nameEmbeddings[j];

                  // Update the document with its embedding
                  await store.updateOne(
                     { _id: storeData[start + j]._id },          // Match document by its unique _id
                     { $set: { embedding: embedding } }          // Add or update the 'embedding' field
                  );
               }

               console.log(`Batch ${start / BATCH_SIZE + 1} completed.`);
            } else {
               console.error("Error with embeddings data.");
               break;
            }
         }

         console.log(`${stores[i]} completed.`);
      }
   } finally {
      // Close the connection
      await client.close();
      console.log("All stores updated.");
   }
}

run().catch(console.dir);
