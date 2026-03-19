import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import path from "path";

import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.route.js"
import messagesRoutes from "./routes/messages.routes.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.NODE_PORT;
const __dirname = path.resolve();

// Security Middleware
app.use(helmet());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs for auth routes
  message: { message: "Too many requests from this IP, please try again after 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json({ limit: '10mb' })); // Increase from default 100kb
app.use(express.urlencoded({ limit: '10mb', extended: true }));
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
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

server.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
  connectDB();
});