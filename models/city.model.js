import mongoose from "mongoose";

const citiesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const City = mongoose.model("City", citiesSchema);

export default City;
