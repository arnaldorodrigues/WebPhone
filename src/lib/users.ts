import { User } from '../types/auth';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import UserModel from '@/models/User';

export const createUser = async (extensionNumber: string, password: string, name: string): Promise<Omit<User, 'password'> | null> => {
  await connectDB();
  const hashedPassword = await bcrypt.hash(password, 10);

  const checkDuplication = !!(await findUserByExtensionNumber(extensionNumber));

  if (checkDuplication) {
    return null;
  }
  
  const user = await UserModel.create({
    extensionNumber,
    password: hashedPassword,
    name,
  });

  const userObject = user.toJSON();
  const { password: _, ...userWithoutPassword } = userObject;
  return userWithoutPassword as Omit<User, 'password'>;
};

export const findUserByExtensionNumber = async (extensionNumber: string): Promise<User | null> => {
  await connectDB();
  const user = await UserModel.findOne({ extensionNumber }).lean();
  return user as User | null;
};

export const validatePassword = async (user: User, password: string): Promise<boolean> => {
  // No need to connect DB here, as the user object already comes from the DB
  return bcrypt.compare(password, user.password);
};

export const readAllUsers = async () => {
  return await UserModel.find();
}