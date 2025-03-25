import express from "express";
import User from "../models/User.js"; // Assuming partners are stored in User model
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// GET all restaurant partners
router.get("/", async (req, res) => {
  try {
    const partners = await User.find({ role: "Partner" }).select("restaurantName _id url");
    res.status(200).json(partners);
  } catch (error) {
    console.error("Error fetching partners:", error);
    res.status(500).json({ message: "Server error, try again later." });
  }
});

// GET partner dashboard data
router.get("/:id/dashboard", authMiddleware, async (req, res) => {
  try {
    const partner = await User.findById(req.params.id);
    
    if (!partner) {
      return res.status(404).json({ message: "Partner not found" });
    }

    // For now, return mock data since we don't have actual reservations and events yet
    const dashboardData = {
      totalReservations: 0,
      pendingReservations: 0,
      totalEvents: 0,
      totalCustomers: 0,
      profile: {
        name: partner.restaurantName,
        address: partner.address,
        phone: partner.phone,
        email: partner.email,
        url: partner.url,
        cuisine: "Not specified", // Add this field to User model if needed
        rating: 0 // Add this field to User model if needed
      },
      recentActivities: []
    };

    res.json(dashboardData);
  } catch (error) {
    console.error("Error fetching partner dashboard:", error);
    res.status(500).json({ message: "Server error, try again later." });
  }
});

export default router;
