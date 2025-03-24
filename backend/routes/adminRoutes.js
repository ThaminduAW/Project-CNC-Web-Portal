import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";
import nodemailer from "nodemailer";

const router = express.Router();

// Create default admin if not exists
const createDefaultAdmin = async () => {
  try {
    const adminEmail = "cnc.client@admin.com";
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("Client123=", 10);
      const admin = new User({
        fullName: "Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "Admin",
        approved: true
      });
      await admin.save();
      console.log("✅ Default admin account created");
    }
  } catch (error) {
    console.error("Error creating default admin:", error);
  }
};

createDefaultAdmin();

// ✅ User Sign-in
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // Compare password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // For partners, check approval status
    if (user.role === "Partner" && !user.approved) {
      return res.status(403).json({ message: "Your account is pending admin approval." });
    }

    // Generate token for user
    const token = jwt.sign(
      { id: user._id, role: user.role, approved: user.approved },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        approved: user.approved,
        restaurantName: user.restaurantName
      },
    });
  } catch (error) {
    console.error("Sign-in error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// ✅ GET - Fetch all partners (approved & pending)
router.get("/partners", authMiddleware, async (req, res) => {
  try {
    const partners = await User.find({ role: "Partner" });
    res.json(partners);
  } catch (error) {
    console.error("Error fetching partners:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ PATCH - Approve a partner
router.patch("/partners/approve/:id", authMiddleware, async (req, res) => {
  try {
    const updatedPartner = await User.findByIdAndUpdate(
      req.params.id,
      { approved: true },
      { new: true }
    );

    // Send approval email notification
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: updatedPartner.email,
        subject: "Your Partner Account Has Been Approved - CNC World Tour",
        text: `Dear ${updatedPartner.fullName},\n\nWe are pleased to inform you that your partner account has been approved. You can now log in to your partner dashboard and start managing your restaurant.\n\nRestaurant Name: ${updatedPartner.restaurantName}\n\nPlease visit http://localhost:5173/signin to access your account.\n\nBest regards,\nCNC World Tour Team`,
      };

      await transporter.sendMail(mailOptions);
      console.log("Approval email sent successfully to:", updatedPartner.email);
    } catch (emailError) {
      console.error("Failed to send approval email:", emailError);
      // Continue execution even if email fails
    }

    res.json(updatedPartner);
  } catch (error) {
    console.error("Error approving partner:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ DELETE - Decline a pending partner (before approval)
router.delete("/partners/decline/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Partner registration declined successfully" });
  } catch (error) {
    console.error("Error declining partner:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ PATCH - Update an approved partner's details
router.patch("/partners/update/:id", async (req, res) => {
  try {
    const { fullName, restaurantName, address, phone } = req.body;
    const updatedPartner = await User.findByIdAndUpdate(
      req.params.id,
      { fullName, restaurantName, address, phone },
      { new: true }
    );
    res.json(updatedPartner);
  } catch (error) {
    console.error("Error updating partner:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ DELETE - Remove an approved partner
router.delete("/partners/delete/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Partner deleted successfully" });
  } catch (error) {
    console.error("Error deleting partner:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Admin Adds a New Partner
router.post("/partners/add", async (req, res) => {
  try {
    const { fullName, restaurantName, address, phone, email, password, url } = req.body;

    // Validate required fields
    if (!fullName || !restaurantName || !address || !phone || !email || !password || !url) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (err) {
      return res.status(400).json({ message: "Please enter a valid URL." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newPartner = new User({
      fullName,
      restaurantName,
      address,
      phone,
      email,
      password: hashedPassword,
      url,
      role: "Partner",
      approved: true, // Admin-added partners are automatically approved
    });

    await newPartner.save();

    // Send welcome email to the new partner
    try {
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
        subject: "Welcome to CNC World Tour - Your Partner Account is Ready",
        text: `Dear ${fullName},\n\nWelcome to CNC World Tour! Your partner account has been created and is ready to use.\n\nRestaurant Name: ${restaurantName}\n\nYou can now log in to your partner dashboard and start managing your restaurant.\n\nPlease visit http://localhost:5173/signin to access your account.\n\nBest regards,\nCNC World Tour Team`,
      };

      await transporter.sendMail(mailOptions);
      console.log("Welcome email sent successfully to:", email);
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Continue execution even if email fails
    }

    res.status(201).json({ 
      message: "Partner added successfully.", 
      newPartner: {
        _id: newPartner._id,
        fullName: newPartner.fullName,
        restaurantName: newPartner.restaurantName,
        email: newPartner.email,
        role: newPartner.role,
        approved: newPartner.approved
      }
    });
  } catch (error) {
    console.error("Error adding partner:", error);
    res.status(500).json({ message: "Server error adding partner." });
  }
});

// Get list of admins
router.get("/list", authMiddleware, async (req, res) => {
  try {
    const admins = await User.find({ role: "Admin" })
      .select("fullName email _id");
    res.json(admins);
  } catch (error) {
    console.error("Error fetching admins:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
