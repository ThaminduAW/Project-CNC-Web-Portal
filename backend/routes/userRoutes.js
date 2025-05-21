import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

// Get user profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    // Get user from auth middleware
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return different fields based on user role
    if (user.role === "Admin") {
      const adminData = {
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
        },
      };
      res.json(adminData);
    } else {
      // Build full photo URL if restaurantPhoto exists
      let restaurantPhotoUrl = '';
      if (user.restaurantPhoto) {
        const protocol = req.protocol;
        const host = req.get('host');
        restaurantPhotoUrl = `${protocol}://${host}${user.restaurantPhoto}`;
      }
      const partnerData = {
        user: {
          fullName: user.fullName,
          restaurantName: user.restaurantName,
          address: user.address,
          phone: user.phone,
          email: user.email,
          url: user.url,
          cuisine: user.cuisine,
          operatingHours: user.operatingHours,
          about: user.about,
          features: user.features,
          cookingServices: user.cookingServices,
          restaurantPhoto: restaurantPhotoUrl
        },
      };
      // console.log("Sending partner data:", partnerData);
      res.json(partnerData);
    }
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// Update user profile
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields based on user role
    if (user.role === "Admin") {
      const { firstName, lastName, phone } = req.body;
      user.firstName = firstName;
      user.lastName = lastName;
      user.phone = phone;
    } else {
      const {
        fullName,
        restaurantName,
        address,
        phone,
        cuisine,
        operatingHours,
        about,
        features,
        cookingServices
      } = req.body;

      user.fullName = fullName;
      user.restaurantName = restaurantName;
      user.address = address;
      user.phone = phone;
      user.cuisine = cuisine;
      user.operatingHours = operatingHours;
      user.about = about;
      user.features = features;
      user.cookingServices = cookingServices;
    }

    await user.save();
    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// Change password
router.put("/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Password change error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

export default router;
