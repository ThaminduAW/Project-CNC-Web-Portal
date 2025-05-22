import jwt from 'jsonwebtoken';
import User from "../models/User.js";

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user and ensure they exist
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      // Set user in request with both _id and id for compatibility
      req.user = {
        ...user.toObject(),
        id: user._id.toString(),
        _id: user._id
      };

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          message: 'Session expired. Please login again.',
          code: 'TOKEN_EXPIRED'
        });
      }
      
      return res.status(401).json({ 
        message: 'Invalid token',
        error: error.message
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      message: 'Authentication error',
      error: error.message
    });
  }
};

// Alias for verifyToken
export const protect = verifyToken;

// Role-based authorization middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. ${roles.join(' or ')} role required.`
      });
    }

    next();
  };
};

export const verifyPartner = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (req.user.role !== 'Partner') {
      return res.status(403).json({ message: 'Access denied. Partner role required.' });
    }

    next();
  } catch (error) {
    console.error('Partner verification error:', error);
    res.status(500).json({ 
      message: 'Error verifying partner role',
      error: error.message
    });
  }
};

export const verifyAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    next();
  } catch (error) {
    console.error('Admin verification error:', error);
    res.status(500).json({ 
      message: 'Error verifying admin role',
      error: error.message
    });
  }
}; 