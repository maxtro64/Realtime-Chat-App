import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

import authRoutes from "./routes/auth.routes.js";
import messagesRoutes from "./routes/message.routes.js";

const app = express();

// Security Middleware
app.use(helmet());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many requests from this IP, please try again after 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: [process.env.FRONTEND_URL, "https://realtime-chat-app-maxtro64s-projects.vercel.app"].filter(Boolean),
    credentials: true,
  })
);

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/messages", messagesRoutes);

if (process.env.NODE_ENV === "production") {
  const __dirname = path.resolve();
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

export default app;
