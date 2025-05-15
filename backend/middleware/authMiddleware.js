import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  try {
    // Try to get token from Authorization header
    const authHeader = req.headers.authorization || req.header("Authorization");
    
    if (!authHeader) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    // Extract token from Bearer format
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Access denied. Invalid token format." });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // For admin users, we still need to fetch from database to get full profile
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    // Check if partner is approved
    if (user.role === "Partner" && !user.approved) {
      return res.status(403).json({ message: "Account pending approval." });
    }

    // Set complete user object in request
    req.user = {
      id: user._id.toString(),
      role: user.role,
      approved: user.approved
    };
    
    next();
  } catch (error) {
    // console.error('Auth middleware error:', error);
    // if (error.name === "JsonWebTokenError") {
    //   return res.status(401).json({ message: "Invalid token." });
    // }
    // if (error.name === "TokenExpiredError") {
    //   return res.status(401).json({ message: "Token expired." });
    // }
    // res.status(500).json({ message: "Authentication error." });
  }
};

export default authMiddleware;
