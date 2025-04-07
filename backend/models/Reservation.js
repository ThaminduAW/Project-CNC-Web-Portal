import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  contact: { type: String },
  restaurant: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  date: { type: Date, required: true },
  timeSlot: {
    startTime: { type: String, required: true },
    endTime: { type: String, required: true }
  },
  instructions: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'declined', 'completed'],
    default: 'pending'
  },
  numberOfGuests: { type: Number, default: 1 }
}, { timestamps: true });

// Index for faster queries
reservationSchema.index({ restaurant: 1, date: 1 });

const Reservation = mongoose.model("Reservation", reservationSchema);

export default Reservation;
