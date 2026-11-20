const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fittrack_retention';

    console.log(`[Database] Connecting to MongoDB...`);

    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true
    });

    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[Database Warning] MongoDB not available: ${error.message}`);
    console.warn(`[Database] Running in OFFLINE MODE with built-in sample data (15 members pre-loaded).`);
    console.warn(`[Database] To use MongoDB, start mongod locally or set MONGODB_URI in backend/.env to a MongoDB Atlas connection string.`);
    // Don't exit — allow app to run with fallback in-memory store
    return null;
  }
};

module.exports = connectDB;

module.exports = connectDB;
