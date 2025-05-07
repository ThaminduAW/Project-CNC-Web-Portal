import mongoose from "mongoose";

const menuSchema = new mongoose.Schema({
  partner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tour: { type: mongoose.Schema.Types.ObjectId, ref: "Tour", required: true },
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: String,
  image: String // Store image URL or path
}, { timestamps: true });

export default mongoose.model("Menu", menuSchema); 
