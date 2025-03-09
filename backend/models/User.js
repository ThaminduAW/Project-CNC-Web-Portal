import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  restaurantName: { type: String },
  address: { type: String },
  phone: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "Partner" },
  approved: { type: Boolean, default: false },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;
