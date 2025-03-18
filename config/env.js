import { config } from "dotenv";

config({ path: `.env.${process.env.NODE_MODE || "development"}.local` });

export const { NODE_MODE, PORT, DATABASE_URI, JWT_SECRET_KEY, JWT_EXPIRED } =
  process.env;
