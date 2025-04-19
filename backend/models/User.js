import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  restaurantName: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  url: { type: String, required: true },
  role: { type: String, enum: ["Admin", "Partner"], required: true },
  approved: { type: Boolean, default: false }, // Ensures partners need admin approval
  cuisine: { type: String }, // Type of cuisine served
  rating: { type: Number, default: 0, min: 0, max: 5 }, // Restaurant rating out of 5
  operatingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
