import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import path from "path";

import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.route.js"
import messagesRoutes from "./routes/messages.routes.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.NODE_PORT;


app.use(express.json({ limit: '10mb' })); // Increase from default 100kb
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://realtime-chat-app-tan-alpha.vercel.app",
    credentials: true,
    exposedHeaders: ['set-cookie']
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messagesRoutes);



server.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
  connectDB();
});
