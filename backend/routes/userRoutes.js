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
        },
      };
      console.log("Sending partner data:", partnerData);
      res.json(partnerData);
    }
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// Update user profile
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user is updating their own profile
    if (req.user.id.toString() !== req.params.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this profile" });
    }

    // If email is being updated, check if it's already in use
    if (req.body.email && req.body.email !== user.email) {
      const emailExists = await User.findOne({ email: req.body.email });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    // Update fields based on user role
    if (user.role === "Admin") {
      const { firstName, lastName, phone, email } = req.body;

      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (phone) user.phone = phone;
      if (email) user.email = email;
    } else {
      const {
        fullName,
        restaurantName,
        address,
        phone,
        url,
        cuisine,
        operatingHours,
      } = req.body;

      if (fullName) user.fullName = fullName;
      if (restaurantName) user.restaurantName = restaurantName;
      if (address) user.address = address;
      if (phone) user.phone = phone;
      if (url) user.url = url;
      if (cuisine) user.cuisine = cuisine;
      if (operatingHours) {
        user.operatingHours = {
          ...user.operatingHours,
          ...operatingHours,
        };
      }
    }

    await user.save();

    // Generate new token if email was updated
    let token;
    if (req.body.email && req.body.email !== user.email) {
      token = jwt.sign(
        {
          id: user._id.toString(),
          role: user.role,
          approved: user.approved,
        },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
      );
    }

    // Return updated user data based on role
    if (user.role === "Admin") {
      const response = {
        message: "Profile updated successfully",
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
        },
      };

      if (token) {
        response.token = token;
      }

      res.json(response);
    } else {
      res.json({
        message: "Profile updated successfully",
        user: {
          fullName: user.fullName,
          restaurantName: user.restaurantName,
          address: user.address,
          phone: user.phone,
          email: user.email,
          url: user.url,
          cuisine: user.cuisine,
          operatingHours: user.operatingHours,
        },
      });
    }
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
