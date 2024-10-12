import { MongoClient } from 'mongodb';
import { pipeline } from '@xenova/transformers';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
const uri = process.env.MONGO_URI;

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

const client = new MongoClient(uri);

const stores = ['hannaford', 'walgreens', 'cvs'];

async function run() {
   try {
      // Connect to the MongoDB cluster
      await client.connect();
      console.log("Connected successfully to MongoDB");

      // Access the database and collection
      const database = client.db('inventory');

      // Load the pre-trained model for embeddings
      const model = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

      //-----------------------------------------------------------------------------------
      //HERE WILL GO API CALL TO GET SEARCH QUERY FROM FRONTEND
      //-----------------------------------------------------------------------------------
      const query = "apple";

      // Convert the corrected query to an embedding
      const queryEmbedding = await model(query);
      const averagedQueryEmbedding = averageEmbedding(queryEmbedding);

      const results = [];

      for (let i = 0; i < stores.length; i++) {
         const store = database.collection(stores[i]);

         const items = await store.find().toArray();

         // Calculate similarity for each item in the database
         items.forEach(item => {
            // Semantic similarity
            const semanticSimilarity = cosineSimilarity(item.embedding, averagedQueryEmbedding[0]);

            const { embedding, ...newItem } = item;

            // Append the result to the results array
            results.push({
               item: newItem,
               similarity: semanticSimilarity,
               store: store
            });
         });
      }


      // Sort results based on similarity in descending order
      results.sort((a, b) => b.similarity - a.similarity);

      const output = results.slice(0, 100).map(result => JSON.stringify(result)).join('\n');
      console.log(output);

   } catch (error) {
      console.error(error);
   } finally {
      // Close the database connection
      await client.close();
   }
}

// Run the main function
run().catch(console.dir);