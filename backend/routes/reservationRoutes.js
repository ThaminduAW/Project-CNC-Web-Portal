import express from "express";
import nodemailer from "nodemailer";
import Reservation from "../models/Reservation.js"; // Corrected import
import User from "../models/User.js"; // Fetch partner email
import jwt from "jsonwebtoken";

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

// GET - Fetch partner-specific reservations
router.get("/partner", async (req, res) => {
  console.log("Partner route hit");
  try {
    // Get the partner's ID from the authenticated user
    const token = req.headers.authorization?.split(' ')[1];
    console.log("Token received:", token ? "Yes" : "No");
    
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Find the partner by their ID (which should be stored in the token)
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decodedToken);
    
    const partner = await User.findById(decodedToken.id);
    console.log("Partner found:", partner ? "Yes" : "No");
    
    if (!partner) {
      return res.status(404).json({ message: "Partner not found" });
    }

    // Fetch reservations for the partner's restaurant
    const reservations = await Reservation.find({ restaurant: partner.restaurantName })
      .sort({ date: -1, time: -1 });
    console.log("Reservations found:", reservations.length);

    // Format the response to include only necessary fields
    const formattedReservations = reservations.map(reservation => ({
      _id: reservation._id,
      customerName: reservation.name,
      customerEmail: reservation.email,
      date: reservation.date,
      time: reservation.time,
      numberOfGuests: reservation.numberOfGuests || 1,
      status: reservation.status || 'pending',
      instructions: reservation.instructions
    }));

    res.json(formattedReservations);
  } catch (error) {
    console.error("Error in partner route:", error);
    res.status(500).json({ message: "Server error fetching partner reservations." });
  }
});

// PUT - Update reservation status
router.put("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Verify the token and get partner info
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const partner = await User.findById(decodedToken.id);

    if (!partner) {
      return res.status(404).json({ message: "Partner not found" });
    }

    // Find the reservation
    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    // Verify that the reservation belongs to the partner's restaurant
    if (reservation.restaurant !== partner.restaurantName) {
      return res.status(403).json({ message: "Not authorized to update this reservation" });
    }

    // Update the status
    reservation.status = status;
    await reservation.save();

    // Send email notification to customer about status update
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const emailOptions = {
        from: process.env.EMAIL_USER,
        to: reservation.email,
        subject: `Reservation ${status.charAt(0).toUpperCase() + status.slice(1)} - CNC World Tour`,
        text: `Hello ${reservation.name},\n\nYour reservation at ${reservation.restaurant} for ${reservation.date} at ${reservation.time} has been ${status}.\n\nThank you for choosing CNC World Tour!`,
      };

      await transporter.sendMail(emailOptions);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Continue execution even if email fails
    }

    res.json({ message: `Reservation ${status} successfully` });
  } catch (error) {
    console.error("Error updating reservation status:", error);
    res.status(500).json({ message: "Server error updating reservation status" });
  }
});

export default router;
