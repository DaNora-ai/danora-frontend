import { MongoClient } from 'mongodb';

const uri = "mongodb://danora:danora@34.44.230.187:27017/";
const client = new MongoClient(uri);

export const insertToMongoDB = async () => {
    try {
        const response = await fetch('http://34.44.230.187:3001/api/insert', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        if (!data.success) {
            throw new Error(data.error);
        }
        
        console.log("Successfully inserted document:", data.result);
        return data.result;
    } catch (error) {
        console.error("Error inserting to MongoDB:", error);
        throw error;
    }
}; 