import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema({
  restaurantId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  timeSlots: [{
    startTime: { 
      type: String, 
      required: true 
    },
    endTime: { 
      type: String, 
      required: true 
    },
    maxCapacity: { 
      type: Number, 
      required: true 
    },
    currentBookings: { 
      type: Number, 
      default: 0 
    },
    isAvailable: { 
      type: Boolean, 
      default: true 
    }
  }]
}, { timestamps: true });

// Index for faster queries
availabilitySchema.index({ restaurantId: 1, date: 1 });

const Availability = mongoose.model("Availability", availabilitySchema);

export default Availability; 