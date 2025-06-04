import { User } from '../types/auth';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import UserModel from '@/models/User';

export const createUser = async (email: string, password: string, name: string): Promise<Omit<User, 'password'>> => {
  await connectDB();
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const user = await UserModel.create({
    email,
    password: hashedPassword,
    name,
  });

  const userObject = user.toJSON();
  const { password: _, ...userWithoutPassword } = userObject;
  return userWithoutPassword as Omit<User, 'password'>;
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  await connectDB();
  const user = await UserModel.findOne({ email }).lean();
  return user as User | null;
};

export const validatePassword = async (user: User, password: string): Promise<boolean> => {
  // No need to connect DB here, as the user object already comes from the DB
  return bcrypt.compare(password, user.password);
};

export const readAllUsers = async () => {
  return await UserModel.find();
}