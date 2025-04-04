import { Router } from "express";
import {
  createComment,
  deleteComment,
  getComments,
} from "../controllers/comment.controller.js";
import authorizeMiddleware from "../middlewares/auth.middleware.js";

const commentRouter = Router();

commentRouter.post("/", createComment);
commentRouter.get("/", authorizeMiddleware, getComments);
commentRouter.delete("/:id", authorizeMiddleware, deleteComment);

export default commentRouter;
