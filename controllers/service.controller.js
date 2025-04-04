import mongoose from "mongoose";
import Service from "../models/service.model.js";
import Article from "../models/article.model.js";

const createService = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { name } = req.body;
    const existService = await Service.findOne({
      name,
    });

    if (existService) {
      const error = new Error("Service already exists");
      error.statusCode = 404;
      throw error;
    }

    const service = await Service.create({
      name,
    });

    res.status(201).json({
      success: true,
      data: service,
    });
    session.commitTransaction();
  } catch (error) {
    next(error);
  } finally {
    session.endSession();
  }
};

const getServices = async (req, res, next) => {
  try {
    const services = await Service.find();
    res.status(201).json({
      success: true,
      data: services,
    });
  } catch (error) {
    next(error);
  }
};

const getService = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error("invalid id");
      error.statusCode = 400;
      throw error;
    }
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const existService = await Service.findById(id);
    if (!existService) {
      const error = new Error("Service not found");
      error.statusCode = 404;
      throw error;
    }

    const total = await Article.countDocuments({ service: existService._id });

    const ServiceArticles = await Article.find({
      service: existService._id,
    })
      .populate("service")
      .populate("city")
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: {
        service: existService,
        articles: ServiceArticles,
        pagination: {
          current_page: page,
          per_page: limit,
          total,
          total_pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateService = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error("invalid id");
      error.statusCode = 400;
      throw error;
    }
    const { name } = req.body;
    const updatedService = await Service.findByIdAndUpdate(
      id,
      {
        $set: {
          name,
        },
      },
      {
        new: true,
      }
    );

    if (!updatedService) {
      const error = new Error("Service not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(201).json({
      success: true,
      data: updatedService,
    });
  } catch (error) {
    next(error);
  }
};

const deleteService = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error("invalid id");
      error.statusCode = 400;
      throw error;
    }
    const deletedService = await Service.findByIdAndDelete(id);

    if (!deletedService) {
      const error = new Error("Service not found");
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

export { getServices, createService, getService, updateService, deleteService };
