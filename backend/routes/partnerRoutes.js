import express from "express";
import User from "../models/User.js"; // Assuming partners are stored in User model

const router = express.Router();

// GET all restaurant partners
router.get("/", async (req, res) => {
  try {
    const partners = await User.find({ role: "Partner" }).select("restaurantName _id");
    res.status(200).json(partners);
  } catch (error) {
    console.error("Error fetching partners:", error);
    res.status(500).json({ message: "Server error, try again later." });
  }
});

export default router;
