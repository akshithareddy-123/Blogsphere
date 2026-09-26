import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let mongodInstance = null;

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/blogsphere';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[Database] Notice: Local MongoDB connection to ${uri} failed (${error.message}).`);
    console.log('[Database] Checking for in-memory MongoDB fallback or continuing in demo mode...');

    try {
      // Dynamic import of mongodb-memory-server if installed
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`[Database] In-Memory MongoDB connected successfully at ${memUri}!`);
      return conn;
    } catch (memErr) {
      console.warn('[Database] mongodb-memory-server not available, running with mock storage fallback.');
      return null;
    }
  }
};

export default connectDB;
