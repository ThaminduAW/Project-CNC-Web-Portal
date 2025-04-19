import express from 'express';
import { 
  getAvailability, 
  addCustomTimeSlot, 
  updateTimeSlot, 
  deleteTimeSlot 
} from '../controllers/availabilityController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get availability for a specific date
router.get('/:restaurantId/:date', verifyToken, getAvailability);

// Add a custom time slot
router.post('/custom', verifyToken, addCustomTimeSlot);

// Update a time slot
router.put('/:id', verifyToken, updateTimeSlot);

// Delete a time slot
router.delete('/:id', verifyToken, deleteTimeSlot);

export default router; 