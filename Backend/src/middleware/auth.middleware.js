import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    // 1. More robust cookie access
    const token = req.cookies?.jwt || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      // console.log('No token found in cookies or headers');
      return res.status(401).json({ 
        error: "Unauthorized - No Token Provided",
        receivedCookies: req.cookies,
        receivedHeaders: req.headers
      });
    }

    // 2. Enhanced token verification
    const decoded = jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        // console.log('JWT verification error:', err.name);
        throw err; // This will be caught in the catch block
      }
      return decoded;
    });

    // 3. Better user lookup with error handling
    const user = await User.findById(decoded.userId).select("-password").lean();
    if (!user) {
      // console.log(`User ${decoded.userId} not found in database`);
      return res.status(404).json({ 
        error: "User not found",
        decodedToken: decoded // For debugging
      });
    }

    // 4. Properly attach user to request
    req.user = { ...user, _id: user._id.toString() }; // Ensure _id is string
    // console.log(`Authenticated user: ${user._id}`); // Debug log
    
    next();
  } catch (error) {
    console.error("Authentication Error:", error.name, "-", error.message);
    
    // Specific error responses
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: "Invalid token" });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Token expired" });
    }
    
    res.status(500).json({ 
      error: "Authentication failed",
      details: error.message 
    });
  }
};