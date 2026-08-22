const { MongoClient } = require('mongodb');
const fs = require('fs');
const dns = require('dns');
require('dotenv').config();

try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

async function checkConnection() {
    let log = "";
    const uri = process.env.MONGODB_URI;
    log += `Testing connection to: ${uri.split('@')[1]}\n`;
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    try {
        await client.connect();
        log += "Successfully connected to MongoDB Atlas!\n";
        const adminDb = client.db('admin');
        const dbs = await adminDb.command({ listDatabases: 1 });
        log += "Available Databases:\n";
        if (dbs && dbs.databases) {
            dbs.databases.forEach(db => log += ` - ${db.name}\n`);
        }
    } catch (err) {
        log += `Connection failed: ${err.message}\n`;
    } finally {
        await client.close();
        console.log(log);
        fs.writeFileSync('connection_log.txt', log);
    }
}

checkConnection();
