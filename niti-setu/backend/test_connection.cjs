const { MongoClient } = require('mongodb');
const fs = require('fs');
require('dotenv').config();

async function checkConnection() {
    let log = "";
    const uri = process.env.MONGODB_URI;
    log += `Testing connection to: ${uri.split('@')[1]}\n`;
    const client = new MongoClient(uri);
    try {
        await client.connect();
        log += "Successfully connected to MongoDB Atlas!\n";
        const databases = await client.db().admin().listDatabases();
        log += "Available Databases:\n";
        databases.databases.forEach(db => log += ` - ${db.name}\n`);
    } catch (err) {
        log += `Connection failed: ${err.message}\n`;
    } finally {
        await client.close();
        fs.writeFileSync('connection_log.txt', log);
    }
}

checkConnection();
