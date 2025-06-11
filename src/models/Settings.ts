import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  email:{
    type: String,
    require: true,
  },
  wsServer: {
    type: String,
    // required: true,
  },
  wsPort: {
    type: String,
    // required: true,
  },
  wsPath: {
    type: String,
    // default: '/',
  },
  domain: {
    type: String,
    // required: true,
  },
  sipUsername: {
    type: String,
    required: true,
    unique: true,
  },
  sipPassword: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create unique index for sipUsername
settingsSchema.index({ sipUsername: 1 }, { unique: true });

// Update the updatedAt timestamp before saving
settingsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema); 