import express from "express";
import Event from "../models/Event.js"; // Ensure this model is created
const router = express.Router();

// ✅ Fetch all upcoming partner events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 }); // Fetch & sort by date
    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Server error fetching events." });
  }
});

export default router;
