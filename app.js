import express from "express";
// import path from "path";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { PORT } from "./config/env.js";
import { connectDatabase } from "./database/mongoose.js";
import cors from "cors";
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/users.route.js";
import cityRouter from "./routes/city.route.js";
import commentRouter from "./routes/comment.route.js";
import articleRouter from "./routes/article.route.js";
import authorizeMiddleware from "./middlewares/auth.middleware.js";
import serviceRouter from "./routes/service.route.js";
import errorMiddlewareHandler from "./middlewares/error.middleware.js";

let app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
// app.use(express.static(path.join(__dirname, "public")));
app.use("/api/auth", authRouter);
app.use("/api/user", authorizeMiddleware, userRouter);
app.use("/api/city", cityRouter);
app.use("/api/comments", commentRouter);
app.use("/api/article", articleRouter);
app.use("/api/service", serviceRouter);
app.use(errorMiddlewareHandler);
app.listen(PORT, async () => {
  console.log("listening on Port", PORT);
  await connectDatabase();
});

export default app;
