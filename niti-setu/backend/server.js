import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import eligibilityRoutes from './routes/eligibility.js';

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
  try {
    if (!process.env.MONGODB_URI) {
      console.warn('WARNING: MONGODB_URI not set in .env. Skipping database connection.');
    } else {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('Connected to MongoDB');
    }
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
