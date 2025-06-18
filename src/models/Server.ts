import mongoose from "mongoose";

const serverSchema = new mongoose.Schema({
  domain: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  wsServer: {
    type: String,
    required: true,
    trim: true,
  },
  wsPort: {
    type: String,
    required: true,
    trim: true,
  },
  wsPath: {
    type: String,
    default: "/",
    trim: true,
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

serverSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const Server = mongoose.models.Server || mongoose.model("Server", serverSchema);
export default Server;