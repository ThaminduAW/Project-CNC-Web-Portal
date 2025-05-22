import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    category: {
        type: String,
        required: true,
        enum: ['general', 'service', 'product', 'experience', 'suggestion']
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Feedback', feedbackSchema); 