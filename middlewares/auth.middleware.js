import jwt from "jsonwebtoken";
import { JWT_SECRET_KEY } from "../config/env.js";
import User from "../models/user.model.js";

const authorizeMiddleware = async (req, res, next) => {
  try {
    let token;
    const authorization =
      req.headers.authorization || req.headers.Authorization;
    if (authorization || authorization.startsWith("Bearer")) {
      token = authorization.split(" ")[1];
    }

    if (!token)
      return res.status(4001).json({
        message: "unauthorized",
      });

    const decoded = jwt.verify(token, JWT_SECRET_KEY);

    const response = await User.findById(decoded.userId);

    if (!response)
      return res.status(4001).json({
        message: "unauthorized",
      });

    res.user = response;
    next();
  } catch (error) {
    next(error);
  }
};

export default authorizeMiddleware;
