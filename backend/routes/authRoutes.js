import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";
import nodemailer from "nodemailer";

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

// Request Password Reset
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "No account found with this email address." });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Save reset token to user
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send reset email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request - CNC World Tour",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2c3e50;">Password Reset Request</h2>
          <p>You requested a password reset for your CNC World Tour account.</p>
          <p>Click the button below to reset your password. This link will expire in 1 hour.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #fea116; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "Password reset instructions sent to your email." });
  } catch (error) {
    console.error("Password reset request error:", error);
    res.status(500).json({ message: "Error processing password reset request." });
  }
});

// Reset Password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      _id: decoded.id,
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token." });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password and clear reset token
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: "Password has been reset successfully." });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ message: "Error resetting password." });
  }
});

// Generate and send OTP for password reset
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "No account found with this email address." });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    // Save OTP to user
    user.resetOTP = otp;
    user.resetOTPExpiry = otpExpiry;
    await user.save();

    // Send OTP email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP - CNC World Tour",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://project-cnc-web-portal.onrender.com/logo.png" alt="CNC World Tour" style="width: 120px; height: auto; margin-bottom: 20px;" />
            <h1 style="color: #001524; font-size: 24px; margin-bottom: 10px;">Password Reset Request</h1>
            <div style="width: 60px; height: 4px; background-color: #fea116; margin: 0 auto;"></div>
          </div>

          <div style="background-color: #fdfcdc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
              You requested a password reset for your CNC World Tour account. To proceed with the password reset, please use the OTP below:
            </p>
            
            <div style="background-color: #ffffff; padding: 15px; border-radius: 6px; text-align: center; margin: 20px 0;">
              <p style="color: #666; font-size: 14px; margin-bottom: 10px;">Your OTP is:</p>
              <div style="font-size: 32px; font-weight: bold; color: #fea116; letter-spacing: 5px; padding: 10px;">
                ${otp}
              </div>
            </div>

            <p style="color: #666; font-size: 14px; margin-top: 15px;">
              This OTP will expire in 10 minutes for security reasons.
            </p>
          </div>

          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
            <h3 style="color: #001524; font-size: 16px; margin-bottom: 10px;">Security Tips:</h3>
            <ul style="color: #666; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
              <li>Never share your OTP with anyone</li>
              <li>CNC World Tour will never ask for your OTP via email or phone</li>
              <li>If you didn't request this reset, please ignore this email</li>
            </ul>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px; margin: 0;">
              This is an automated message, please do not reply directly to this email.
            </p>
            <p style="color: #666; font-size: 12px; margin: 5px 0 0 0;">
              © ${new Date().getFullYear()} CNC World Tour. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "OTP sent to your email." });
  } catch (error) {
    console.error("OTP sending error:", error);
    res.status(500).json({ message: "Error sending OTP." });
  }
});

// Verify OTP and reset password
router.post("/verify-otp-reset", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({
      email,
      resetOTP: otp,
      resetOTPExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password and clear OTP
    user.password = hashedPassword;
    user.resetOTP = undefined;
    user.resetOTPExpiry = undefined;
    await user.save();

    res.json({ message: "Password has been reset successfully." });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ message: "Error resetting password." });
  }
});

export default router;
