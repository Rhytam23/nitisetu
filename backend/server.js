import app from './app.js';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5001;

const startServer = async () => {
    const dbSuccess = await connectDB();
    
    app.listen(PORT, () => {
        if (dbSuccess) {
            console.log(`Server running on port ${PORT} (Database Connected)`);
        } else {
            console.log(`Server running in limited mode (DB Offline / Fallback Enabled) on port ${PORT}`);
        }
    });
};

startServer();
