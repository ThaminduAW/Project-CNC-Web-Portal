import express from "express";
import nodemailer from "nodemailer";
import Reservation from "../models/Reservation.js"; // Corrected import
import User from "../models/User.js"; // Fetch partner email
import jwt from "jsonwebtoken";
import Availability from "../models/Availability.js"; // Added import for Availability

const router = express.Router();

// POST - Create a reservation
router.post("/", async (req, res) => {
  const { name, email, contact, restaurant, date, timeSlot, instructions, guestCount, subscribeToPromotions } = req.body;
  console.log("New Reservation Received:", req.body);

  try {
    // Find the partner's email based on the restaurant ID
    const partner = await User.findById(restaurant);
    if (!partner) {
      return res.status(400).json({ message: "Selected restaurant not found." });
    }

    // Check availability for the selected time slot
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const availability = await Availability.findOne({
      restaurantId: restaurant,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    });

    if (!availability) {
      return res.status(400).json({ message: "No availability set for this date." });
    }

    const selectedSlot = availability.timeSlots.find(
      slot => slot.startTime === timeSlot.startTime && slot.endTime === timeSlot.endTime
    );

    if (!selectedSlot) {
      return res.status(400).json({ message: "Selected time slot not available." });
    }

    if (!selectedSlot.isAvailable || selectedSlot.currentBookings >= 1) {
      return res.status(400).json({ message: "Selected time slot is already booked." });
    }

    // Save reservation in database
    const newReservation = new Reservation({ 
      name, 
      email, 
      contact, 
      restaurant: partner._id,
      date: new Date(date),
      timeSlot,
      instructions,
      numberOfGuests: parseInt(guestCount) || 1,
      status: 'pending',
      subscribeToPromotions: subscribeToPromotions || false
    });
    await newReservation.save();

    // Update availability count
    selectedSlot.currentBookings = 1;
    selectedSlot.isAvailable = false;
    await availability.save();

    // Email Configuration
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Pending Notification Email to the Visitor
      const visitorMailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Reservation Request Received - CNC World Tour",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2c3e50; margin: 0;">CNC World Tour</h1>
              <p style="color: #7f8c8d; margin: 5px 0;">Your Global Dining Experience</p>
            </div>
            
            <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #2c3e50; margin-top: 0;">Reservation Request Received</h2>
              
              <p style="color: #34495e; font-size: 16px; line-height: 1.6;">Hello ${name},</p>
              
              <p style="color: #34495e; font-size: 16px; line-height: 1.6;">Your reservation request has been received and is currently pending approval.</p>
              
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <h3 style="color: #2c3e50; margin-top: 0;">Reservation Details</h3>
                <p style="margin: 5px 0;"><strong>Restaurant:</strong> ${partner.restaurantName}</p>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${date}</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> ${timeSlot.startTime} - ${timeSlot.endTime}</p>
                <p style="margin: 5px 0;"><strong>Number of Guests:</strong> ${guestCount}</p>
                <p style="margin: 5px 0;"><strong>Special Instructions:</strong> ${instructions || "None"}</p>
              </div>
              
              <p style="color: #34495e; font-size: 16px; line-height: 1.6;">We will notify you once the restaurant confirms your reservation.</p>
              
              <div style="text-align: center; margin-top: 30px;">
                <p style="color: #7f8c8d; font-size: 14px;">Thank you for choosing CNC World Tour!</p>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #95a5a6; font-size: 12px;">This is an automated message, please do not reply directly to this email.</p>
            </div>
          </div>
        `
      };

      await transporter.sendMail(visitorMailOptions);

      // Email Notification to the Partner
      const partnerMailOptions = {
        from: process.env.EMAIL_USER,
        to: partner.email,
        subject: "New Reservation Request at Your Restaurant",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2c3e50; margin: 0;">CNC World Tour</h1>
              <p style="color: #7f8c8d; margin: 5px 0;">Partner Notification</p>
            </div>
            
            <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #2c3e50; margin-top: 0;">New Reservation Request</h2>
              
              <p style="color: #34495e; font-size: 16px; line-height: 1.6;">Hello ${partner.fullName},</p>
              
              <p style="color: #34495e; font-size: 16px; line-height: 1.6;">A new reservation request has been made at your restaurant.</p>
              
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <h3 style="color: #2c3e50; margin-top: 0;">Reservation Details</h3>
                <p style="margin: 5px 0;"><strong>Customer Name:</strong> ${name}</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                <p style="margin: 5px 0;"><strong>Contact:</strong> ${contact || "Not provided"}</p>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${date}</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> ${timeSlot.startTime} - ${timeSlot.endTime}</p>
                <p style="margin: 5px 0;"><strong>Number of Guests:</strong> ${guestCount}</p>
                <p style="margin: 5px 0;"><strong>Special Instructions:</strong> ${instructions || "None"}</p>
              </div>
              
              <div style="background-color: #e8f4f8; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="color: #2c3e50; margin: 0; font-weight: bold;">Action Required</p>
                <p style="color: #34495e; margin: 5px 0 0 0;">Please review and update the reservation status in your dashboard.</p>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #95a5a6; font-size: 12px;">This is an automated message from CNC World Tour.</p>
            </div>
          </div>
        `
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
      const reservations = await Reservation.find({ date: { $gte: today } }).populate('restaurant', 'restaurantName').sort({ date: 1 });
      return res.json(reservations);
      
    }

    // For admin, return all reservations
    const reservations = await Reservation.find().sort({ date: -1, time: -1 });
    const restaurantIds = reservations.map(reservation => reservation.restaurant);
    const restaurants = await User.find({ _id: { $in: restaurantIds } });
    const reservationsWithRestaurant = reservations.map(reservation => ({
      ...reservation.toObject(),
      restaurant: restaurants.find(restaurant => restaurant._id.toString() === reservation.restaurant.toString())
    }));
    console.log(reservationsWithRestaurant);
    res.json(reservations);
  } catch (error) {
    console.error("Error fetching reservations:", error);
    res.status(500).json({ message: "Server error fetching reservations." });
  }
});

// GET - Fetch partner-specific reservations
router.get("/partner", async (req, res) => {
  try {
    // Get the partner's ID from the authenticated user
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Find the partner by their ID (which should be stored in the token)
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    
    const partner = await User.findById(decodedToken.id);
    
    if (!partner) {
      return res.status(404).json({ message: "Partner not found" });
    }

    // Fetch reservations for the partner's restaurant using the restaurant name
    const reservations = await Reservation.find({ restaurant: partner._id })
      .sort({ date: -1, time: -1 });

    // Format the response to include only necessary fields
    const formattedReservations = reservations.map(reservation => ({
      _id: reservation._id,
      customerName: reservation.name,
      customerEmail: reservation.email,
      date: reservation.date,
      time: reservation.timeSlot.startTime + " - " + reservation.timeSlot.endTime,
      numberOfGuests: reservation.numberOfGuests,
      status: reservation.status,
      instructions: reservation.instructions
    }));

    res.json(formattedReservations);
  } catch (error) {
    console.error("Error in partner route:", error);
    res.status(500).json({ message: "Server error fetching partner reservations" });
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
    if (reservation.restaurant.toString() !== partner._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this reservation" });
    }

    // Update the status
    reservation.status = status;
    await reservation.save();

    // Update availability based on the new status
    if (status === 'confirmed' || status === 'declined') {
      const availability = await Availability.findOne({
        restaurantId: partner._id,
        date: reservation.date
      });

      if (availability) {
        const slot = availability.timeSlots.find(
          s => s.startTime === reservation.timeSlot.startTime && 
               s.endTime === reservation.timeSlot.endTime
        );

        if (slot) {
          if (status === 'confirmed') {
            slot.currentBookings = 1;
            slot.isAvailable = false;
          } else if (status === 'declined') {
            slot.currentBookings = 0;
            slot.isAvailable = true;
          }
          await availability.save();
        }
      }
    }

    // Send email notification to customer about status update
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      let emailSubject, emailHtml;
      
      if (status === 'confirmed') {
        emailSubject = "Reservation Confirmed - CNC World Tour";
        emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2c3e50; margin: 0;">CNC World Tour</h1>
              <p style="color: #7f8c8d; margin: 5px 0;">Your Global Dining Experience</p>
            </div>
            
            <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #27ae60; margin: 0;">Reservation Confirmed!</h2>
              </div>
              
              <p style="color: #34495e; font-size: 16px; line-height: 1.6;">Hello ${reservation.name},</p>
              
              <p style="color: #34495e; font-size: 16px; line-height: 1.6;">Great news! Your reservation has been confirmed.</p>
              
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <h3 style="color: #2c3e50; margin-top: 0;">Reservation Details</h3>
                <p style="margin: 5px 0;"><strong>Restaurant:</strong> ${partner.restaurantName}</p>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${reservation.date}</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> ${reservation.timeSlot.startTime} - ${reservation.timeSlot.endTime}</p>
                <p style="margin: 5px 0;"><strong>Number of Guests:</strong> ${reservation.numberOfGuests}</p>
              </div>
            </div>
          </div>
        `;
      } else if (status === 'declined') {
        emailSubject = "Reservation Declined - CNC World Tour";
        emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2c3e50; margin: 0;">CNC World Tour</h1>
              <p style="color: #7f8c8d; margin: 5px 0;">Your Global Dining Experience</p>
            </div>
            
            <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #e74c3c; margin: 0;">Reservation Declined</h2>
              </div>
              
              <p style="color: #34495e; font-size: 16px; line-height: 1.6;">Hello ${reservation.name},</p>
              
              <p style="color: #34495e; font-size: 16px; line-height: 1.6;">We regret to inform you that your reservation request has been declined.</p>
              
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <h3 style="color: #2c3e50; margin-top: 0;">Reservation Details</h3>
                <p style="margin: 5px 0;"><strong>Restaurant:</strong> ${partner.restaurantName}</p>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${reservation.date}</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> ${reservation.timeSlot.startTime} - ${reservation.timeSlot.endTime}</p>
              </div>
            </div>
          </div>
        `;
      }

      const emailOptions = {
        from: process.env.EMAIL_USER,
        to: reservation.email,
        subject: emailSubject,
        html: emailHtml,
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

// DELETE - Delete a reservation
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
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
    if (reservation.restaurant.toString() !== partner._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this reservation" });
    }

    // Delete the reservation
    await Reservation.findByIdAndDelete(id);

    // Send email notification to customer about cancellation
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
        subject: "Reservation Cancelled - CNC World Tour",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2c3e50; margin: 0;">CNC World Tour</h1>
              <p style="color: #7f8c8d; margin: 5px 0;">Your Global Dining Experience</p>
            </div>
            
            <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #e74c3c; margin: 0;">Reservation Cancelled</h2>
              </div>
              
              <p style="color: #34495e; font-size: 16px; line-height: 1.6;">Hello ${reservation.name},</p>
              
              <p style="color: #34495e; font-size: 16px; line-height: 1.6;">We regret to inform you that your reservation has been cancelled.</p>
              
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <h3 style="color: #2c3e50; margin-top: 0;">Reservation Details</h3>
                <p style="margin: 5px 0;"><strong>Restaurant:</strong> ${partner.restaurantName}</p>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${reservation.date}</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> ${reservation.timeSlot.startTime} - ${reservation.timeSlot.endTime}</p>
              </div>
            </div>
          </div>
        `
      };

      await transporter.sendMail(emailOptions);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Continue execution even if email fails
    }

    res.json({ message: "Reservation deleted successfully" });
  } catch (error) {
    console.error("Error deleting reservation:", error);
    res.status(500).json({ message: "Server error deleting reservation" });
  }
});

export default router;
