import express from "express";
import nodemailer from "nodemailer";
import Reservation from "../models/Reservation.js"; // Corrected import
import User from "../models/User.js"; // Fetch partner email

const router = express.Router();

// POST - Create a reservation
router.post("/", async (req, res) => {
  const { name, email, contact, restaurant, date, time, instructions } = req.body;
  console.log("New Reservation Received:", req.body);

  try {
    // Find the partner's email based on the restaurant name
    const partner = await User.findOne({ restaurantName: restaurant });
    if (!partner) {
      return res.status(400).json({ message: "Selected restaurant not found." });
    }

    // Save reservation in database
    const newReservation = new Reservation({ name, email, contact, restaurant, date, time, instructions });
    await newReservation.save();

    // Email Configuration
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Confirmation Email to the Visitor
    const visitorMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reservation Confirmation - CNC World Tour",
      text: `Hello ${name},\n\nYour reservation at ${restaurant} is confirmed for ${date} at ${time}.\n\nSpecial Instructions: ${instructions || "None"}\n\nThank you for booking with CNC World Tour!`,
    };

    await transporter.sendMail(visitorMailOptions);

    // Email Notification to the Partner
    const partnerMailOptions = {
      from: process.env.EMAIL_USER,
      to: partner.email,
      subject: "New Reservation at Your Restaurant",
      text: `Hello ${partner.fullName},\n\nA new reservation has been made at your restaurant.\n\nDetails:\nName: ${name}\nEmail: ${email}\nDate: ${date}\nTime: ${time}\nContact: ${contact || "Not provided"}\n\nInstructions: ${instructions || "None"}`,
    };

    await transporter.sendMail(partnerMailOptions);

    res.status(201).json({ message: "Reservation confirmed!" });
  } catch (error) {
    console.error("Reservation error:", error);
    res.status(500).json({ message: "Server error. Try again later." });
  }
});

// ✅ Fetch all upcoming reservations
router.get("/", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
    const reservations = await Reservation.find({ date: { $gte: today } }).sort({ date: 1 });

    res.json(reservations);
  } catch (error) {
    console.error("Error fetching reservations:", error);
    res.status(500).json({ message: "Server error fetching reservations." });
  }
});

export default router;
