import mongoose from "mongoose";
import Service from "../models/service.model.js";

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
    const existService = await Service.findById(id);
    if (!existService) {
      const error = new Error("Service not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      data: existService,
    });
  } catch (error) {
    next(error);
  }
};

const updateService = async (req, res, next) => {
  try {
    const id = req.params.id;
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
