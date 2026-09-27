import mongoose from 'mongoose';

const premiumNoteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    default: 'Untitled Note'
  },
  content: {
    type: String,
    default: ''
  },
  date: {
    type: String,
    required: true,
    unique: true
  },
  images: [{
    type: String
  }],
  diagrams: [{
    type: String
  }],
  canvasBlobUrl: {
    type: String,
    default: ''
  },
  canvasBlobPath: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

premiumNoteSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export const PremiumNote = mongoose.model('PremiumNote', premiumNoteSchema);
