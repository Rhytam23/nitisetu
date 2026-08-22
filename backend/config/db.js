import mongoose from 'mongoose';
import dns from 'dns';
import dotenv from 'dotenv';

dotenv.config();

// Ensure Node.js resolves MongoDB Atlas SRV records reliably across all local network/ISP environments
try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const DATABASE_NAME = 'niti-setu';

export async function connectDB() {
    mongoose.set('bufferCommands', true);

    if (!process.env.MONGODB_URI) {
        console.warn('WARN: MONGODB_URI is not defined in environment variables. Database features will run offline.');
        return false;
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: DATABASE_NAME,
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000
        });
        console.log('Successfully connected to MongoDB Atlas');
        return true;
    } catch (error) {
        console.error('MongoDB Atlas Connection Diagnostic:', {
            message: error.message,
            code: error.code,
            name: error.name,
            reason: error.reason?.message || 'Check Atlas IP Whitelist / Network DNS Settings'
        });
        return false;
    }
}

export function isDBConnected() {
    return mongoose.connection.readyState === 1;
}
