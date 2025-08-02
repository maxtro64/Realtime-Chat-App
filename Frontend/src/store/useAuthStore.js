import { create } from "zustand";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

// Set your backend base URL depending on the environment
const BASE_URL ="https://realtime-chatty-app-wv5e.onrender.com";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  // ✅ Check if user is logged in (on initial load)
checkAuth: async () => {
  try {
    // Add debug logging before the request
    console.log('Making auth check request...');
    
    const res = await axiosInstance.get("/auth/check", {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Debug the response
    console.log('Auth check successful:', res.data);
    
    set({ authUser: res.data });
    get().connectSocket();
  } catch (error) {
    // Enhanced error logging
    console.error("Full error in checkAuth:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
      config: error.config,
    });
    
    set({ authUser: null });
    
    // Optional: Clear invalid cookie if exists
    if (error.response?.status === 401) {
      document.cookie = 'jwt=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
  } finally {
    set({ isCheckingAuth: false });
  }
},

  // ✅ Signup method
  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },

  // ✅ Login method
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  // ✅ Logout method
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      get().disconnectSocket();
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Logout failed");
    }
  },

  // ✅ Update user profile
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error in updateProfile:", error);
      toast.error(error?.response?.data?.message || "Update failed");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  // ✅ Connect to socket server
connectSocket: () => {
  const { authUser, socket } = get();
  if (!authUser || socket?.connected) return;

  const newSocket = io(BASE_URL, {
    withCredentials: true,
    query: { userId: authUser._id.toString() }, // Force string ID
    autoConnect: true, // ← Add this
    transports: ['websocket'] // ← Force WebSocket
  });

  newSocket.on("connect", () => {
    console.log("Socket connected!"); // Should see this in logs
  });

  newSocket.on("getOnlineUsers", (userIds) => {
    console.log(userIds)
    set({ onlineUsers: userIds.map(String) }); // Ensure strings
  });

  set({ socket: newSocket });
}

  // ✅ Disconnect from socket
  disconnectSocket: () => {
    const socket = get().socket;
    if (socket?.connected) {
      socket.disconnect();
      set({ socket: null, onlineUsers: [] });
    }
  },
}));
