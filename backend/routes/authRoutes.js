import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// ✅ User Sign-up (Registers Partners - Requires Approval)
router.post("/signup", async (req, res) => {
  try {
    const { fullName, restaurantName, address, phone, email, password } = req.body;

    console.log("🔹 Received sign-up request:", req.body);

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

export default router;
