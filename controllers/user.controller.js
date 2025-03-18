import mongoose from "mongoose";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
const createUser = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { name, password, role } = req.body;
    const existUserName = await User.findOne({
      name: name,
    });

    if (existUserName) {
      const error = new Error("user already exists");
      error.statusCode = 409;
      throw error;
    }

    const slat = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, slat);

    const newUser = await User.create({
      name,
      role,
      password: hashPassword,
    });

    res.status(201).json({
      success: true,
      data: newUser,
    });
    session.commitTransaction();
  } catch (error) {
    session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

const getUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await User.deleteOne({
      _id: id,
    });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { name, role, password } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          name,
          password,
          role,
        },
      },
      {
        new: true,
      }
    );

    if (!updatedUser) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    next(error);
  }
};

export { createUser, getUsers, getUser, deleteUser, updateUser };
