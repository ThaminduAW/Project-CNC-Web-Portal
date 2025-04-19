import mongoose from "mongoose";

const tourSchema = new mongoose.Schema({
  title: { type: String, required: true },
  briefDescription: { type: String, required: true },
  detailedDescription: { type: String, required: true },
  timeDuration: { type: String, required: true }, // e.g., "2 hours", "Half day", "Full day"
  location: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  date: { type: Date, required: true },
  optionalDetails: { type: String },
  partner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['active', 'cancelled', 'completed'],
    default: 'active'
  }
}, { timestamps: true });

const Tour = mongoose.model("Tour", tourSchema);

export default Tour; 