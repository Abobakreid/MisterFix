import mongoose from "mongoose";
import City from "../models/city.model.js";
import Article from "../models/article.model.js";

const createCity = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { name } = req.body;
    const existCity = await City.findOne({
      name,
    });

    if (existCity) {
      const error = new Error("City already exists");
      error.statusCode = 404;
      throw error;
    }

    const cities = await City.create({
      name,
    });

    res.status(201).json({
      success: true,
      data: cities,
    });
    session.commitTransaction();
  } catch (error) {
    next(error);
  } finally {
    session.endSession();
  }
};

const getCities = async (req, res, next) => {
  try {
    const cities = await City.find();
    res.status(201).json({
      success: true,
      data: cities,
    });
  } catch (error) {
    next(error);
  }
};

const getCity = async (req, res, next) => {
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

    const existCity = await City.findById(id);
    if (!existCity) {
      const error = new Error("City not found");
      error.statusCode = 404;
      throw error;
    }

    const total = await Article.countDocuments({ city: existCity._id });

    const cityArticles = await Article.find({
      city: existCity._id,
    })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: {
        city: existCity,
        articles: cityArticles,
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

const updateCity = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error("invalid id");
      error.statusCode = 400;
      throw error;
    }
    const { name } = req.body;
    const updatedCity = await City.findByIdAndUpdate(
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

    if (!updatedCity) {
      const error = new Error("City not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(201).json({
      success: true,
      data: updatedCity,
    });
  } catch (error) {
    next(error);
  }
};

const deleteCity = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error("invalid id");
      error.statusCode = 400;
      throw error;
    }
    const deletedCity = await City.findByIdAndDelete(id);

    if (!deletedCity) {
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

export { getCities, createCity, getCity, updateCity, deleteCity };
