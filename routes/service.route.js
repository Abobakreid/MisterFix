import { Router } from "express";
import {
  createService,
  deleteService,
  getService,
  getServices,
  updateService,
} from "../controllers/service.controller.js";
import authorizeMiddleware from "../middlewares/auth.middleware.js";

const serviceRouter = Router();

serviceRouter.post("/", authorizeMiddleware, createService);
serviceRouter.get("/:id", getService);
serviceRouter.get("/", getServices);
serviceRouter.put("/:id", authorizeMiddleware, updateService);
serviceRouter.delete("/:id", authorizeMiddleware, deleteService);

export default serviceRouter;
