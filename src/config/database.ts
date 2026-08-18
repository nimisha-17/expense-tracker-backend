import mongoose from "mongoose";

const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect("mongodb://localhost:27017/expense-tracker");

    console.log("MongoDB connected successfully.");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

export default connectDatabase;