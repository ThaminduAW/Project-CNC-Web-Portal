import express from "express";
import Tour from "../models/Tour.js";
import { verifyToken } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import path from 'path';

const router = express.Router();

// Get all tours
router.get("/", async (req, res) => {
  try {
    const tours = await Tour.find({ status: 'active' })
      .populate('partner', 'restaurantName');
    res.json(tours);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get partner's tours
router.get("/partner/:partnerId", verifyToken, async (req, res) => {
  try {
    const tours = await Tour.find({ partner: req.params.partnerId });
    res.json(tours);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single tour by ID
router.get("/:id", async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id)
      .populate('partner', 'restaurantName address phone email');
    
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }
    
    res.json(tour);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new tour
router.post("/", verifyToken, upload.single('image'), async (req, res) => {
  try {
    const tourData = {
      ...req.body,
      partner: req.user.id,
      image: req.file ? `/uploads/tours/${req.file.filename}` : null
    };
    
    const tour = new Tour(tourData);
    const newTour = await tour.save();
    res.status(201).json(newTour);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update tour
router.put("/:id", verifyToken, upload.single('image'), async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    // Check if the user is the tour owner
    if (tour.partner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this tour' });
    }

    const updateData = {
      ...req.body,
      image: req.file ? `/uploads/tours/${req.file.filename}` : tour.image
    };

    const updatedTour = await Tour.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(updatedTour);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete tour
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }
    
    // Check if the user is the tour owner
    if (tour.partner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this tour' });
    }

    await Tour.findByIdAndDelete(req.params.id);
    res.json({ message: 'Tour deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
