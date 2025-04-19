import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['PROFILE_UPDATE'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  changes: {
    type: Object,
    required: true
  },
  originalData: {
    type: Object,
    required: true
  },
  submittedBy: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Request', requestSchema); 