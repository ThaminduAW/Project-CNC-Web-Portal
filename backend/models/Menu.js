import mongoose from "mongoose";

const menuSchema = new mongoose.Schema({
  partner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tour: { type: mongoose.Schema.Types.ObjectId, ref: "Tour", required: true },
  name: { type: String, required: true }, // Service name
  description: { type: String, required: true }, // Detailed description of the service
  category: { 
    type: String, 
    enum: ['basic', 'premium', 'custom'],
    default: 'basic'
  },
  portionPrice: { type: Number, required: true }, // Price per portion
  cookingTime: { type: String, required: true }, // Estimated cooking time
  maxFoodPerOrder: { type: Number, default: 1 }, // Maximum number of portions per order
  includes: [{ type: String }] // What's included in the service
}, { timestamps: true });

export default mongoose.model("Menu", menuSchema); 
