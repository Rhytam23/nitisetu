
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: 'e:/nitisetu/niti-setu/backend/.env' });

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("MONGODB_URI not found");
  process.exit(1);
}

console.log("Attempting to connect to:", uri.split('@')[1]);

mongoose.connect(uri)
  .then(() => {
    console.log("SUCCESS: Connected to MongoDB");
    process.exit(0);
  })
  .catch((err) => {
    console.error("FAILURE: Connection error:", err.message);
    process.exit(1);
  });
