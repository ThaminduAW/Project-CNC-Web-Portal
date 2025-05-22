import Availability from '../models/Availability.js';
import { validateTimeSlot } from '../utils/validators.js';
import Reservation from '../models/Reservation.js';

// Get availability for a specific date
export const getAvailability = async (req, res) => {
  try {
    const { restaurantId, date } = req.params;
    console.log('Getting availability for:', { restaurantId, date });

    // Convert the date string to start and end of the day
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    let availability = await Availability.findOne({
      restaurantId,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    });

    if (!availability) {
      console.log('No availability found, creating default time slots');
      // Create default time slots with configurable hours
      const defaultTimeSlots = [
        { startTime: '09:00', endTime: '10:00', maxCapacity: 1, currentBookings: 0, isAvailable: true, price: 0, description: 'Morning' },
        { startTime: '10:00', endTime: '11:00', maxCapacity: 1, currentBookings: 0, isAvailable: true, price: 0, description: 'Morning' },
        { startTime: '11:00', endTime: '12:00', maxCapacity: 1, currentBookings: 0, isAvailable: true, price: 0, description: 'Lunch' },
        { startTime: '12:00', endTime: '13:00', maxCapacity: 1, currentBookings: 0, isAvailable: true, price: 0, description: 'Lunch' },
        { startTime: '13:00', endTime: '14:00', maxCapacity: 1, currentBookings: 0, isAvailable: true, price: 0, description: 'Lunch' },
        { startTime: '14:00', endTime: '15:00', maxCapacity: 1, currentBookings: 0, isAvailable: true, price: 0, description: 'Afternoon' },
        { startTime: '15:00', endTime: '16:00', maxCapacity: 1, currentBookings: 0, isAvailable: true, price: 0, description: 'Afternoon' },
        { startTime: '16:00', endTime: '17:00', maxCapacity: 1, currentBookings: 0, isAvailable: true, price: 0, description: 'Afternoon' },
        { startTime: '17:00', endTime: '18:00', maxCapacity: 1, currentBookings: 0, isAvailable: true, price: 0, description: 'Dinner' },
        { startTime: '18:00', endTime: '19:00', maxCapacity: 1, currentBookings: 0, isAvailable: true, price: 0, description: 'Dinner' },
        { startTime: '19:00', endTime: '20:00', maxCapacity: 1, currentBookings: 0, isAvailable: true, price: 0, description: 'Dinner' },
        { startTime: '20:00', endTime: '21:00', maxCapacity: 1, currentBookings: 0, isAvailable: true, price: 0, description: 'Dinner' }
      ];

      availability = new Availability({
        restaurantId,
        date: startDate,
        timeSlots: defaultTimeSlots
      });
      
      await availability.save();
      console.log('Created default time slots:', availability);
    }

    // Get all confirmed reservations for this date
    const confirmedReservations = await Reservation.find({
      restaurant: restaurantId,
      date: {
        $gte: startDate,
        $lte: endDate
      },
      status: 'confirmed'
    });

    // Update availability based on confirmed reservations
    availability.timeSlots.forEach(slot => {
      const reservationsForSlot = confirmedReservations.filter(
        res => res.timeSlot.startTime === slot.startTime && 
               res.timeSlot.endTime === slot.endTime
      );
      
      slot.currentBookings = reservationsForSlot.length;
      slot.isAvailable = slot.currentBookings < slot.maxCapacity;
    });

    // Save the updated availability
    await availability.save();

    // Sort time slots by start time
    availability.timeSlots.sort((a, b) => {
      const timeA = new Date(`2000/01/01 ${a.startTime}`).getTime();
      const timeB = new Date(`2000/01/01 ${b.startTime}`).getTime();
      return timeA - timeB;
    });

    console.log('Returning availability:', { 
      totalSlots: availability.timeSlots.length,
      date: availability.date
    });

    res.status(200).json({ 
      timeSlots: availability.timeSlots,
      date: availability.date
    });
  } catch (error) {
    console.error('Error in getAvailability:', error);
    res.status(500).json({ message: error.message });
  }
};

// Add a custom time slot
export const addCustomTimeSlot = async (req, res) => {
  try {
    const { restaurantId, date, timeSlot } = req.body;
    console.log('Adding custom time slot:', { restaurantId, date, timeSlot }); // Debug log

    // Validate request body
    if (!restaurantId || !date || !timeSlot) {
      console.error('Missing required fields:', { restaurantId, date, timeSlot }); // Debug log
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate time slot
    const validationError = validateTimeSlot(timeSlot);
    if (validationError) {
      console.error('Time slot validation error:', validationError); // Debug log
      return res.status(400).json({ message: validationError });
    }

    // Check for time slot conflicts
    const existingAvailability = await Availability.findOne({
      restaurantId,
      date: new Date(date),
      'timeSlots.startTime': timeSlot.startTime,
      'timeSlots.endTime': timeSlot.endTime
    });

    if (existingAvailability) {
      console.error('Time slot conflict found'); // Debug log
      return res.status(400).json({ message: 'Time slot already exists' });
    }

    // Add or update availability
    const availability = await Availability.findOneAndUpdate(
      { restaurantId, date: new Date(date) },
      { 
        $push: { 
          timeSlots: {
            ...timeSlot,
            maxCapacity: timeSlot.maxCapacity || 1,
            currentBookings: 0,
            isAvailable: timeSlot.isAvailable ?? true,
            price: timeSlot.price || 0,
            description: timeSlot.description || ''
          }
        } 
      },
      { upsert: true, new: true }
    );

    console.log('Successfully added time slot:', availability); // Debug log
    res.status(201).json(availability);
  } catch (error) {
    console.error('Error in addCustomTimeSlot:', error); // Debug log
    res.status(500).json({ message: error.message });
  }
};

// Update a time slot
export const updateTimeSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const { timeSlot } = req.body;
    console.log('Updating time slot:', { id, timeSlot }); // Debug log

    // Validate time slot
    const validationError = validateTimeSlot(timeSlot);
    if (validationError) {
      console.error('Time slot validation error:', validationError); // Debug log
      return res.status(400).json({ message: validationError });
    }

    // Find the availability document containing the time slot
    const availability = await Availability.findOne({ 'timeSlots._id': id });
    if (!availability) {
      console.error('Time slot not found:', id); // Debug log
      return res.status(404).json({ message: 'Time slot not found' });
    }

    // Update the time slot
    const updatedAvailability = await Availability.findOneAndUpdate(
      { 'timeSlots._id': id },
      { 
        $set: { 
          'timeSlots.$': {
            ...timeSlot,
            _id: id,
            maxCapacity: timeSlot.maxCapacity || 1,
            currentBookings: timeSlot.currentBookings || 0,
            isAvailable: timeSlot.isAvailable ?? true,
            price: timeSlot.price || 0,
            description: timeSlot.description || ''
          }
        } 
      },
      { new: true }
    );

    console.log('Successfully updated time slot:', updatedAvailability); // Debug log
    res.status(200).json(updatedAvailability);
  } catch (error) {
    console.error('Error in updateTimeSlot:', error); // Debug log
    res.status(500).json({ message: error.message });
  }
};

// Delete a time slot
export const deleteTimeSlot = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Deleting time slot:', id); // Debug log

    // Find and remove the time slot
    const availability = await Availability.findOneAndUpdate(
      { 'timeSlots._id': id },
      { $pull: { timeSlots: { _id: id } } },
      { new: true }
    );

    if (!availability) {
      console.error('Time slot not found for deletion:', id); // Debug log
      return res.status(404).json({ message: 'Time slot not found' });
    }

    console.log('Successfully deleted time slot'); // Debug log
    res.status(200).json({ message: 'Time slot deleted successfully' });
  } catch (error) {
    console.error('Error in deleteTimeSlot:', error); // Debug log
    res.status(500).json({ message: error.message });
  }
}; 