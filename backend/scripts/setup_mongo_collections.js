import { MongoClient } from 'mongodb';
import dns from 'dns';
import dotenv from 'dotenv';

dotenv.config();

try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

async function setupCollections() {
    console.log("Setting up MongoDB Atlas collections for niti-setu...");
    const client = new MongoClient(process.env.MONGODB_URI);
    try {
        await client.connect();
        const db = client.db('niti-setu');
        
        const existingCollections = (await db.listCollections().toArray()).map(c => c.name);
        console.log("Existing Collections in niti-setu DB:", existingCollections);

        if (!existingCollections.includes('farmers')) {
            await db.createCollection('farmers');
            console.log("✅ Created collection: farmers");
        } else {
            console.log("ℹ️ Collection already exists: farmers");
        }

        if (!existingCollections.includes('scheme_documents')) {
            await db.createCollection('scheme_documents');
            console.log("✅ Created collection: scheme_documents");
        } else {
            console.log("ℹ️ Collection already exists: scheme_documents");
        }

        console.log("DB Structure verification complete!");
    } catch (err) {
        console.error("DB Setup Error:", err.message);
    } finally {
        await client.close();
    }
}

setupCollections();
