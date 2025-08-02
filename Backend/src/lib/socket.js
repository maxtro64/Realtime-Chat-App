import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

// Configuration
const socketConfig = {
  cors: {
    origin: "https://realtime-chat-app-tan-alpha.vercel.app",
    credentials: true
  },
  allowEIO3: true,
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
    skipMiddlewares: true
  }
};

const io = new Server(server, socketConfig);

// Store online users {userId: socketId}
const userSocketMap = {};

// Function to get socket ID of a receiver
export const getReceiverSocketId = (receiverId) => {
  try {
    if (!receiverId) {
      console.error("[Socket] Error: Receiver ID is required");
      return null;
    }
    return userSocketMap[receiverId];
  } catch (error) {
    console.error("[Socket] Error in getReceiverSocketId:", error);
    return null;
  }
};

// Connection event handler
io.on("connection", (socket) => {
  console.log(`[Socket] New connection attempt (ID: ${socket.id})`);
  
  try {
    const userId = socket.handshake.query.userId;
    console.log(`[Socket] Handshake query:`, socket.handshake.query);

    if (!userId) {
      console.warn("[Socket] Connection rejected - missing userId");
      socket.emit("connection_error", {
        message: "User ID is required for connection"
      });
      socket.disconnect(true);
      return;
    }

    console.log(`[Socket] User connected (UserID: ${userId}, SocketID: ${socket.id})`);

    // Store the socket ID
    userSocketMap[userId] = socket.id;
    console.log(`[Socket] Updated userSocketMap:`, userSocketMap);

    // Notify all clients about online users
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    console.log(`[Socket] Emitted online users list`);

    // Error event handler
    socket.on("error", (error) => {
      console.error(`[Socket] Error for user ${userId}:`, error);
    });

    // Disconnect event handler
    socket.on("disconnect", (reason) => {
      console.log(`[Socket] User disconnected (UserID: ${userId}, Reason: ${reason})`);
      
      try {
        if (userId && userSocketMap[userId]) {
          delete userSocketMap[userId];
          console.log(`[Socket] Removed user from userSocketMap`);
          
          // Notify all clients about updated online users
          io.emit("getOnlineUsers", Object.keys(userSocketMap));
          console.log(`[Socket] Emitted updated online users after disconnect`);
        }
      } catch (cleanupError) {
        console.error("[Socket] Error during disconnect cleanup:", cleanupError);
      }
    });

    // Custom disconnect for client-side requests
    socket.on("disconnect_request", () => {
      console.log(`[Socket] Received disconnect request from ${userId}`);
      socket.disconnect(true);
    });

    // Heartbeat monitoring
    let missedPings = 0;
    const heartbeatInterval = setInterval(() => {
      if (missedPings > 2) {
        console.warn(`[Socket] Terminating connection ${socket.id} - unresponsive`);
        socket.disconnect(true);
        clearInterval(heartbeatInterval);
      }
      missedPings++;
      socket.emit("ping");
    }, 15000);

    socket.on("pong", () => {
      missedPings = 0;
    });

    socket.on("connect_error", (err) => {
      console.error(`[Socket] Connection error for ${userId}:`, err.message);
    });

  } catch (connectionError) {
    console.error("[Socket] Error during connection setup:", connectionError);
    socket.disconnect(true);
  }
});

// Server error handling
server.on("error", (error) => {
  console.error("[Server] Error:", error);
});

process.on("uncaughtException", (error) => {
  console.error("[Server] Uncaught Exception:", error);
});

export { io, app, server };
