import mongoose from "mongoose";

const negotiationMessageSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  productId: {
    type: String,
    required: true,
    index: true
  },
  productName: {
    type: String,
    required: true
  },
  messages: [{
    role: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: true
    },
    suggestedPrice: {
      type: Number,
      default: null
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  lastActive: {
    type: Date,
    default: Date.now
  },
}, {
  timestamps: true
});

const NegotiationMessage = mongoose.model('NegotiationMessage', negotiationMessageSchema);

export default NegotiationMessage;
