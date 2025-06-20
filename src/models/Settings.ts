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
    index: false,
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

settingsSchema.index({ sipUsername: 1, domain: 1 }, { unique: true });

settingsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

if (mongoose.models.Settings) {
  delete mongoose.models.Settings;
}

export const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema); 