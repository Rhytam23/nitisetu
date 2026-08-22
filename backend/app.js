import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import eligibilityRoutes from './routes/eligibility.js';
import { isDBConnected } from './config/db.js';
import { globalErrorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

// Production-aware CORS configuration
const corsOptions = {
    origin: process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(',') : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-key']
};

app.use(cors(corsOptions));
app.use(express.json());

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Niti-Setu Backend is running',
    environment: process.env.NODE_ENV || 'development',
    database: isDBConnected() ? 'connected' : 'offline'
  });
});

// Niti-Setu API Sub-router
app.use('/api', eligibilityRoutes);

// Global Error Handler Middleware
app.use(globalErrorHandler);

// Export app for serverless environments (like Vercel / Render)
export default app;
