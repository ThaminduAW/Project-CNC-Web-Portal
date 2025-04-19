import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Get user profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    // Get user from auth middleware
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      user: {
        fullName: user.fullName,
        restaurantName: user.restaurantName,
        address: user.address,
        phone: user.phone,
        email: user.email,
        url: user.url,
        cuisine: user.cuisine,
        operatingHours: user.operatingHours
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// Update user profile
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { fullName, restaurantName, address, phone, url, cuisine, operatingHours } = req.body;
    
    // Get user from auth middleware
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields
    user.fullName = fullName || user.fullName;
    user.restaurantName = restaurantName || user.restaurantName;
    user.address = address || user.address;
    user.phone = phone || user.phone;
    user.url = url || user.url;
    user.cuisine = cuisine || user.cuisine;
    
    // Update operating hours if provided
    if (operatingHours) {
      user.operatingHours = {
        ...user.operatingHours,
        ...operatingHours
      };
    }

    await user.save();

    res.json({ 
      message: 'Profile updated successfully',
      user: {
        fullName: user.fullName,
        restaurantName: user.restaurantName,
        address: user.address,
        phone: user.phone,
        email: user.email,
        url: user.url,
        cuisine: user.cuisine,
        operatingHours: user.operatingHours
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

export default router; 