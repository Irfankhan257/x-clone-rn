import mongoose from "mongoose";
import { ENV } from "./env.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(ENV.MONGO_URI);
    console.log("Connected to MOGODB");
  } catch (error) {
    console.log("Error connecting to the databse");

    process.exit(1);
  }
};
