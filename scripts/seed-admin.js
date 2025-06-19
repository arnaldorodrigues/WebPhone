const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { Schema } = mongoose;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/browser_phone';

// Define the User schema
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  settings: {
    type: Schema.Types.ObjectId,
    ref: "Settings",
  },
  contacts: [Schema.Types.ObjectId],
});

const UserModel = mongoose.models.User || mongoose.model("User", userSchema);

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

async function seedAdmin() {
  try {
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await UserModel.findOne({ email: 'admin@3cns.com' });
    if (existingAdmin) {
      console.log('Admin account already exists');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Create admin account
    const hashedPassword = await bcrypt.hash('telemojo', 10);
    const admin = await UserModel.create({
      email: 'admin@3cns.com',
      password: hashedPassword,
      name: 'Admin',
      role: 'admin'
    });

    console.log('Admin account created successfully:', {
      email: admin.email,
      name: admin.name,
      role: admin.role
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin account:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedAdmin(); 