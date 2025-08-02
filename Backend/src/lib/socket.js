import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://realtime-chat-app-tan-alpha.vercel.app",
    credentials: true
  },
  allowEIO3: true
});

// Store online users {userId: socketId}
const userSocketMap = {};

// Function to get socket ID of a receiver
export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User connected via socket:", userId);
  if (!userId) {
    console.log("Missing userId! Disconnecting socket.");
    socket.disconnect();
    return;
  }
  console.log("A user connected", socket.id);

  
  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
