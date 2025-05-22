const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.post('/', feedbackController.submitFeedback);
router.get('/latest', feedbackController.getLatestFeedbacks);

// Protected routes (admin only)
router.get('/', protect, authorize('admin'), feedbackController.getAllFeedback);
router.get('/category/:category', protect, authorize('admin'), feedbackController.getFeedbackByCategory);

module.exports = router; 