import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  console.log("🔐 Checking user authentication...");
  
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      console.log("❌ No authorization header provided");
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    // Extract token from Bearer format
    const token = authHeader.split(" ")[1];
    if (!token) {
      console.log("❌ Invalid token format");
      return res.status(401).json({ message: "Access denied. Invalid token format." });
    }

    // Prevent repeated logs for token verification
    if (!req.tokenVerified) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("✅ Token verified:", decoded);
      req.tokenVerified = true; // Set flag to true
    }

    // For admin users, we don't need to fetch from database
    if (decoded.role === "Admin" && decoded.id === "admin") {
      req.user = decoded;
      console.log("✅ Admin user authenticated");
      return next();
    }

    // For partners, fetch the complete user object from database
    const user = await User.findById(decoded.id);
    if (!user) {
      console.log("❌ User not found in database");
      return res.status(401).json({ message: "User not found." });
    }

    // Check if partner is approved
    if (user.role === "Partner" && !user.approved) {
      console.log("❌ Partner not approved");
      return res.status(403).json({ message: "Account pending approval." });
    }

    // Set complete user object in request
    req.user = {
      _id: user._id,
      role: user.role,
      approved: user.approved
    };
    
    console.log("✅ User authenticated:", req.user);
    next();
  } catch (error) {
    console.error("❌ Authentication error:", error.message);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token." });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired." });
    }
    res.status(500).json({ message: "Authentication error." });
  }
};

export default authMiddleware;
