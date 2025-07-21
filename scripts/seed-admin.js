import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const { Schema } = mongoose;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/3cns';

const args = process.argv.slice(2);
const email = args[0];
const password = args[1];

if (!email || !password) {
  console.error('Please provide both email and password as arguments:');
  console.error('Usage: node seed-admin.js <email> <password>');
  process.exit(1);
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  console.error('Please provide a valid email address');
  process.exit(1);
}

if (password.length < 6) {
  console.error('Password must be at least 6 characters long');
  process.exit(1);
}

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

    const deleteResult = await UserModel.deleteMany({ role: 'admin' });
    if (deleteResult.deletedCount > 0) {
      console.log(`Deleted ${deleteResult.deletedCount} existing admin account(s)`);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await UserModel.create({
      email,
      password: hashedPassword,
      name: 'Admin',
      role: 'admin'
    });

    console.log('New admin account created successfully:', {
      email: admin.email,
      name: admin.name,
      role: admin.role
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin account:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedAdmin(); 