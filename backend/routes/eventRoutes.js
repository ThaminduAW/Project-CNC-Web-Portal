import express from "express";
import Event from "../models/Event.js"; // Ensure this model is created
import { verifyToken } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import path from 'path';

const router = express.Router();

// Get all events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find({ status: 'active' })
      .populate('partner', 'restaurantName');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get partner's events
router.get("/partner/:partnerId", verifyToken, async (req, res) => {
  try {
    const events = await Event.find({ partner: req.params.partnerId });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single event by ID
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('partner', 'restaurantName address phone email');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new event
router.post("/", verifyToken, upload.single('image'), async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      partner: req.user.id,
      image: req.file ? `/uploads/events/${req.file.filename}` : null
    };
    
    const event = new Event(eventData);
    const newEvent = await event.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update event
router.put("/:id", verifyToken, upload.single('image'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if the user is the event owner
    if (event.partner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    const updateData = {
      ...req.body,
      image: req.file ? `/uploads/events/${req.file.filename}` : event.image
    };

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete event
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if the user is the event owner
    if (event.partner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
