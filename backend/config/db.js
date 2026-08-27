import mongoose from 'mongoose';

let mongoMemoryServer = null;

const connectDB = async () => {
  try {
    const dbUri = process.env.MONGODB_URI;
    
    if (!dbUri) {
      console.log('No MONGODB_URI provided. Starting Mongo Memory Server fallback...');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const uri = mongoMemoryServer.getUri();
      process.env.MONGODB_URI = uri; // Expose uri for seed scripts
      const conn = await mongoose.connect(uri);
      console.log(`In-Memory MongoDB Connected: ${conn.connection.host}`);
      return;
    }

    try {
      // Connect to the configured URI with a 3-second selection timeout to fail-fast if down
      const conn = await mongoose.connect(dbUri, {
        serverSelectionTimeoutMS: 3000,
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (localErr) {
      // Fallback only if configured URI points to localhost/127.0.0.1
      if (dbUri.includes('127.0.0.1') || dbUri.includes('localhost')) {
        console.warn(`Local MongoDB not running (${localErr.message}). Starting Mongo Memory Server fallback...`);
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        mongoMemoryServer = await MongoMemoryServer.create();
        const uri = mongoMemoryServer.getUri();
        process.env.MONGODB_URI = uri; // Expose uri for seed scripts
        const conn = await mongoose.connect(uri);
        console.log(`In-Memory MongoDB Connected: ${conn.connection.host}`);
      } else {
        throw localErr;
      }
    }
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
