import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  extensionNumber: {
    type: String,
    required: true,
    unique: true,
  },
  wsServer: String,
  wsPort: String,
  wsPath: String,
  fullName: String,
  domain: String,
  sipUsername: String,
  sipPassword: String,
  vmNumber: String,
  sxServer: String,
  xwPort: String,
  xwPath: String,
  xDomain: String,
  isSTV: {
    type: Boolean,
    default: false,
  },
  chatEngine: {
    type: String,
    default: 'SIP',
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

// Update the updatedAt timestamp before saving
settingsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema); 