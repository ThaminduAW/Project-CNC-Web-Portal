import express from 'express';
import { submitFeedback, getLatestFeedbacks, getAllFeedback, getFeedbackByCategory } from '../controllers/feedbackController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/', submitFeedback);
router.get('/latest', getLatestFeedbacks);

// Protected routes (admin only)
router.get('/', protect, authorize('admin'), getAllFeedback);
router.get('/category/:category', protect, authorize('admin'), getFeedbackByCategory);

export default router; 