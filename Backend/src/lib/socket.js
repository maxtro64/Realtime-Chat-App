import { Server } from "socket.io";
import http from "http";
import express from "express";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import { createAdapter } from "@socket.io/redis-adapter";
import Redis from "ioredis";

const app = express();
const server = http.createServer(app);

// Get CORS origin from environment, fallback to localhost for development
const getCorsOrigin = () => {
  if (process.env.NODE_ENV === "production") {
    return process.env.FRONTEND_URL || "https://yourdomain.com";
  }
  return ["http://localhost:5173", "http://localhost:3000", "http://localhost:5001"];
};

const io = new Server(server, {
  cors: {
    origin: getCorsOrigin(),
    credentials: true,
    methods: ["GET", "POST"]
  },
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});

// Redis Adapter for Horizontal Scaling
if (process.env.REDIS_URL) {
  const pubClient = new Redis(process.env.REDIS_URL);
  const subClient = pubClient.duplicate();
  io.adapter(createAdapter(pubClient, subClient));
  console.log("Redis adapter connected");
}

// Socket.io Authentication Middleware
io.use((socket, next) => {
  try {
    const cookies = cookie.parse(socket.handshake.headers.cookie || "");
    const token = cookies.jwt;

    if (!token) return next(new Error("No token provided"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

const userSocketMap = {}; // {userId: socketId}

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  const userId = socket.userId;
  if (!userId) return socket.disconnect();
  
  userSocketMap[userId] = socket.id;

  // Optimized Presence: Notify all users about the new online user
  io.emit("userOnline", userId);

  // Send the current online users list ONLY to the new user
  socket.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("typing", ({ receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("userTyping", { senderId: userId });
    }
  });

  socket.on("stopTyping", ({ receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("userStopTyping", { senderId: userId });
    }
  });

  socket.on("disconnect", () => {
    delete userSocketMap[userId];
    io.emit("userOffline", userId);
  });
});

export { io, app, server };