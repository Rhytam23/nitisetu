import mongoose from 'mongoose';

const uri = "mongodb+srv://2020sumoy:KSTj8DXv0lnBTq2J@mysandbox.rmoycgw.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(uri)
  .then(() => {
    console.log("Successfully connected!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Connection error details:", err);
    process.exit(1);
  });
