import app from './app.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5001;

// Database connection & listener
const startServer = async () => {
    // Explicitly enable bufferCommands for safer startup
    mongoose.set('bufferCommands', true);

    if (process.env.MONGODB_URI) {
        try {
            await mongoose.connect(process.env.MONGODB_URI, {
                serverSelectionTimeoutMS: 5000,
                connectTimeoutMS: 10000
            });
            console.log('Connected to MongoDB successfully');
            
            app.listen(PORT, () => {
                console.log(`Server running on port ${PORT}`);
            });
        } catch (error) {
            console.error('FATAL DB ERROR Details:', {
                message: error.message,
                code: error.code,
                name: error.name,
                reason: error.reason?.message || 'Check IP Whwhitelist/Atlas settings'
            });
            app.listen(PORT, () => {
                console.log(`Server running in limited mode (DB Offline) on port ${PORT}`);
            });
        }
    } else {
        console.error('ERROR: MONGODB_URI is not defined in env');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT} (WITHOUT DATABASE)`);
        });
    }
};

startServer();
