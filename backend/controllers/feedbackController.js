import Feedback from '../models/Feedback.js';

// Submit new feedback
export const submitFeedback = async (req, res) => {
    try {
        const { name, email, rating, category, message } = req.body;

        const feedback = new Feedback({
            name,
            email,
            rating,
            category,
            message,
            status: 'pending' // New feedback starts as pending
        });

        await feedback.save();

        res.status(201).json({
            success: true,
            message: 'Feedback submitted successfully and pending approval',
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
export const getAllFeedback = async (req, res) => {
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
export const getFeedbackByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const feedback = await Feedback.find({ category, status: 'approved' })
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
export const getLatestFeedbacks = async (req, res) => {
    try {
        const feedbacks = await Feedback.find({ status: 'approved' })
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

// Approve feedback
export const approveFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        const feedback = await Feedback.findByIdAndUpdate(
            id,
            { status: 'approved' },
            { new: true }
        );

        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: 'Feedback not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Feedback approved successfully',
            data: feedback
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error approving feedback',
            error: error.message
        });
    }
};

// Reject feedback
export const rejectFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        const feedback = await Feedback.findByIdAndUpdate(
            id,
            { status: 'rejected' },
            { new: true }
        );

        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: 'Feedback not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Feedback rejected successfully',
            data: feedback
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error rejecting feedback',
            error: error.message
        });
    }
}; 