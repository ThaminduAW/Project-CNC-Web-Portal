import express from "express";
import User from "../models/User.js";

const router = express.Router();

// ✅ User Sign-in (Fix: Approved Users Can Sign In)
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

      const token = jwt.sign(
        { id: "admin", role: "Admin" },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
      );

      console.log("✅ Admin logged in successfully.");
      return res.status(200).json({
        token,
        user: {
          id: "admin",
          fullName: "Admin",
          email,
          role: "Admin",
          approved: true,
        },
      });
    }

    // 🔸 Partner Sign-In
    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ Sign-in failed: Email not found.");
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // ✅ Fix: Only prevent sign-in if the user is **NOT** approved
    if (user.role === "Partner" && user.approved === false) {
      console.log("❌ Sign-in failed: User not approved by admin.");
      return res
        .status(403)
        .json({ message: "Your account is pending admin approval." });
    }

    // Compare password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Sign-in failed: Incorrect password.");
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // Generate token for user
    const token = jwt.sign(
      { id: user._id, role: user.role, approved: user.approved },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    console.log("✅ User signed in successfully:", user.email);
    res.status(200).json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email,
        role: user.role,
        approved: user.approved,
      },
    });
  } catch (error) {
    console.error("❌ Sign-in error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// ✅ GET - Fetch all partners (approved & pending)
router.get("/partners", async (req, res) => {
  try {
    const partners = await User.find({ role: "Partner" });
    res.json(partners);
  } catch (error) {
    console.error("Error fetching partners:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ PATCH - Approve a partner
router.patch("/partners/approve/:id", async (req, res) => {
  try {
    const updatedPartner = await User.findByIdAndUpdate(
      req.params.id,
      { approved: true },
      { new: true }
    );
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

export default router;
