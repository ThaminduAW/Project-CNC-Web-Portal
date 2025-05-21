import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: function() { return this.role === "Admin" } },
  lastName: { type: String, required: function() { return this.role === "Admin" } },
  fullName: { type: String, required: function() { return this.role === "Partner" } },
  restaurantName: { type: String, required: function() { return this.role === "Partner" } },
  address: { type: String, required: function() { return this.role === "Partner" } },
  phone: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  url: { type: String, required: function() { return this.role === "Partner" } },
  role: { type: String, enum: ["Admin", "Partner"], required: true },
  approved: { type: Boolean, default: false }, // Ensures partners need admin approval
  cuisine: { type: String }, // Type of cuisine served
  rating: { type: Number, default: 0, min: 0, max: 5 }, // Restaurant rating out of 5
  restaurantPhoto: { type: String }, // URL to the restaurant photo
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },
  resetOTP: {
    type: String,
    default: null
  },
  resetOTPExpiry: {
    type: Date,
    default: null
  },
  operatingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  // New fields for restaurant details
  about: { type: String },
  features: [{
    name: String,
    description: String,
    icon: String
  }],
  cookingServices: [{
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    duration: { type: String, required: true },
    maxParticipants: { type: Number, default: 1 },
    includes: [String],
    category: {
      type: String,
      enum: ['basic', 'premium', 'custom'],
      default: 'basic'
    }
  }]
}, { timestamps: true });

export default mongoose.model("User", userSchema);
