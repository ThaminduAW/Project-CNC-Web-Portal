import mongoose from "mongoose";

const tourSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  date: { type: Date, required: true },
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