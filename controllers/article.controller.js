import Article from "../models/article.model.js";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";

const createArticle = async (req, res, next) => {
  const image = req.file.filename;

  try {
    const {
      title,
      description,
      serviceId,
      cityId,
      userId,
      subArticles,
      phone,
    } = req.body;

    let parsedSubArticles = Array.isArray(subArticles)
      ? subArticles
      : JSON.parse(subArticles || "[]");

    const mainImage = req.files["image"]?.[0];
    const subArticleImages = req.files["subArticleImages"] || [];

    if (!mainImage) {
      const error = new Error("article image not found");
      error.statusCode = 400;
      throw error;
    }

    const subArticlesWithImages = parsedSubArticles.map((subArticle, index) => {
      const imageFile = subArticleImages[index];
      return {
        ...subArticle,
        image: imageFile.path || "",
      };
    });

    const article = await Article.create({
      title,
      description,
      image,
      phone,
      user: userId,
      service: serviceId,
      city: cityId,
      subArticles: subArticlesWithImages,
    });
    res.status(2001).json({
      success: true,
      data: article,
    });
  } catch (error) {
    next(error);
  }
};

const getArticles = async (req, res, next) => {
  try {
    const articles = await Article.find();
    res.status(200).json({
      success: true,
      data: articles,
    });
  } catch (error) {
    next(error);
  }
};

const getArticle = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error(" invalid id");
      error.statusCode = 400;
      throw error;
    }

    const article = await Article.findByIdAndUpdate(
      id,
      {
        $inc: {
          views: 1,
        },
      },
      {
        new: true,
      }
    );
    if (!article) {
      const error = new Error("City not found");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      success: true,
      data: article,
    });
  } catch (error) {
    next(error);
  }
};

const deleteArticle = async (req, res, next) => {
  try {
    const id = req.params.id;
    const article = await Article.findByIdAndDelete(id);
    if (!article) {
      const error = new Error("City not found");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      success: true,
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

const updateArticle = async (req, res, next) => {
  try {
    const id = req.params.id;
    const {
      title,
      description,
      serviceId,
      cityId,
      userId,
      subArticles,
      phone,
      whatsUp,
    } = req.body;

    const article = await Article.findById(id);
    if (!article) {
      const error = new Error(`Article not found`);
      error.statusCode = 404;
      throw error;
    }

    let parsedSubArticles = Array.isArray(subArticles)
      ? subArticles
      : JSON.parse(subArticles || "[]");

    let oldMainImagePath = article.image;
    const oldSubArticleImagePaths = article.subArticles.map((sub) => sub.image);

    const mainImage = req.files["image"]?.[0];
    const subArticleImages = req.files["subArticleImages"] || [];

    if (!mainImage) {
      const error = new Error("article image not found");
      error.statusCode = 404;
      throw error;
    }

    const subArticlesWithImages = parsedSubArticles.map((subArticle, index) => {
      const imageFile = subArticleImages[index];
      if (!imageFile) {
        throw new Error(`Image missing for subArticle at index ${index}`);
      }
      return {
        ...subArticle,
        image: imageFile.path,
      };
    });

    article.title = title || article.title;
    article.description = description || article.description;
    article.phone = phone || article.phone;
    article.whatsUp = whatsUp || article.whatsUp;
    article.service = serviceId || article.service;
    article.city = cityId || article.city;
    article.user = userId || article.user;
    article.subArticles = subArticlesWithImages;
    article.image = mainImage.path || article.image;
    await article.save();
    if (mainImage && oldMainImagePath !== article.image) {
      const fullOldPath = path.join(__dirname, oldMainImagePath);
      if (fs.existsSync(fullOldPath)) {
        await fs.unlink(fullOldPath);
      }
    }

    await Promise.all(
      oldSubArticleImagePaths.map(async (imagePath) => {
        const fullPath = path.join(__dirname, imagePath);
        if (fs.existsSync(fullPath)) {
          await fs.unlink(fullPath);
        }
      })
    );

    if (!article) {
      const error = new Error("article not found");
      error.status = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      data: article,
    });
  } catch (error) {
    next(error);
  }
};

export { getArticles, getArticle, deleteArticle, createArticle, updateArticle };
