import { MongoClient } from 'mongodb';
import { pipeline } from '@xenova/transformers';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Function to calculate cosine similarity between two vectors
function cosineSimilarity(vecA, vecB) {
   const dotProduct = vecA.reduce((acc, val, idx) => acc + val * vecB[idx], 0);
   const magnitudeA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
   const magnitudeB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
   return dotProduct / (magnitudeA * magnitudeB);
}

const averageEmbedding = (tensor) => {

   // Convert the tensor data to a standard array
   const array = Array.from(tensor.data);

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


//This file will take all the results from the search, and try to group