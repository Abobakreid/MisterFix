import mongoose from "mongoose";

const commentsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    content: {
      type: String,
      required: true,
    },
    article: {
      type: mongoose.Types.ObjectId,
      ref: "Article",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Comment = mongoose.model("Comment", commentsSchema);

export default Comment;
