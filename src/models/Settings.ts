import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  email:{
    type: String,
    require: true,
  },
  wsServer: {
    type: String,
  },
  wsPort: {
    type: String,
  },
  wsPath: {
    type: String,
  },
  domain: {
    type: String,
  },
  sipUsername: {
    type: String,
    required: true,
    unique: true,
  },
  sipPassword: {
    type: String,
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

settingsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema); 