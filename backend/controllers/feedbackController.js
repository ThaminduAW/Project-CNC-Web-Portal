const Feedback = require('../models/Feedback');

// Submit new feedback
exports.submitFeedback = async (req, res) => {
    try {
        const { name, email, rating, category, message } = req.body;

        const feedback = new Feedback({
            name,
            email,
            rating,
            category,
            message
        });

        await feedback.save();

        res.status(201).json({
            success: true,
            message: 'Feedback submitted successfully',
            data: feedback
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error submitting feedback',
            error: error.message
        });
    }
};

// Get all feedback (for admin purposes)
exports.getAllFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.find()
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: feedback.length,
            data: feedback
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving feedback',
            error: error.message
        });
    }
};

// Get feedback by category
exports.getFeedbackByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const feedback = await Feedback.find({ category })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: feedback.length,
            data: feedback
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving feedback',
            error: error.message
        });
    }
};

// Get latest feedbacks for public display
exports.getLatestFeedbacks = async (req, res) => {
    try {
        const feedbacks = await Feedback.find({})
            .sort({ createdAt: -1 })
            .limit(6);
        res.status(200).json({
            success: true,
            data: feedbacks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving feedback',
            error: error.message
        });
    }
}; 