import express from 'express';
import { 
    submitFeedback, 
    getLatestFeedbacks, 
    getAllFeedback, 
    getFeedbackByCategory,
    approveFeedback,
    rejectFeedback,
    deleteFeedback
} from '../controllers/feedbackController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/', submitFeedback);
router.get('/latest', getLatestFeedbacks);
router.get('/approved', getLatestFeedbacks);

// Protected routes (admin only)
router.get('/', protect, authorize('admin'), getAllFeedback);
router.get('/category/:category', protect, authorize('admin'), getFeedbackByCategory);
router.put('/:id/approve', protect, authorize('admin'), approveFeedback);
router.put('/:id/reject', protect, authorize('admin'), rejectFeedback);
router.delete('/:id', protect, authorize('admin'), deleteFeedback);

export default router; 