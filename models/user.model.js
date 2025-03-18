import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "the name of the user required"],
      trim: true,
      unique: true,
      minLength: 5,
      maxLength: 50,
    },
    role: {
      type: String,
      enum: ["admin", "manager"],
      default: "manager",
    },
    password: {
      type: String,
      required: [true, "the password required"],
      trim: true,
      minLength: 8,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
