import { Router } from "express";
import { createComment } from "../controllers/comment.controller.js";
import authorizeMiddleware from "../middlewares/auth.middleware.js";

const commentRouter = Router();

commentRouter.post("/", createComment);
commentRouter.get("/", authorizeMiddleware, createComment);
commentRouter.delete("/:id", authorizeMiddleware, createComment);

export default commentRouter;
