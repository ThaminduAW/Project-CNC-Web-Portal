import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  restaurantName: { type: String },
  address: { type: String },
  phone: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["Admin", "Partner"], required: true },
  approved: { type: Boolean, default: false }, // Ensures partners need admin approval
}, { timestamps: true });

export default mongoose.model("User", userSchema);
