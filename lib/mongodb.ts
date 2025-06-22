import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env");
}

// Define a type for the cached connection
type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// Attach it to the global object with optional chaining
declare global {
  var _mongooseCache: MongooseCache | undefined;
}

// Initialize the cache if not already done
const globalCache: MongooseCache = global._mongooseCache ?? {
  conn: null,
  promise: null,
};

global._mongooseCache = globalCache;

async function connectDB(): Promise<typeof mongoose> {
  if (globalCache.conn) {
    console.log("✅ Already connected to MongoDB");
    return globalCache.conn;
  }

  if (!globalCache.promise) {
    console.log("🔄 Connecting to MongoDB...");
    globalCache.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  try {
    globalCache.conn = await globalCache.promise;
    console.log("✅ Connected to MongoDB successfully");
  } catch (error) {
    globalCache.promise = null;
    console.error("❌ Failed to connect to MongoDB", error);
    throw error;
  }

  return globalCache.conn;
}

export default connectDB;
