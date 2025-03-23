import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  receiver: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  read: { 
    type: Boolean, 
    default: false 
  },
  type: {
    type: String,
    enum: ['text', 'notification'],
    default: 'text'
  }
}, { 
  timestamps: true 
});

const Message = mongoose.model("Message", messageSchema);

export default Message; 