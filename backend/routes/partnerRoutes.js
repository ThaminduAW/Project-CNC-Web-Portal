import express from "express";
import User from "../models/User.js";
import Reservation from "../models/Reservation.js";
import Tour from "../models/Tour.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { 
  getPartnerProfile, 
  updatePartnerProfile,
  getPreviousCustomers,
  sendPromotionalNotifications,
  updatePartnerImages
} from '../controllers/partnerController.js';
import upload from "../middleware/upload.js";
import Menu from "../models/Menu.js";

const router = express.Router();

// GET all restaurant partners
router.get("/", async (req, res) => {
  try {
    const partners = await User.find({ role: "Partner" }).select("restaurantName _id url restaurantPhoto fullName address phone email operatingHours");
    res.status(200).json(partners);
  } catch (error) {
    console.error("Error fetching partners:", error);
    res.status(500).json({ message: "Server error, try again later." });
  }
});

// GET partner dashboard data
router.get("/:id/dashboard", authMiddleware, async (req, res) => {
  try {
    // console.log("Fetching dashboard for partner ID:", req.params.id);
    const partner = await User.findById(req.params.id);
    
    if (!partner) {
      console.log("Partner not found with ID:", req.params.id);
      return res.status(404).json({ message: "Partner not found" });
    }

    console.log("Found partner:", partner.restaurantName);
    
    // Get total reservations for this partner using the partner's ID
    const totalReservations = await Reservation.countDocuments({ restaurant: partner._id });
    // console.log("Total reservations:", totalReservations);

    // Get total tours for this partner
    const totalTours = await Tour.countDocuments({ partner: partner._id });
    // console.log("Total tours:", totalTours);

    // Get unique customers (based on email) who made reservations
    const uniqueCustomers = await Reservation.distinct('email', { 
      restaurant: partner._id 
    });
    const totalCustomers = uniqueCustomers.length;
    // console.log("Total customers:", totalCustomers);

    // Get recent activities (last 10 reservations)
    const recentReservations = await Reservation.find({ 
      restaurant: partner._id 
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('name date timeSlot status createdAt');

    const recentActivities = recentReservations.map(reservation => ({
      type: 'reservation',
      description: `Reservation for ${reservation.name}`,
      time: new Date(reservation.createdAt).toLocaleString(),
      status: reservation.status
    }));

    const dashboardData = {
      totalReservations,
      totalTours,
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
    console.error("Detailed error in partner dashboard:", {
      message: error.message,
      stack: error.stack,
      partnerId: req.params.id
    });
    res.status(500).json({ 
      message: "Server error, try again later.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get partner profile
router.get('/profile', authMiddleware, getPartnerProfile);

// Update partner profile
router.put('/profile', authMiddleware, updatePartnerProfile);

// Update partner images
router.put('/images', 
  authMiddleware, 
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'images', maxCount: 5 }
  ]), 
  updatePartnerImages
);

// Add new routes
router.get('/:partnerId/customers', authMiddleware, getPreviousCustomers);
router.post('/:partnerId/notifications', authMiddleware, sendPromotionalNotifications);

// GET single restaurant partner by ID (public)
router.get("/:id", async (req, res) => {
  try {
    const partner = await User.findById(req.params.id).select("restaurantName _id url restaurantPhoto fullName address phone email operatingHours cuisine about features cookingServices");
    if (!partner) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    // Ensure cookingServices is always an array
    const partnerObj = partner.toObject();
    if (!partnerObj.cookingServices) partnerObj.cookingServices = [];
    res.status(200).json(partnerObj);
  } catch (error) {
    console.error("Error fetching partner by ID:", error);
    res.status(500).json({ message: "Server error, try again later." });
  }
});

// Get all menu items (cooking services) for a restaurant
router.get("/:id/menu", async (req, res) => {
  try {
    const menuItems = await Menu.find({ partner: req.params.id });
    res.status(200).json(menuItems);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ message: "Failed to fetch menu items" });
  }
});

export default router;
