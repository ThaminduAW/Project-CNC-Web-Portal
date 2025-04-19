import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ User Sign-up (Registers Partners - Requires Approval)
router.post("/signup", async (req, res) => {
  try {
    const { fullName, restaurantName, address, phone, email, password, url } = req.body;

    console.log("🔹 Received sign-up request:", req.body);

    // Validate required fields
    if (!url) {
      console.log("❌ Sign-up failed: URL is required.");
      return res.status(400).json({ message: "Restaurant URL is required." });
    }

    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("❌ Sign-up failed: Email already exists.");
      return res.status(400).json({ message: "Email already in use." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with "Partner" role and "approved: false"
    const newUser = new User({
      fullName,
      restaurantName,
      address: address || "",
      phone: phone || "",
      email,
      password: hashedPassword,
      url, // URL is required, no fallback needed
      role: "Partner",
      approved: false, // ✅ Requires admin approval
    });

    await newUser.save();
    console.log("✅ New partner registration submitted for approval:", newUser.email);
    
    res.status(201).json({ message: "Registration submitted for approval. Admin will review your request." });
  } catch (error) {
    console.error("❌ Sign-up error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// ✅ User Sign-in
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🔹 Received sign-in request for email:", email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ Sign-in failed: Email not found.");
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // Compare password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Sign-in failed: Incorrect password.");
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // For partners, check approval status
    if (user.role === "Partner" && !user.approved) {
      console.log("❌ Sign-in failed: User not approved by admin.");
      return res.status(403).json({ message: "Your account is pending admin approval." });
    }

    // Generate token for user with proper ID
    const token = jwt.sign(
      { 
        id: user._id.toString(), // Ensure ID is a string
        role: user.role,
        approved: user.approved 
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    console.log("✅ User signed in successfully:", user.email);
    res.status(200).json({
      token,
      user: {
        id: user._id.toString(), // Ensure ID is a string
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        approved: user.approved,
        restaurantName: user.restaurantName
      },
    });
  } catch (error) {
    console.error("❌ Sign-in error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// ✅ Change Password
router.put("/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    // Get user from auth middleware
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    user.password = hashedPassword;
    await user.save();

    // Generate new token with updated user info
    const token = jwt.sign(
      { 
        id: user._id.toString(),
        role: user.role,
        approved: user.approved 
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({ 
      message: 'Password updated successfully',
      token // Send new token to client
    });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

export default router;
