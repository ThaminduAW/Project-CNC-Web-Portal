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
    try {
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
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Continue execution even if email fails
    }

    res.status(201).json({ message: "Reservation confirmed!" });
  } catch (error) {
    console.error("Reservation error:", error);
    res.status(500).json({ message: "Server error. Try again later." });
  }
});

// GET - Fetch all reservations (for admin view)
router.get("/", async (req, res) => {
  try {
    // Check if the request is from admin
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      // If no token, return only upcoming reservations (public view)
      const today = new Date().toISOString().split("T")[0];
      const reservations = await Reservation.find({ date: { $gte: today } }).sort({ date: 1 });
      return res.json(reservations);
    }

    // For admin, return all reservations
    const reservations = await Reservation.find().sort({ date: -1, time: -1 });
    res.json(reservations);
  } catch (error) {
    console.error("Error fetching reservations:", error);
    res.status(500).json({ message: "Server error fetching reservations." });
  }
});

export default router;
