import mongoose from "mongoose";

const mongodb_uri = process.env.MONGODB_URI;
const options = { dbName: process.env.DB_NAME };

export async function connectDB() {
  try {
    await mongoose.connect(mongodb_uri, options);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.log("MongoDB connection error:", error);
    process.exit(1);
  }
}
