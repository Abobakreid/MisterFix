import { Router } from "express";
import {
  createCity,
  deleteCity,
  getCities,
  getCity,
  updateCity,
} from "../controllers/city.controller.js";
import authorizeMiddleware from "../middlewares/auth.middleware.js";

const cityRouter = Router();

cityRouter.post("/", authorizeMiddleware, createCity);
cityRouter.get("/:id", getCity);
cityRouter.get("/", getCities);
cityRouter.put("/:id", authorizeMiddleware, updateCity);
cityRouter.delete("/:id", authorizeMiddleware, deleteCity);

export default cityRouter;
