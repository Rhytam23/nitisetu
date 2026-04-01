import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import eligibilityRoutes from './routes/eligibility.js';
import authRoutes from './routes/auth.js';

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
app.use('/api/auth', authRoutes);

// Start Server
const startServer = async () => {
  // Try to connect to MongoDB if URI is provided
  if (!process.env.MONGODB_URI) {
    console.warn('WARNING: MONGODB_URI not set in .env. Skipping database connection.');
  } else {
    try {
      mongoose.set('bufferCommands', false); // Prevent API endpoints from hanging when DB is down
      await mongoose.connect(process.env.MONGODB_URI, {
          serverSelectionTimeoutMS: 5000 // Timeout fast if IP is blocked
      });
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('WARNING: Failed to connect to MongoDB initially. Server will still start, but database-dependent features may fail:', error.message);
    }
  }

  // Always start the server regardless of DB status
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
