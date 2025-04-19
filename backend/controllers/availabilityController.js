import Availability from '../models/Availability.js';
import { validateTimeSlot } from '../utils/validators.js';

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

    const availability = await Availability.findOne({
      restaurantId,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    });

    if (!availability) {
      console.log('No availability found, returning empty array');
      return res.status(200).json({ timeSlots: [] });
    }

    // Filter out unavailable and fully booked slots
    const availableTimeSlots = availability.timeSlots.filter(slot => 
      slot.isAvailable && slot.currentBookings < slot.maxCapacity
    );

    // Sort time slots by start time
    availableTimeSlots.sort((a, b) => {
      const timeA = new Date(`2000/01/01 ${a.startTime}`).getTime();
      const timeB = new Date(`2000/01/01 ${b.startTime}`).getTime();
      return timeA - timeB;
    });

    console.log('Found availability:', { 
      totalSlots: availability.timeSlots.length,
      availableSlots: availableTimeSlots.length 
    });

    res.status(200).json({ 
      timeSlots: availableTimeSlots,
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