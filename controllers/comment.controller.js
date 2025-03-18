import mongoose from "mongoose";
import Article from "../models/article.model.js";
import Comment from "../models/comments.model.js";

const createComment = async (req, res, next) => {
  const session = mongoose.startSession();
  session.startTransaction();
  try {
    const { name, content, articleId } = req.body;

    const existArticle = await Article.findById(articleId);
    if (!existArticle) {
      const error = new Error("user not found");
      error.statusCode = 404;
      throw error;
    }

    const newComment = await Comment.create({
      name,
      content,
      article: articleId,
    });
    res.status(201).json({
      success: true,
      data: newComment,
    });
    await session.commitTransaction();
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
};

const getComments = async (req, res, next) => {
  try {
    const Comments = await Comment.find();
    res.status(200).json({
      success: true,
      data: Comments,
    });
  } catch (error) {
    next(error);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const articleId = req.params.id;

    const newComment = await Comment.deleteOne(articleId);
    res.status(200).json({
      success: true,
      data: newComment,
    });
  } catch (error) {
    next(error);
  }
};

export { createComment, getComments, deleteComment };
