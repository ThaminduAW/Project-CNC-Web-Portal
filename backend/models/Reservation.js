import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  contact: { type: String },
  restaurant: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  instructions: { type: String },
}, { timestamps: true });

const Reservation = mongoose.model("Reservation", reservationSchema);

export default Reservation;
