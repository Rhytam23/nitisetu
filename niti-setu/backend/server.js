import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import eligibilityRoutes from './routes/eligibility.js';

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Niti-Setu Backend is running' });
});

// Niti-Setu Sub-routers
app.use('/api', eligibilityRoutes);

// Start Server
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
            
            // Only start the server AFTER the connection is ready
            app.listen(PORT, () => {
                console.log(`Server running on port ${PORT}`);
            });
        } catch (error) {
            console.error('FATAL: Database connection failed. Server will not start:', error.message);
            // In a production environment, you might want to stop here.
            // For now, we still listen so the health check works, but the routes will be blocked.
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
