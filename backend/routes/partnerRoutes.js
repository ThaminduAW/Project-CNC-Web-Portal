import express from "express";
import User from "../models/User.js"; 
import Reservation from "../models/Reservation.js";
import Event from "../models/Event.js";
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

    // Get total reservations for this partner
    const totalReservations = await Reservation.countDocuments({ restaurant: partner.restaurantName });

    // Get total events for this partner
    const totalEvents = await Event.countDocuments({ partner: partner._id });

    // Get unique customers (based on email) who made reservations
    const uniqueCustomers = await Reservation.distinct('email', { 
      restaurant: partner.restaurantName 
    });
    const totalCustomers = uniqueCustomers.length;

    // Get recent activities (last 10 reservations)
    const recentReservations = await Reservation.find({ 
      restaurant: partner.restaurantName 
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('name date time status createdAt');

    const recentActivities = recentReservations.map(reservation => ({
      type: 'reservation',
      description: `Reservation for ${reservation.name}`,
      time: new Date(reservation.createdAt).toLocaleString(),
      status: reservation.status
    }));

    const dashboardData = {
      totalReservations,
      totalEvents,
      totalCustomers,
      profile: {
        name: partner.restaurantName,
        address: partner.address,
        phone: partner.phone,
        email: partner.email,
        url: partner.url,
        cuisine: partner.cuisine || "Not specified",
        rating: partner.rating || 0
      },
      recentActivities
    };

    res.json(dashboardData);
  } catch (error) {
    console.error("Error fetching partner dashboard:", error);
    res.status(500).json({ message: "Server error, try again later." });
  }
});

export default router;
