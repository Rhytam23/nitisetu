import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import eligibilityRoutes from './routes/eligibility.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Niti-Setu Backend is running',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'offline'
  });
});

// Niti-Setu Sub-routers
app.use('/api', eligibilityRoutes);

// Export app for serverless environments (like Vercel)
export default app;
