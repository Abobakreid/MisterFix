import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import { JWT_SECRET_KEY, JWT_EXPIRED } from "../config/env.js";

const signIn = async (req, res, next) => {
  try {
    const { name, password } = req.body;
    const existUserName = await User.findOne({
      name: name,
    });

    if (!existUserName) {
      const error = new Error("user not found");
      error.statusCode = 404;
      throw error;
    }
    const comparePassword = await bcrypt.compare(
      password,
      existUserName.password
    );

    if (!comparePassword) {
      const error = new Error("invalid password");
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign({ userId: existUserName._id }, JWT_SECRET_KEY, {
      expiresIn: JWT_EXPIRED,
    });

    res.status(200).json({
      success: true,
      data: {
        user: existUserName,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export { signIn };
