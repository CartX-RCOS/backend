import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.MONGO_URI;
const client = new MongoClient(url);

async function connect() {
    try {
        await client.connect();
        console.log("Connected successfully to MongoDB");
        return client.db('CartX'); 
    } catch (e) {
        console.error(e);
    }
}

export const db = await connect();
