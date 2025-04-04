import mongoose from "mongoose";
import Article from "../models/article.model.js";
import { deleteImage } from "../utiles/utlies.js";

const createArticle = async (req, res, next) => {
  try {
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

    let parsedSubArticles = Array.isArray(subArticles)
      ? subArticles
      : JSON.parse(subArticles || "[]");

    if (!Array.isArray(parsedSubArticles)) {
      const error = new Error("subArticles should be an array");
      error.statusCode = 400;
      throw error;
    }

    const mainImage = req.files["image"]?.[0].filename
      ? `/images/${req.files["image"]?.[0].filename}`
      : null;

    const subArticleImages = req.files["subArticleImages"] || [];

    if (!mainImage) {
      const error = new Error("article image not found");
      error.statusCode = 400;
      throw error;
    }
    let imageIndex = 0;
    const subArticlesWithImages = parsedSubArticles.map((subArticle) => {
      if (subArticle.image && imageIndex < subArticleImages.length) {
        const imageFile = subArticleImages[imageIndex];
        imageIndex++;
        return {
          ...subArticle,
          image: `/images/${imageFile.filename}`,
        };
      }
      return {
        ...subArticle,
        image: subArticle.image || "",
      };
    });

    console.log(subArticlesWithImages, "subArticlesWithImages");

    const article = await Article.create({
      title,
      description,
      image: mainImage,
      phone,
      user: userId,
      service: serviceId,
      city: cityId,
      subArticles: subArticlesWithImages,
      whatsUp,
    });

    res.status(201).json({
      success: true,
      data: article,
    });
  } catch (error) {
    next(error);
  }
};

const getArticles = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || null;
    const page = parseInt(req.query.page) || null;
    const skip = (page - 1) * limit;

    const total = await Article.countDocuments();

    if (limit && page) {
      const articles = await Article.find()
        .skip(skip)
        .limit(limit)
        .populate("service")
        .populate("city")
        .populate("user", "name email");
      return res.status(200).json({
        success: true,
        data: articles,
        pagination: {
          current_page: page,
          per_page: limit,
          total,
          total_pages: Math.ceil(total / limit),
        },
      });
    }

    const articles = await Article.find()
      .populate("service")
      .populate("city")
      .populate("user", "name email");

    return res.status(200).json({
      success: true,
      data: articles,
    });
  } catch (error) {
    next(error);
  }
};

const searchArticles = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    const text = req.query.q;

    const total = await Article.countDocuments();

    const articles = await Article.aggregate([
      {
        $lookup: {
          from: "services",
          localField: "service",
          foreignField: "_id",
          as: "service",
        },
      },
      { $unwind: { path: "$service", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "cities",
          localField: "city",
          foreignField: "_id",
          as: "city",
        },
      },
      { $unwind: { path: "$city", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $match: {
          $or: [
            { title: { $regex: text, $options: "i" } },
            { description: { $regex: text, $options: "i" } },
            { "subArticles.title": { $regex: text, $options: "i" } },
            { "subArticles.description": { $regex: text, $options: "i" } },
            { "service.name": { $regex: text, $options: "i" } },
            { "city.name": { $regex: text, $options: "i" } },
          ],
        },
      },
      {
        $project: {
          title: 1,
          description: 1,
          subArticles: 1,
          views: 1,
          phone: 1,
          whatsUp: 1,
          image: 1,
          service: 1,
          city: 1,
          "user.name": 1,
          "user.email": 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
      { $skip: skip },
      { $limit: parseInt(limit) },
    ]);

    return res.status(200).json({
      success: true,
      data: articles,
      pagination: {
        current_page: page,
        per_page: limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
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
      const error = new Error("service not found");
      error.statusCode = 404;
      throw error;
    }
    const relatedArticles = await Article.find({
      service: article.service._id,
    })
      .limit(3)
      .populate("service")
      .populate("city")
      .populate("user", "name email");

    res.status(200).json({
      success: true,
      data: article,
      related: relatedArticles,
    });
  } catch (error) {
    next(error);
  }
};

const getArticleBy = async (req, res, next) => {
  try {
    const { cityId, serviceId } = req.body;
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    if (serviceId && !mongoose.Types.ObjectId.isValid(serviceId)) {
      const error = new Error(" invalid id");
      error.statusCode = 400;
      throw error;
    }

    if (cityId && !mongoose.Types.ObjectId.isValid(cityId)) {
      const error = new Error(" invalid id");
      error.statusCode = 400;
      throw error;
    }

    if (serviceId) {
      const article = await Article.find({
        service: serviceId,
      })
        .skip(skip)
        .limit(limit)
        .populate("service")
        .populate("city")
        .populate("user", "name email");

      if (!article) {
        const error = new Error("City not found");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        success: true,
        data: article,
      });
    }
    if (cityId) {
      const article = await Article.find({
        city: cityId,
      })
        .skip(skip)
        .limit(limit)
        .populate("service")
        .populate("city")
        .populate("user", "name email");
      if (!article) {
        const error = new Error("City not found");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        success: true,
        data: article,
      });
    }
  } catch (error) {
    next(error);
  }
};

const deleteArticle = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error("invalid id");
      error.statusCode = 400;
      throw error;
    }
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error("invalid id");
      error.statusCode = 400;
      throw error;
    }

    const article = await Article.findById(id)
      .populate("service")
      .populate("city")
      .populate("user", "name email");

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

    const mainImage = req.files["image"]?.[0].filename
      ? `/images/${req.files["image"]?.[0].filename}`
      : undefined;

    const subArticleImages = req.files["subArticleImages"] || [];

    let imageIndex = 0;
    const subArticlesWithImages = parsedSubArticles.map((subArticle) => {
      if (
        subArticle.image &&
        !subArticle.image.startsWith("/images") &&
        imageIndex < subArticleImages.length
      ) {
        const imageFile = subArticleImages[imageIndex];
        imageIndex++;
        return {
          ...subArticle,
          image: `/images/${imageFile.filename}`,
        };
      }
      return {
        ...subArticle,
        image: subArticle.image || "",
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
    article.image = mainImage || article.image;
    await article.save();

    if (mainImage) {
      await deleteImage(oldMainImagePath);
    }

    await Promise.all(
      oldSubArticleImagePaths.map(async (oldImagePath) => {
        const isStillUsed = subArticlesWithImages.some(
          (sub) => sub.image === oldImagePath
        );
        if (!isStillUsed) {
          await deleteImage(oldImagePath);
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

const getLimitedArticles = async (req, res, next) => {
  try {
    const articles = await Article.aggregate([
      {
        $lookup: {
          from: "services",
          localField: "service",
          foreignField: "_id",
          as: "service",
        },
      },
      { $unwind: "$service" },
      {
        $lookup: {
          from: "cities",
          localField: "city",
          foreignField: "_id",
          as: "city",
        },
      },
      { $unwind: "$city" },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          "user.name": 1,
          "user.email": 1,
          service: 1,
          city: 1,
          title: 1,
          description: 1,
          views: 1,
          image: 1,
          createdAt: 1,
        },
      },
      {
        $group: {
          _id: "$service._id",
          service: { $first: "$service" },
          articles: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          service: 1,
          articles: { $slice: ["$articles", 10] },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: articles,
    });
  } catch (error) {
    next(error);
  }
};

export {
  createArticle,
  deleteArticle,
  getArticle,
  getArticles,
  searchArticles,
  updateArticle,
  getArticleBy,
  getLimitedArticles,
};
