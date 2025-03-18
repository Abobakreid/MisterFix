import { Router } from "express";
import { signIn } from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post("/signin", signIn);

export default authRouter;
