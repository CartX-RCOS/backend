import { MongoClient } from 'mongodb';
import { pipeline } from '@xenova/transformers';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
const uri = process.env.MONGO_URI;

const averageEmbedding = (tensor) => {

   // Convert the tensor data to a standard array
   const array = Array.from(tensor.data);

   console.log(numItems * numTokens * embeddingSize);

   // Get the dimensions from the tensor
   const [numItems, numTokens, embeddingSize] = tensor.dims;

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
      // Calculate the average embedding for this item by dividing by the number of tokens (20)
      const averagedItemEmbedding = itemEmbedding.map(value => value / numTokens);
      averagedEmbeddings.push(averagedItemEmbedding);  // Store the averaged embedding for this item
   }

   return averagedEmbeddings;  // This will be an array of size [960][384]
};


// Create a new MongoClient
const client = new MongoClient(uri);

//store names - MUST BE SAME AS MONGODB NAME
const stores = ['hannaford', 'walgreens', 'cvs'];

async function run() {
   try {

      // Connect to the MongoDB cluster
      await client.connect();

      console.log("Connected successfully to MongoDB");

      //model for generating vector embeddings
      const model = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

      // Access the inventory
      const database = client.db('inventory');

      for (let i = 0; i < stores.length; i++) {

         //get collections for stores
         const store = database.collection(stores[i]);

         //returns items in collection as arrays
         const storeData = await store.find().toArray();

         //get array of just item names
         const storeItemNames = storeData.map(item => item.name);

         //model will generate vector embeddings for every item
         const embeddings = await model(storeItemNames);

         //expected output of data is a Float32Array
         //each item name in the DB gets tokenized, with each token having a 384-size vector of float values representing it
         if (embeddings.data instanceof Float32Array) {
            
            //get the average vector of the token vectors
            const nameEmbeddings = averageEmbedding(embeddings);

            for (let j = 0; j < storeData.length; j++) {

               // Get the embedding for this item
               const embedding = nameEmbeddings[j];

               // Update the document with its embedding
               await store.updateOne(
                  { _id: storeData[j]._id },          // Match document by its unique _id
                  { $set: { embedding: embedding } }  // Add or update the 'embedding' field
               );
            }

         } else {
            console.error("Error");
         }
         console.log(stores[i] + " completed.")
      }

   } finally {
      // Close the connection
      await client.close();
      console.log("All stores updated.");
   }
}

run().catch(console.dir);