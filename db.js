import { MongoClient } from 'mongodb';

const url = 'mongodb+srv://CartX:CartXRCOS@cartx.srghpey.mongodb.net/?retryWrites=true&w=majority&appName=CartX';
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
