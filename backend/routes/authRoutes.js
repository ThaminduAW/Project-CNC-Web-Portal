import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// ✅ User Sign-up (Registers Partners)
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

    // Create new user with "Partner" role
    const newUser = new User({
      fullName,
      restaurantName,
      address: address || "",
      phone: phone || "",
      email,
      password: hashedPassword,
      role: "Partner",
    });

    await newUser.save();
    console.log("✅ New user registered successfully:", newUser.email);
    
    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("❌ Sign-up error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// ✅ User Sign-in (Handles both Admin and Partners)
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🔹 Received sign-in request for email:", email);

    // 🔸 Admin Sign-In
    if (email === "cnc.client@admin.com") {
      if (password !== "Client123=") {
        console.log("❌ Admin login failed: Invalid password.");
        return res.status(400).json({ message: "Invalid admin credentials." });
      }

      const token = jwt.sign({ id: "admin", role: "Admin" }, process.env.JWT_SECRET, { expiresIn: "2h" });

      console.log("✅ Admin logged in successfully.");
      return res.status(200).json({
        token,
        user: { id: "admin", fullName: "Admin", email, role: "Admin" },
      });
    }

    // 🔸 Partner Sign-In
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

    // Generate token for user
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "2h" });

    console.log("✅ User signed in successfully:", user.email);
    res.status(200).json({
      token,
      user: { id: user._id, fullName: user.fullName, email, role: user.role },
    });
  } catch (error) {
    console.error("❌ Sign-in error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

export default router;
