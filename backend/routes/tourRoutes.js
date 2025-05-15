import express from "express";
import Tour from "../models/Tour.js";
import { verifyToken, verifyAdmin, verifyPartner } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all active tours
router.get("/", async (req, res) => {
  try {
    const tours = await Tour.find({ status: 'active' })
      .populate('restaurants.restaurant', 'restaurantName');
    res.json(tours);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get partner's assigned tours
router.get("/partner/:partnerId", verifyToken, async (req, res) => {
  try {
    const tours = await Tour.find({
      'restaurants.restaurant': req.params.partnerId
    }).populate('restaurants.restaurant', 'restaurantName');
    res.json(tours);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get available tours for partners
router.get("/available", verifyToken, verifyPartner, async (req, res) => {
  try {
    // Get the partner's ID from the authenticated user
    const partnerId = req.user._id;

    if (!partnerId) {
      console.error('Partner ID not found in request:', req.user);
      return res.status(400).json({ 
        message: 'Invalid user ID',
        error: 'User ID not found in request'
      });
    }

    console.log('Fetching available tours for partner:', partnerId);

    // Find active tours that don't include this partner
    const tours = await Tour.find({
      status: 'active',
      date: { $gte: new Date() },
      'restaurants.restaurant': { $ne: partnerId }
    })
    .select('title briefDescription date location timeDuration image price maxParticipants currentParticipants')
    .sort({ date: 1 });

    console.log(`Found ${tours.length} available tours`);

    // Format the response with additional calculated fields
    const formattedTours = tours.map(tour => ({
      ...tour.toObject(),
      availableSpots: tour.maxParticipants - tour.currentParticipants,
      isFull: tour.currentParticipants >= tour.maxParticipants
    }));

    res.json(formattedTours);
  } catch (error) {
    console.error('Error in /available endpoint:', error);
    res.status(500).json({ 
      message: 'Failed to fetch available tours',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get single tour by ID
router.get("/:id", async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id)
      .populate('restaurants.restaurant', 'restaurantName address phone email');
    
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }
    
    res.json(tour);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new tour (admin only)
router.post("/", verifyToken, verifyAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }

    const tourData = {
      ...req.body,
      image: `/uploads/tours/${req.file.filename}`,
      restaurants: [] // Initialize with empty restaurants array
    };
    
    const tour = new Tour(tourData);
    const newTour = await tour.save();
    res.status(201).json(newTour);
  } catch (error) {
    if (req.file) {
      const filePath = path.join(__dirname, '..', 'uploads', 'tours', req.file.filename);
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    res.status(400).json({ message: error.message });
  }
});

// Update tour (admin only)
router.put("/:id", verifyToken, verifyAdmin, upload.single('image'), async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    const updateData = {
      ...req.body,
      image: req.file ? `/uploads/tours/${req.file.filename}` : tour.image
    };

    if (req.file && tour.image) {
      const oldImagePath = path.join(__dirname, '..', tour.image);
      fs.unlink(oldImagePath, (err) => {
        if (err && err.code !== 'ENOENT') console.error('Error deleting old image:', err);
      });
    }

    const updatedTour = await Tour.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(updatedTour);
  } catch (error) {
    if (req.file) {
      const filePath = path.join(__dirname, '..', 'uploads', 'tours', req.file.filename);
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    res.status(400).json({ message: error.message });
  }
});

// Update partner's menu for a tour
router.put("/:tourId/menu/:partnerId", verifyToken, async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.tourId);
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    // Find the restaurant in the tour
    const restaurantIndex = tour.restaurants.findIndex(
      r => r.restaurant.toString() === req.params.partnerId
    );

    if (restaurantIndex === -1) {
      return res.status(404).json({ message: 'Restaurant not found in this tour' });
    }

    // Update the menu
    tour.restaurants[restaurantIndex].menu = req.body.menu;
    const updatedTour = await tour.save();

    res.json(updatedTour);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete tour (admin only)
router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    // Delete tour image
    if (tour.image) {
      const imagePath = path.join(__dirname, '..', tour.image);
      fs.unlink(imagePath, (err) => {
        if (err && err.code !== 'ENOENT') console.error('Error deleting image:', err);
      });
    }

    await Tour.findByIdAndDelete(req.params.id);
    res.json({ message: 'Tour deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add partner to tour
router.post("/:tourId/partner", verifyToken, verifyPartner, async (req, res) => {
  try {
    const partnerId = req.user._id;

    if (!partnerId) {
      console.error('Partner ID not found in request:', req.user);
      return res.status(400).json({ 
        message: 'Invalid user ID',
        error: 'User ID not found in request'
      });
    }

    console.log('Adding partner to tour:', { partnerId, tourId: req.params.tourId });

    const tour = await Tour.findById(req.params.tourId);
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    // Check if tour is full
    if (tour.currentParticipants >= tour.maxParticipants) {
      return res.status(400).json({ message: 'Tour is already full' });
    }

    // Check if tour date is in the past
    if (new Date(tour.date) < new Date()) {
      return res.status(400).json({ message: 'Cannot join past tours' });
    }

    // Check if partner is already in the tour
    const isPartnerInTour = tour.restaurants.some(
      r => r.restaurant.toString() === partnerId.toString()
    );

    if (isPartnerInTour) {
      return res.status(400).json({ message: 'Partner is already in this tour' });
    }

    // Add partner to tour and increment current participants
    tour.restaurants.push({
      restaurant: partnerId,
      menu: []
    });
    tour.currentParticipants += 1;

    const updatedTour = await tour.save();
    console.log('Successfully added partner to tour');
    res.json(updatedTour);
  } catch (error) {
    console.error('Error adding partner to tour:', error);
    res.status(400).json({ 
      message: 'Failed to join tour',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Allow partner to leave a tour
router.delete('/:tourId/partner', verifyToken, verifyPartner, async (req, res) => {
  try {
    const partnerId = req.user._id;
    const tour = await Tour.findById(req.params.tourId);
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    // Find the index of the partner in the restaurants array
    const restaurantIndex = tour.restaurants.findIndex(
      r => r.restaurant.toString() === partnerId.toString()
    );

    if (restaurantIndex === -1) {
      return res.status(400).json({ message: 'Partner is not part of this tour' });
    }

    // Remove the partner from the restaurants array
    tour.restaurants.splice(restaurantIndex, 1);
    // Decrement currentParticipants, but not below 0
    tour.currentParticipants = Math.max(0, tour.currentParticipants - 1);

    const updatedTour = await tour.save();
    res.json(updatedTour);
  } catch (error) {
    console.error('Error removing partner from tour:', error);
    res.status(400).json({ message: 'Failed to leave tour', error: error.message });
  }
});

export default router;
