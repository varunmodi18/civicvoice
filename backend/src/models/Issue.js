
const mongoose = require('mongoose');

const departmentUpdateSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'in_review', 'completed', 'reopened'],
    },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const issueSchema = new mongoose.Schema(
  {
    issueType: { type: String, required: true },
    location: { type: String, required: true },
    geoLocation: {
      latitude: { type: Number },
      longitude: { type: Number },
      accuracy: { type: Number },
      source: {
        type: String,
        enum: ['device_location', 'map_click', 'manual', 'search'],
      },
    },
    landmark: { type: String },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true,
    },
    description: { type: String, required: true },
    impact: { type: String },
    recurrence: {
      type: String,
      enum: ['new', 'recurring', 'ongoing'],
      default: 'new',
    },
    evidenceUrls: [{ type: String }],
    resolutionEvidence: [{ type: String }],
    contactName: { type: String },
    contactPhone: { type: String },
    contactEmail: { type: String },
    preferredContactMethod: {
      type: String,
      enum: ['phone', 'email', 'none'],
      default: 'none',
    },
    status: {
      type: String,
      enum: ['pending', 'in_review', 'forwarded', 'completed', 'reopened'],
      default: 'pending',
    },
    summary: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    forwardedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    departmentUpdates: [departmentUpdateSchema],
    rating: { 
      type: Number, 
      min: 1, 
      max: 5 
    },
    review: { type: String },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

issueSchema.virtual('publicId').get(function () {
  return `CV-${this._id.toString().slice(-6).toUpperCase()}`;
});

module.exports = mongoose.model('Issue', issueSchema);
