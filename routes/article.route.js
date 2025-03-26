import { Router } from "express";
import {
  createArticle,
  deleteArticle,
  getArticle,
  getArticleBy,
  getArticles,
  getLimitedArticles,
  searchArticles,
  updateArticle,
} from "../controllers/article.controller.js";
import authorizeMiddleware from "../middlewares/auth.middleware.js";
import { fileFilter, storage } from "../config/multerConfig.js";
import multer from "multer";
const upload = multer({ storage: storage, fileFilter: fileFilter });
const articleRouter = Router();

articleRouter.post(
  "/",
  authorizeMiddleware,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "subArticleImages", maxCount: 10 },
  ]),
  createArticle
);

articleRouter.post("/getArticleBy", getArticleBy);
articleRouter.get("/limited", getLimitedArticles);
articleRouter.get("/", getArticles);
articleRouter.get("/search", searchArticles);
articleRouter.get("/:id", getArticle);
articleRouter.delete("/:id", authorizeMiddleware, deleteArticle);

articleRouter.put(
  "/:id",
  authorizeMiddleware,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "subArticleImages", maxCount: 10 },
  ]),
  updateArticle
);

export default articleRouter;
