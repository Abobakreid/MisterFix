import mongoose from "mongoose";
import { DATABASE_URI, NODE_MODE } from "../config/env.js";

if (!DATABASE_URI) {
  console.log(DATABASE_URI, "DATABASE_URI");
  console.error("Error connecting to database");
}

export const connectDatabase = async () => {
  try {
    await mongoose.connect(DATABASE_URI);
    console.log(`Connected to database ${NODE_MODE} mode`);
  } catch (error) {
    console.error("Error connecting to database", error);
    process.exit(1);
  }
};
