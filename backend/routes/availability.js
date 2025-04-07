import express from 'express';
import Availability from '../models/Availability.js';
import Reservation from '../models/Reservation.js';
import { verifyToken, verifyPartner } from '../middleware/auth.js';

const router = express.Router();

// Get availability for a specific date
router.get('/:restaurantId/:date', async (req, res) => {
  try {
    const { restaurantId, date } = req.params;
    
    // Validate restaurantId
    if (!restaurantId || restaurantId === 'null') {
      return res.status(400).json({ message: 'Invalid restaurant ID' });
    }
    
    let availability = await Availability.findOne({
      restaurantId: restaurantId,
      date: new Date(date)
    });
    
    if (!availability) {
      // Create default time slots with maxCapacity of 1
      const defaultTimeSlots = [
        { startTime: '09:00', endTime: '10:00', maxCapacity: 1, currentBookings: 0, isAvailable: true },
        { startTime: '10:00', endTime: '11:00', maxCapacity: 1, currentBookings: 0, isAvailable: true },
        { startTime: '11:00', endTime: '12:00', maxCapacity: 1, currentBookings: 0, isAvailable: true },
        { startTime: '12:00', endTime: '13:00', maxCapacity: 1, currentBookings: 0, isAvailable: true },
        { startTime: '13:00', endTime: '14:00', maxCapacity: 1, currentBookings: 0, isAvailable: true },
        { startTime: '14:00', endTime: '15:00', maxCapacity: 1, currentBookings: 0, isAvailable: true },
        { startTime: '15:00', endTime: '16:00', maxCapacity: 1, currentBookings: 0, isAvailable: true },
        { startTime: '16:00', endTime: '17:00', maxCapacity: 1, currentBookings: 0, isAvailable: true },
        { startTime: '17:00', endTime: '18:00', maxCapacity: 1, currentBookings: 0, isAvailable: true },
        { startTime: '18:00', endTime: '19:00', maxCapacity: 1, currentBookings: 0, isAvailable: true },
        { startTime: '19:00', endTime: '20:00', maxCapacity: 1, currentBookings: 0, isAvailable: true },
        { startTime: '20:00', endTime: '21:00', maxCapacity: 1, currentBookings: 0, isAvailable: true }
      ];

      availability = new Availability({
        restaurantId: restaurantId,
        date: new Date(date),
        timeSlots: defaultTimeSlots
      });
      
      await availability.save();
    }

    // Get all confirmed reservations for this date
    const confirmedReservations = await Reservation.find({
      restaurant: restaurantId,
      date: new Date(date),
      status: 'confirmed'
    });

    // Update availability based on confirmed reservations
    availability.timeSlots.forEach(slot => {
      const reservationsForSlot = confirmedReservations.filter(
        res => res.timeSlot.startTime === slot.startTime && 
               res.timeSlot.endTime === slot.endTime
      );
      
      slot.currentBookings = reservationsForSlot.length;
      slot.isAvailable = slot.currentBookings < 1;
    });

    // Save the updated availability
    await availability.save();
    
    res.json({ timeSlots: availability.timeSlots });
  } catch (error) {
    console.error('Error in availability route:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create or update availability (Partner only)
router.post('/', verifyToken, verifyPartner, async (req, res) => {
  try {
    const { date, timeSlots } = req.body;
    const partnerId = req.user._id;
    
    // Ensure all time slots have maxCapacity of 1
    const updatedTimeSlots = timeSlots.map(slot => ({
      ...slot,
      maxCapacity: 1
    }));
    
    let availability = await Availability.findOne({
      restaurantId: partnerId,
      date: new Date(date)
    });
    
    if (availability) {
      availability.timeSlots = updatedTimeSlots;
      await availability.save();
    } else {
      availability = new Availability({
        restaurantId: partnerId,
        date: new Date(date),
        timeSlots: updatedTimeSlots
      });
      await availability.save();
    }
    
    res.status(201).json(availability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a specific time slot (Partner only)
router.patch('/:id/slot/:slotId', verifyToken, verifyPartner, async (req, res) => {
  try {
    const { id, slotId } = req.params;
    const { isAvailable } = req.body;
    const partnerId = req.user._id;
    
    const availability = await Availability.findOne({
      _id: id,
      restaurantId: partnerId
    });
    
    if (!availability) {
      return res.status(404).json({ message: 'Availability not found' });
    }
    
    const slot = availability.timeSlots.id(slotId);
    if (!slot) {
      return res.status(404).json({ message: 'Time slot not found' });
    }
    
    // Only allow updating isAvailable, maxCapacity is always 1
    if (isAvailable !== undefined) slot.isAvailable = isAvailable;
    
    await availability.save();
    res.json(availability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 