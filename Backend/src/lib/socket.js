import { Server } from "socket.io";
import http from "http";
import express from "express";
import jwt from "jsonwebtoken"; // Add this to verify token

const app = express();
const server = http.createServer(app);

// Replace with your actual JWT secret
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

const io = new Server(server, {
  cors: {
    origin: "https://realtime-chat-app-tan-alpha.vercel.app", // frontend
    credentials: true,
  },
  allowEIO3: true, // optional, usually for backward compatibility
});

// Store online users {userId: socketId}
const userSocketMap = {};

// Function to get socket ID of a receiver
export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

// Authentication Middleware (optional but recommended)
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    console.log("No token provided");
    return next(new Error("Authentication error"));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.userId = decoded._id;
    return next();
  } catch (err) {
    console.log("Token error:", err.message);
    return next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.userId || socket.handshake.query.userId;

  if (!userId) {
    console.log("Missing userId! Disconnecting socket.");
    socket.disconnect();
    return;
  }

  console.log("User connected via socket:", userId, "with socket ID:", socket.id);

  userSocketMap[userId] = socket.id;

  // Notify all clients about online users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
