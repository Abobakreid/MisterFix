import mongoose from "mongoose";

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      maxLength: 20,
    },
    whatsUp: {
      type: String,
      required: true,
      trim: true,
      maxLength: 20,
    },
    subArticles: [
      {
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        list: [
          {
            item: {
              type: String,
              trim: true,
            },
          },
        ],
        image: { type: String },
      },
    ],
    image: {
      type: String,
      required: true,
    },
    service: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "Service",
      index: true,
    },
    city: {
      type: mongoose.Types.ObjectId,
      ref: "City",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Article = mongoose.model("Article", articleSchema);

export default Article;
