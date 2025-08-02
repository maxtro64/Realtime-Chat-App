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

  checkAuth: async () => {
   try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");

    const res = await axiosInstance.get("/auth/check", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    set({ authUser: res.data.user });
    get().connectSocket();
  } catch (error) {
    console.error("Auth check failed:", error);
    set({ authUser: null });
    localStorage.removeItem("token");
  } finally {
    set({ isCheckingAuth: false });
  }
  },

  signup: async (data) => {
set({ isSigningUp: true });
  try {
    const res = await axiosInstance.post("/auth/signup", data);
    
    // Save token to localStorage
    localStorage.setItem("token", res.data.token);

    // Set authUser from response
    set({ authUser: res.data.user });

    toast.success("Account created successfully");

    // Connect socket after successful signup
    get().connectSocket();
  } catch (error) {
    toast.error(error?.response?.data?.message || "Signup failed");
  } finally {
    set({ isSigningUp: false });
  }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);

       localStorage.setItem("token", res.data.token);
      
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
    localStorage.removeItem("token"); // remove token from localStorage
    await axiosInstance.post("/auth/logout"); // optional if you're cleaning up on backend
    set({ authUser: null });
    get().disconnectSocket();
    toast.success("Logged out successfully");
  } catch (error) {
    toast.error(error?.response?.data?.message || "Logout failed");
  }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error?.response?.data?.message || "Update failed");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser, socket } = get();
    if (!authUser || socket?.connected) return;

    const newSocket = io(BASE_URL, {
      withCredentials: true,
       query: {
    userId: authUser?._id, // make sure this is set
  } ,
      transports: ['websocket'],
      reconnectionAttempts: 3
    });

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
    });

    newSocket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds.map(String) });
    });

    newSocket.on("connect_error", (err) => {
      console.error("Connection error:", err.message);
    });

    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.off("getOnlineUsers");
      socket.disconnect();
      set({ socket: null, onlineUsers: [] });
    }
  }
}));
