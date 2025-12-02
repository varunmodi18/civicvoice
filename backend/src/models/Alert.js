
const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['info', 'warning', 'urgent'],
      default: 'info',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Only return active alerts that are within date range
alertSchema.statics.getActiveAlerts = async function() {
  const now = new Date();
  const query = {
    isActive: true,
    $or: [
      { endDate: null },
      { endDate: { $gte: now } }
    ]
  };
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(3);
};

module.exports = mongoose.model('Alert', alertSchema);
